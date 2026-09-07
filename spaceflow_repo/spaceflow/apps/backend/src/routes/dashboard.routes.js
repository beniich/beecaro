const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/kpis', ctrl.getKPIs);
router.get('/live', ctrl.getLiveStats);

module.exports = router;
