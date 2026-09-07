/**
 * Point d'entrée Vercel Serverless — BeeCarbonat API
 *
 * ⚠️  Ce fichier créé une instance Express LITE :
 *   - Pas de Socket.io (serverless incompatible)
 *   - Pas d'IoT simulation (long-running process interdit)
 *   - Pas de BullMQ board (Redis optionnel)
 *   - Toutes les routes REST sont fonctionnelles
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const Sentry = require('@sentry/node');

const app = express();
app.set('trust proxy', 1);

// ── Sentry (optionnel) ─────────────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
    integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
  });
}

// ── CORS ────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Fallback : autoriser tous en l'absence de CORS_ORIGIN (développement)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin "${origin}" non autorisée`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ── Sécurité & Parsing ──────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Middlewares de sécurité ────────────────────────────────────
const { sanitizeInput, apiLimiter, securityHeaders } = require('../apps/backend/src/middleware/security.middleware');
app.use(securityHeaders);
app.use(sanitizeInput);
app.use('/api/', apiLimiter);

// ── Multi-tenancy ───────────────────────────────────────────────
const { tenantMiddleware } = require('../apps/backend/src/middleware/tenant.middleware');
app.use(tenantMiddleware);

// ── CSRF token endpoint ─────────────────────────────────────────
const { generateToken, doubleCsrfProtection } = require('../apps/backend/src/middleware/csrf.middleware');
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

// ── Health check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: 'production',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes API ─────────────────────────────────────────────────
app.use('/api/auth', require('../apps/backend/src/routes/auth.routes'));
app.use('/api/auth/mfa', require('../apps/backend/src/routes/mfa.routes'));
app.use('/api/assets', require('../apps/backend/src/routes/asset.routes'));
app.use('/api/spaces', require('../apps/backend/src/routes/space.routes'));
app.use('/api/workorders', require('../apps/backend/src/routes/workorder.routes'));
app.use('/api/tickets', require('../apps/backend/src/routes/ticket.routes'));
app.use('/api/buildings', require('../apps/backend/src/routes/building.routes'));
app.use('/api/leases', require('../apps/backend/src/routes/lease.routes'));
app.use('/api/dashboard', require('../apps/backend/src/routes/dashboard.routes'));
app.use('/api/maintenance', require('../apps/backend/src/routes/maintenance.routes'));
app.use('/api/analytics', require('../apps/backend/src/routes/analytics.routes'));
app.use('/api/cmms', require('../apps/backend/src/routes/cmms.routes'));
app.use('/api/digitaltwin', require('../apps/backend/src/routes/digitaltwin.routes'));
app.use('/api/notifications', require('../apps/backend/src/routes/notification.routes'));
app.use('/api/tenants', require('../apps/backend/src/routes/tenant.routes'));
app.use('/api/export', require('../apps/backend/src/routes/export.routes'));
app.use('/api/erp', require('../apps/backend/src/routes/erp.routes'));
app.use('/api/bim', require('../apps/backend/src/routes/bim.routes'));
app.use('/api/ai', require('../apps/backend/src/routes/ai.routes'));
app.use('/api/api-keys', require('../apps/backend/src/routes/api-keys.routes'));
app.use('/api/uploads', require('../apps/backend/src/routes/upload.routes'));
app.use('/api/workflows', require('../apps/backend/src/routes/workflow.routes'));
app.use('/api/marketplace', require('../apps/backend/src/routes/marketplace.routes'));

// ── Routes CRM ─────────────────────────────────────────────────
app.use('/api/crm/auth', require('../apps/backend/src/routes/crm.auth.routes'));
app.use('/api/crm/contacts', require('../apps/backend/src/routes/crm.contact.routes'));
app.use('/api/crm/deals', require('../apps/backend/src/routes/crm.deal.routes'));
const billingRoutes = require('../apps/backend/src/routes/billing.routes');
app.use('/api/crm/billing', billingRoutes);

// ── Gestion d'erreurs globale ──────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}
const { errorMiddleware } = require('../apps/backend/src/middleware/error.middleware');
app.use(errorMiddleware);

// ── Export pour Vercel Serverless ──────────────────────────────
module.exports = app;
