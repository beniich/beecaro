const router = require('express').Router();
const ctrl = require('../controllers/asset.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkQuota } = require('../middleware/billing.middleware');

router.use(authMiddleware);
router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', checkQuota('assets'), ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
