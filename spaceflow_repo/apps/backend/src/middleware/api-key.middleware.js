/**
 * api-key.middleware.js — Auth API publique v1
 * Horizon 2 BeeCarbonat : gestion des clés API avec rate limiting par tier
 */
const crypto = require('crypto');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { prisma } = require('../config/database');

// ─── Rate limiters par tier ───────────────────────────────────────────────────
const limiters = {
  PUBLIC_READ:  new RateLimiterMemory({ points: 60,      duration: 60 }),
  PUBLIC_WRITE: new RateLimiterMemory({ points: 600,     duration: 60 }),
  PARTNER:      new RateLimiterMemory({ points: 100_000, duration: 60 }),
};

/**
 * Hash SHA-256 d'une clé API brute
 */
function hashKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * Middleware d'authentification par clé API
 * Supporte : Authorization: Bearer bci_xxx  ou  X-API-Key: bci_xxx
 */
async function apiKeyAuth(req, res, next) {
  const raw =
    req.headers['x-api-key'] ||
    (req.headers.authorization?.startsWith('Bearer bci_')
      ? req.headers.authorization.slice(7)
      : null);

  if (!raw) {
    return res.status(401).json({ error: 'API key required' });
  }

  const keyHash = hashKey(raw);

  const apiKey = await prisma.aPIKey.findUnique({
    where: { keyHash },
    include: { tenant: { select: { id: true, slug: true, plan: true } } },
  });

  if (!apiKey || !apiKey.active) {
    return res.status(401).json({ error: 'Invalid or revoked API key' });
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return res.status(401).json({ error: 'API key expired' });
  }

  // Rate limiting
  const limiter = limiters[apiKey.tier] || limiters.PUBLIC_READ;
  try {
    const rateLimitResult = await limiter.consume(`${apiKey.id}-${apiKey.tier}`);
    res.set({
      'X-RateLimit-Limit':     apiKey.rateLimit,
      'X-RateLimit-Remaining': rateLimitResult.remainingPoints,
      'X-RateLimit-Reset':     new Date(Date.now() + rateLimitResult.msBeforeNext).toISOString(),
    });
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Attach to request
  req.apiKey = apiKey;
  req.tenantId = apiKey.tenantId;
  req.tenant = apiKey.tenant;

  // Update lastUsedAt asynchronously (fire & forget)
  prisma.aPIKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  next();
}

module.exports = { apiKeyAuth, hashKey };
