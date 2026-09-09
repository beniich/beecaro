import { Router } from 'express';
import { authGoogle, getMe, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/google', authGoogle);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
