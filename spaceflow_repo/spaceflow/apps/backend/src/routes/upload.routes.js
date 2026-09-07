const express = require('express');
const router = express.Router();
const s3Service = require('../services/s3.service');
const { authMiddleware } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { tenantContext } = require('../config/database');

router.post('/presigned-url', authMiddleware, tenantMiddleware, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' });
    }

    const tenantId = tenantContext.getStore();
    if (!tenantId) {
      return res.status(403).json({ error: 'Tenant context required' });
    }

    const result = await s3Service.generateUploadUrl(tenantId, filename, contentType);
    res.json(result);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
