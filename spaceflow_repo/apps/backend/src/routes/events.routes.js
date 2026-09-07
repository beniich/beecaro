const express = require('express');
const { prisma } = require('../config/database');
const router = express.Router();

/**
 * Server-Sent Events — notifications temps réel
 * Stockage des clients par tenantId
 */

const clients = new Map(); // tenantId → Set<response>

// ── GET /api/crm/events ──────────────────────────────────────────────────────
router.get('/events', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).end();

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.CRM_JWT_SECRET);
    const tenantId = decoded.tenantId || decoded.organizationId || 'default';

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx: disable buffering
    // Dynamic CORS
    const origin = req.headers.origin || 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.flushHeaders();

    // Register client
    if (!clients.has(tenantId)) clients.set(tenantId, new Set());
    clients.get(tenantId).add(res);
    console.log(`📡 SSE connected (tenant: ${tenantId}, total: ${clients.get(tenantId).size})`);

    // Initial event
    res.write(`event: connected\ndata: ${JSON.stringify({ tenantId, ts: Date.now() })}\n\n`);

    // Heartbeat every 25s (keep proxies alive)
    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n'); } catch (_) {}
    }, 25000);

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      clients.get(tenantId)?.delete(res);
      console.log(`📡 SSE disconnected (remaining: ${clients.get(tenantId)?.size ?? 0})`);
    });

  } catch (err) {
    console.error('[SSE] Auth error:', err.message);
    res.status(401).end();
  }
});

// ── Broadcast utility ────────────────────────────────────────────────────────
const broadcast = (tenantId, eventType, data) => {
  const tenantClients = clients.get(tenantId);
  if (!tenantClients || tenantClients.size === 0) return 0;

  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  let sent = 0;

  tenantClients.forEach(client => {
    try {
      client.write(payload);
      sent++;
    } catch (_) {
      tenantClients.delete(client);
    }
  });

  return sent;
};

// ── Broadcast to all tenants (admin events) ──────────────────────────────────
const broadcastAll = (eventType, data) => {
  let total = 0;
  clients.forEach((_, tenantId) => { total += broadcast(tenantId, eventType, data); });
  return total;
};

// ── DB polling every 8s ──────────────────────────────────────────────────────
let pollActive = false;
setInterval(async () => {
  if (pollActive || clients.size === 0) return;
  pollActive = true;

  try {
    const since = new Date(Date.now() - 10000); // last 10s

    // 1. Deals gagnés récents
    const wonDeals = await prisma.deal.findMany({
      where: { status: 'WON', updatedAt: { gte: since } },
      include: { contact: { select: { firstName: true, lastName: true } } }
    }).catch(() => []);

    wonDeals.forEach(deal => {
      broadcast(deal.organizationId, 'deal_won', {
        id: deal.id,
        name: deal.name,
        amount: deal.amount,
        contact: deal.contact
      });
    });

    // 2. Nouveaux deals créés
    const newDeals = await prisma.deal.findMany({
      where: { createdAt: { gte: since } },
      include: { contact: { select: { firstName: true, lastName: true } } }
    }).catch(() => []);

    newDeals.forEach(deal => {
      broadcast(deal.organizationId, 'new_deal', {
        id: deal.id,
        name: deal.name,
        amount: deal.amount
      });
    });

    // 3. Nouveaux contacts
    const newContacts = await prisma.crmContact.findMany({
      where: { createdAt: { gte: since } }
    }).catch(() => []);

    newContacts.forEach(contact => {
      broadcast(contact.organizationId, 'new_contact', {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`
      });
    });

  } catch (err) {
    console.error('[SSE] Poll error:', err.message);
  } finally {
    pollActive = false;
  }
}, 8000);

router.broadcast    = broadcast;
router.broadcastAll = broadcastAll;

module.exports = router;
