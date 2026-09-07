const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth.middleware');
const { tenantMiddleware } = require('../middleware/tenant.middleware');
const { requireFeature } = require('../middleware/billing.middleware');

function generateApiKey() {
  const rawKey = `bci_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const prefix = rawKey.substring(0, 10) + '...';
  return { rawKey, keyHash, prefix };
}

router.use(authMiddleware, tenantMiddleware, requireFeature('apiKeys'));

// List API keys for the current tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Tenant context required' });

    const keys = await prisma.aPIKey.findMany({
      where: { tenantId },
      select: { id: true, name: true, prefix: true, active: true, createdAt: true, lastUsedAt: true, tier: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new API key
router.post('/', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Tenant context required' });
    
    const { name, tier = 'PUBLIC_READ' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { rawKey, keyHash, prefix } = generateApiKey();

    const apiKey = await prisma.aPIKey.create({
      data: {
        name,
        keyHash,
        prefix,
        tier,
        tenantId,
        rateLimit: tier === 'PARTNER' ? 100000 : (tier === 'PUBLIC_WRITE' ? 600 : 60)
      }
    });

    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      rawKey, // Only shown once
      tier: apiKey.tier,
      createdAt: apiKey.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke an API key
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    
    await prisma.aPIKey.delete({
      where: { id, tenantId }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
