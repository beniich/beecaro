import { Router } from 'express';
import { 
  verifyGoogleToken, 
  findUserById, 
  updateUser 
} from '../services/auth.service';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rateLimiter';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const authRouter = Router();

authRouter.use(rateLimiter({ windowMs: 60 * 1000, maxRequests: 40 }));
authRouter.use(auditMiddleware('AUTH'));

// Google OAuth 2.0 Sign-in
authRouter.post('/google', async (req, res) => {
  try {
    const { token, idToken, profile } = req.body;
    const effectiveToken = token || idToken;

    const authResult = await verifyGoogleToken(effectiveToken, profile);
    res.json({
      success: true,
      token: authResult.token,
      user: authResult.user,
    });
  } catch (error: any) {
    console.error('[API Auth] Google sign-in failure:', error.message);
    res.status(401).json({ success: false, error: error.message || 'Authentification Google échouée' });
  }
});

// Current User profile
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    const user = await findUserById(req.user.userId);
    res.json({
      user: user || req.user,
      authenticated: true,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
authRouter.put('/profile', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    const updated = await updateUser(req.user.userId, req.body);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
