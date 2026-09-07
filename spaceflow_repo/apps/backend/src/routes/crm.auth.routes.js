const router = require('express').Router();
const ctrl = require('../controllers/crm.auth.controller');
const { crmAuthMiddleware } = require('../middleware/crm.auth.middleware');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/firebase', ctrl.firebaseLogin); // Google OAuth via Firebase
router.get('/me', crmAuthMiddleware, ctrl.me);
router.get('/dashboard', crmAuthMiddleware, ctrl.getDashboard);

module.exports = router;
