import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, findUserById, memoryUsers } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    subscriptionStatus: string;
    plan?: string;
  };
}

/**
 * Authentication Middleware: decodes Bearer token or attaches default user
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Verify internal JWT
  const decoded = verifyJwtToken(token);
  if (decoded) {
    // Check if user still exists and get latest subscription status
    const freshUser = await findUserById(decoded.userId);
    req.user = {
      userId: decoded.userId,
      email: freshUser?.email || decoded.email,
      role: freshUser?.role || decoded.role,
      subscriptionStatus: freshUser?.subscriptionStatus || decoded.subscriptionStatus,
      plan: freshUser?.plan || decoded.plan
    };
    return next();
  }

  // 2. Token invalid
  return res.status(401).json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
}

/**
 * Subscription Gate Middleware: Verifies Active or Grace-Period status
 */
export function checkSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }

  const { subscriptionStatus, role } = req.user;

  // SuperAdmins, Admins, and Active Subscribers always have access
  if (role === 'ADMIN' || role === 'SuperAdmin' || role === 'admin') {
    return next();
  }

  if (subscriptionStatus === 'active') {
    return next();
  }

  // Grace period: past_due allows temporary access with warning header
  if (subscriptionStatus === 'past_due') {
    res.setHeader('X-Subscription-Warning', 'Grace period active. Please update payment method.');
    return next();
  }

  return res.status(403).json({
    error: 'Plan Pro requis pour cette fonctionnalité.',
    code: 'PRO_SUBSCRIPTION_REQUIRED',
    currentStatus: subscriptionStatus,
    upgradeUrl: '/pricing'
  });
}

/**
 * Role-Based Access Control Middleware
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }

    const userRole = req.user.role?.toUpperCase();
    const isAllowed = allowedRoles.map(r => r.toUpperCase()).includes(userRole);

    if (!isAllowed && userRole !== 'SUPERADMIN' && userRole !== 'ADMIN') {
      return res.status(403).json({
        error: `Accès refusé. Rôle requis: ${allowedRoles.join(', ')}`,
        currentRole: req.user.role
      });
    }

    next();
  };
}
