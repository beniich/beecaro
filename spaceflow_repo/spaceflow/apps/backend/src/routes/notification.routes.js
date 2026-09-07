const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/subscribe', ctrl.subscribe);
router.get('/', ctrl.getNotifications);
router.put('/:id/read', ctrl.markAsRead);
router.get('/preferences', ctrl.getPreferences);
router.put('/preferences', ctrl.updatePreferences);

module.exports = router;
