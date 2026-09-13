import { Request, Response } from 'express';
import { z } from 'zod';
import { verifyGoogleToken, findUserById, updateUser } from '../services/auth.service';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// --- Validation Schemas ---

const googleAuthSchema = z.object({
  token: z.string().optional(),
  idToken: z.string().optional(),
  profile: z.object({
    email: z.string().email().optional(),
    name: z.string().max(200).optional(),
    photoUrl: z.string().url().optional(),
    sub: z.string().optional(),
  }).optional(),
}).refine(data => data.token || data.idToken, {
  message: 'Un token Google (token ou idToken) est requis.',
});

/** Whitelist: seuls name et photoUrl sont modifiables par l'utilisateur */
const updateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  photoUrl: z.string().url().optional(),
}).strict(); // .strict() rejette tout champ non listé (role, subscriptionStatus, plan, etc.)

// --- Controllers ---

export const authGoogle = async (req: Request, res: Response) => {
  try {
    const parsed = googleAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Données d\'authentification invalides',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { token, idToken, profile } = parsed.data;
    const effectiveToken = (token || idToken)!;
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

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Données de profil invalides',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const updated = await updateUser(req.user.userId, parsed.data);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
