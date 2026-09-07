const router = require('express').Router();
const ctrl = require('../controllers/workorder.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);

module.exports = router;
