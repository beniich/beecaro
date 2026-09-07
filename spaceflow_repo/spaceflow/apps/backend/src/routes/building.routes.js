const router = require('express').Router();
const ctrl = require('../controllers/building.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { paginationMiddleware } = require('../middleware/pagination.middleware');

router.use(authMiddleware);

router.get('/', paginationMiddleware, ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
