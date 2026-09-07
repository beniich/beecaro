const router = require('express').Router();
const ctrl = require('../controllers/ticket.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkQuota } = require('../middleware/billing.middleware');

router.use(authMiddleware);

// Stats & Dashboard
router.get('/stats', ctrl.getStats);

// CRUD
router.get('/',     ctrl.getAll);
router.post('/',    checkQuota('tickets'), ctrl.create);
router.get('/:id',  ctrl.getOne);
router.put('/:id',  ctrl.update);

// Actions métier
router.post('/:id/qa',       ctrl.submitQA);
router.post('/:id/comments', ctrl.addComment);

module.exports = router;
