const router = require('express').Router();
const ctrl = require('../controllers/bim.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireFeature } = require('../middleware/billing.middleware');

// Configurer multer si dispo, sinon fallback simple
let upload = { single: () => (req, res, next) => next() };
try {
  const multer = require('multer');
  upload = multer({ storage: multer.memoryStorage() });
} catch (e) {
  // Multer non installe
}

router.use(authMiddleware, requireFeature('bim'));

router.post('/upload', upload.single('file'), ctrl.uploadModel);
router.get('/building/:buildingId', ctrl.getBuildingModels);
router.get('/model/:id', ctrl.getModelDetails);
router.post('/link', ctrl.linkAsset);

module.exports = router;
