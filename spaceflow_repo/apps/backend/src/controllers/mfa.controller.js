/**
 * Contrôleur MFA / 2FA — TOTP (Time-Based One-Time Password)
 * Flow:
 *   1. POST /api/auth/mfa/setup      → Génère secret + QR code
 *   2. POST /api/auth/mfa/verify     → Vérifie le code TOTP et active le MFA
 *   3. POST /api/auth/mfa/disable    → Désactive le MFA (auth complète requise)
 *   4. POST /api/auth/mfa/challenge  → Valide le code TOTP lors du login
 */
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Étape 1 : Générer le secret TOTP et retourner le QR code
exports.setupMFA = async (req, res) => {
  try {
    const userId = req.user.id;

    const secret = speakeasy.generateSecret({
      name: `BeeCarbonat (${req.user.email})`,
      length: 32,
    });

    // Stocker temporairement le secret (non activé tant que verify n'est pas appelé)
    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret.base32, mfaEnabled: false },
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    logger.info({ userId }, 'MFA setup initiated');

    res.json({
      message: 'Scannez ce QR code avec votre application d\'authentification',
      qrCode: qrCodeDataUrl,
      manualKey: secret.base32,
    });
  } catch (error) {
    logger.error({ err: error }, 'MFA setup failed');
    res.status(500).json({ error: 'Erreur lors de la configuration MFA' });
  }
};

// Étape 2 : Vérifier le premier code TOTP et activer le MFA
exports.verifyMFA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaSecret: true },
    });

    if (!user?.mfaSecret) {
      return res.status(400).json({ error: 'MFA non configuré. Appelez /setup d\'abord.' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1, // tolérance de ±30s
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Code invalide ou expiré' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    logger.info({ userId }, 'MFA activé avec succès');
    res.json({ success: true, message: 'Authentification à deux facteurs activée !' });

  } catch (error) {
    logger.error({ err: error }, 'MFA verify failed');
    res.status(500).json({ error: 'Erreur lors de la vérification MFA' });
  }
};

// Étape 3 : Désactiver le MFA
exports.disableMFA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaSecret: true, mfaEnabled: true },
    });

    if (!user?.mfaEnabled) {
      return res.status(400).json({ error: 'MFA n\'est pas activé' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Code invalide. Désactivation refusée.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null },
    });

    logger.info({ userId }, 'MFA désactivé');
    res.json({ success: true, message: 'MFA désactivé avec succès' });

  } catch (error) {
    logger.error({ err: error }, 'MFA disable failed');
    res.status(500).json({ error: 'Erreur lors de la désactivation MFA' });
  }
};

// Étape 4 : Valider le code TOTP lors du login (challenge)
exports.challengeMFA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'userId et code sont requis' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, tenantId: true, mfaSecret: true, mfaEnabled: true },
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({ error: 'Utilisateur introuvable ou MFA non activé' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      logger.warn({ userId }, 'MFA challenge échoué');
      return res.status(401).json({ error: 'Code MFA invalide' });
    }

    const { generateTokens } = require('../lib/jwt');
    const tokens = await generateTokens(user);

    logger.info({ userId }, 'MFA challenge réussi — tokens émis');
    res.json({ success: true, ...tokens, user: { id: user.id, email: user.email, role: user.role } });

  } catch (error) {
    logger.error({ err: error }, 'MFA challenge failed');
    res.status(500).json({ error: 'Erreur lors du challenge MFA' });
  }
};
