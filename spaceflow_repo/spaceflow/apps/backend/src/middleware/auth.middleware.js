const { verifyFirebaseToken } = require('../services/firebase-admin.service');
const { prisma } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // --- BYPASS POUR LE DASHBOARD LOCAL / DEMO ---
    const isProduction = process.env.NODE_ENV === 'production';
    const bypassEnabled = process.env.ALLOW_DEMO_BYPASS === 'true';

    if (idToken === 'jwt-demo-token' || idToken === 'jwt-local-tarik-offline') {
      if (isProduction || !bypassEnabled) {
        console.warn(`[AUTH] Tentative d'utilisation de bypass en ${process.env.NODE_ENV}`);
        return res.status(401).json({ 
          error: 'BYPASS_DISABLED',
          message: 'Demo bypass disabled in this environment'
        });
      }
      
      const bypassUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (bypassUser) {
        req.user = bypassUser;
        return next();
      }
    }
    // ---------------------------------------------

    // 1. Vérifie le token Firebase (identité)
    const decoded = await verifyFirebaseToken(idToken);

    // 2. Récupère le rôle réel depuis Prisma (source unique de vérité)
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true, role: true, email: true, tenantId: true }
    });

    if (!user) {
      return res.status(403).json({ error: 'Utilisateur non provisionné' });
    }

    req.user = user; // { id, role, email } — vient de Prisma, jamais de Firebase
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé pour ce rôle' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
