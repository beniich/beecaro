const router = require('express').Router();
const ctrl = require('../controllers/digitaltwin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/twins', ctrl.getTwins);
router.get('/overview/:buildingId', ctrl.getBuildingOverview);
router.post('/:id/snapshot', ctrl.captureSnapshot);
router.post('/:id/simulate', ctrl.runSimulation);
router.get('/:id/snapshots', ctrl.getSnapshots);

module.exports = router;
