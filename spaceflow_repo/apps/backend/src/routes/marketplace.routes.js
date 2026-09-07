/**
 * marketplace.routes.js — API Marketplace Extensions (Horizon 4)
 */
const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const marketplaceService = require('../services/marketplace/marketplace.service');

router.use(authMiddleware);

// GET /marketplace/extensions — liste du catalogue
router.get('/extensions', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const result = await marketplaceService.listExtensions({
      category, search, page: Number(page), limit: Number(limit)
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /marketplace/installed — extensions installées du tenant
router.get('/installed', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const installed = await marketplaceService.getInstalledExtensions(tenantId);
    res.json({ installed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /marketplace/extensions/:id/install
router.post('/extensions/:id/install', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const install = await marketplaceService.installExtension(tenantId, req.params.id, req.body?.config || {});
    res.status(201).json({ install });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /marketplace/extensions/:id/uninstall
router.post('/extensions/:id/uninstall', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    await marketplaceService.uninstallExtension(tenantId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /marketplace/submit — soumettre une extension (partenaires)
router.post('/submit', async (req, res) => {
  try {
    const ext = await marketplaceService.submitExtension(req.body);
    res.status(201).json({ extension: ext, message: 'Extension soumise pour review. Délai de validation : 5-10 jours ouvrés.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
