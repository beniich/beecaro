const bcrypt = require('bcryptjs');
const { generateTokens } = require('../lib/jwt');

const { z } = require('zod');
const logger = require('../utils/logger');
// Note: logger will be implemented in phase 1, using console for now if missing

exports.signup = async (req, res) => {
  try {
    const validated = req.body;
    
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email },
          ...(validated.firebaseUid ? [{ firebaseUid: validated.firebaseUid }] : []),
        ],
      },
    });
    
    if (existing) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
    }
    
    let role = 'VIEWER';
    let tenantId = null;
    
    if (validated.invitationToken) {
      const invitation = await prisma.invitation.findUnique({
        where: { token: validated.invitationToken },
        include: { tenant: true },
      });
      
      if (!invitation || invitation.expiresAt < new Date() || invitation.usedAt) {
        return res.status(400).json({ error: 'Invitation invalide ou expirée.' });
      }
      
      role = invitation.role;
      tenantId = invitation.tenantId;
      
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });
    } else {
      const newTenant = await prisma.tenant.create({
        data: {
          name: `${validated.fullName || validated.firstName || 'User'}'s Organization`,
          slug: validated.email.split('@')[0] + '-' + Date.now(),
        },
      });
      tenantId = newTenant.id;
      role = 'ADMIN'; 
    }
    
    const passwordHash = validated.password 
      ? await bcrypt.hash(validated.password, 12) 
      : await bcrypt.hash(Math.random().toString(), 12);
    
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        fullName: validated.fullName || `${validated.firstName || ''} ${validated.lastName || ''}`.trim() || 'User',
        passwordHash,
        firebaseUid: validated.firebaseUid,
        role,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
      },
    });
    
    const tokens = await generateTokens(user);
    
    res.status(201).json({ success: true, user, ...tokens });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (!process.env.JWT_SECRET) {
      console.error('[AUTH CRITICAL] JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ error: 'Configuration serveur invalide' });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

    const tokens = await generateTokens(user);
    res.json({
      user: {
        id: user.id, email: user.email, fullName: user.fullName,
        role: user.role
      },
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Token Firebase manquant' });
    }
    let email, name, uid, picture;
    try {
      const { verifyFirebaseToken } = require('../services/firebase-admin.service');
      const decoded = await verifyFirebaseToken(idToken);
      if (decoded) {
        email = decoded.email;
        name = decoded.name;
        uid = decoded.uid;
        picture = decoded.picture;
      }
    } catch {
      // Fallback
    }
    if (!email) {
      const jwtDecoded = jwt.decode(idToken);
      if (!jwtDecoded || !jwtDecoded.email) {
        return res.status(401).json({ error: 'Jeton Firebase invalide' });
      }
      email = jwtDecoded.email;
      name = jwtDecoded.name || jwtDecoded.email.split('@')[0];
      uid = jwtDecoded.sub || jwtDecoded.user_id;
      picture = jwtDecoded.picture;
    }
    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      const dummyPassword = await bcrypt.hash('firebase-auth-' + Math.random(), 10);
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: dummyPassword,
          fullName: name || 'Google User',
          firebaseUid: uid,
          role: 'VIEWER',
          tenantId: 'demo-tenant', // fallback if needed, but really should be handled properly
          isActive: true
        }
      });
    }
    const tokens = await generateTokens(user);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token manquant' });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' });
    }

    // Rotation du token (suppression de l'ancien)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Générer une nouvelle paire
    const tokens = await generateTokens(storedToken.user);

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors du rafraîchissement du token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revokedAt: new Date() }
      }).catch(() => {}); // ignorer si le token n'existe pas
    }
    res.json({ success: true, message: 'Déconnecté avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, fullName: true,
        role: true, createdAt: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dummy implementations for new endpoints
exports.forgotPassword = async (req, res) => {
  res.json({ success: true, message: "Si l'email existe, un lien a été envoyé." });
};

exports.verifyEmail = async (req, res) => {
  res.json({ success: true, message: "Email vérifié avec succès." });
};

exports.resendVerification = async (req, res) => {
  res.json({ success: true, message: "Email renvoyé avec succès." });
};

// Demo endpoint
exports.demoLogin = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const bypassEnabled = process.env.ALLOW_DEMO_BYPASS === 'true';

    if (isProduction || !bypassEnabled) {
      console.warn(`[AUTH] Tentative de connexion demo en ${process.env.NODE_ENV}`);
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Demo mode not available' 
      });
    }

    const demoToken = jwt.sign(
      {
        sub: 'demo-user',
        email: 'demo@BeeCarbonat.com',
        role: 'VIEWER',
        isDemo: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token: demoToken,
      user: {
        email: 'demo@BeeCarbonat.com',
        name: 'Demo User',
        role: 'VIEWER',
        isDemo: true,
        expiresIn: '2h'
      },
      warning: 'Ce token donne accès à des données de démonstration anonymisées uniquement.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
