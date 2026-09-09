import { Request, Response } from 'express';
import { verifyGoogleToken, findUserById, updateUser } from '../services/auth.service';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authGoogle = async (req: Request, res: Response) => {
  try {
    const { token, idToken, profile } = req.body;
    const effectiveToken = token || idToken;
    const authResult = await verifyGoogleToken(effectiveToken, profile);
    res.json({
      success: true,
      token: authResult.token,
      user: authResult.user
    });
  } catch (error: any) {
    console.error('[API Auth] Google sign-in failure:', error.message);
    res.status(401).json({ success: false, error: error.message || 'Authentification Google échouée' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    const user = await findUserById(req.user.userId);
    res.json({
      user: user || req.user,
      authenticated: true
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    const updated = await updateUser(req.user.userId, req.body);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
