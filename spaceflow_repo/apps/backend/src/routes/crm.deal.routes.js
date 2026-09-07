const router = require('express').Router();
const ctrl = require('../controllers/crm.deal.controller');
const { crmAuthMiddleware } = require('../middleware/crm.auth.middleware');
const { auditMiddleware } = require('../middleware/audit.middleware');

router.use(crmAuthMiddleware);
router.use(auditMiddleware('CRM_DEAL'));

router.get('/pipeline', ctrl.getPipeline);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.post('/bulk', ctrl.bulkUpdate);
router.put('/:id', ctrl.update);
router.patch('/:id/stage', ctrl.updateStage);
router.delete('/:id', ctrl.remove);

module.exports = router;
