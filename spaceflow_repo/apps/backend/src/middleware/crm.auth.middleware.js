const { verifyFirebaseToken } = require('../services/firebase-admin.service');
const { prisma } = require('../config/database');

/**
 * Middleware d'authentification pour le module CRM SaaS.
 * Injecte req.crm = { userId, organizationId, role }
 */
exports.crmAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant (CRM)' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await verifyFirebaseToken(idToken);
    
    const user = await prisma.cRMUser.findUnique({
      where: { email: decoded.email },
      select: { id: true, organizationId: true, role: true }
    });

    if (!user) {
       return res.status(403).json({ error: 'Utilisateur CRM non provisionné' });
    }

    req.crm = { userId: user.id, organizationId: user.organizationId, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide (CRM)' });
  }
};
