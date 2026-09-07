const router = require('express').Router();
const ctrl = require('../controllers/mfa.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { z } = require('zod');

const codeSchema = z.object({ code: z.string().length(6).regex(/^\d+$/, 'Code 6 chiffres requis') });
const challengeSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6).regex(/^\d+$/)
});

// Routes protégées (utilisateur connecté)
router.post('/setup', authMiddleware, ctrl.setupMFA);
router.post('/verify', authMiddleware, validate(codeSchema), ctrl.verifyMFA);
router.post('/disable', authMiddleware, validate(codeSchema), ctrl.disableMFA);

// Route publique (step 2 du login quand MFA activé)
router.post('/challenge', validate(challengeSchema), ctrl.challengeMFA);

module.exports = router;
