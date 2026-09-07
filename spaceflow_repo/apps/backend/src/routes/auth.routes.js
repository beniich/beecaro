const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const schemas = require('../schemas/auth.schemas');

router.post('/signup', validate(schemas.signupSchema), ctrl.signup);
router.post('/login', validate(schemas.loginSchema), ctrl.login);
router.post('/firebase', validate(schemas.firebaseLoginSchema), ctrl.firebaseLogin);
router.post('/refresh', validate(schemas.refreshSchema), ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authMiddleware, ctrl.getProfile);

// Nouvelles routes
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/resend-verification', ctrl.resendVerification);
router.post('/demo', ctrl.demoLogin);

module.exports = router;
