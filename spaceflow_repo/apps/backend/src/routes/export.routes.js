const router = require('express').Router();
const ctrl = require('../controllers/export.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/workorder/:id/pdf', ctrl.exportWorkOrderPdf);
router.get('/inventory/pdf', ctrl.exportInventoryPdf);

module.exports = router;
