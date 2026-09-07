import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { z } from 'zod';

import { initDatabase } from './src/server/config/migrations';
import { securityHeaders, sanitizeInput } from './src/server/middlewares/security.middleware';
import { rateLimiter } from './src/server/middlewares/rateLimiter';

// Domain Routers
import { eventsRouter } from './src/server/routes/events.routes';
import { assetsRouter } from './src/server/routes/assets.routes';
import { workordersRouter } from './src/server/routes/workorders.routes';
import { buildingsRouter } from './src/server/routes/buildings.routes';
import { leasesRouter } from './src/server/routes/leases.routes';
import { telemetryRouter } from './src/server/routes/telemetry.routes';
import { lightingRouter } from './src/server/routes/lighting.routes';
import { waterRouter } from './src/server/routes/water.routes';
import { operatorsRouter } from './src/server/routes/operators.routes';
import { esgRouter } from './src/server/routes/esg.routes';
import { spacesRouter } from './src/server/routes/spaces.routes';
import { energyRouter } from './src/server/routes/energy.routes';
import { dashboardRouter } from './src/server/routes/dashboard.routes';
import { grafanaRouter } from './src/server/routes/grafana.routes';
import { diagnosticsRouter } from './src/server/routes/diagnostics.routes';
import { aiRouter } from './src/server/routes/ai.routes';
import { authRouter } from './src/server/routes/auth.routes';
import { paymentsRouter, paypalRouter } from './src/server/routes/payments.routes';
import { exportRouter } from './src/server/routes/export.routes';
import { mroRouter } from './src/server/routes/mro.routes';
import { auditRouter } from './src/server/routes/audit.routes';

dotenv.config();

async function startServer() {
  // 1. Initialisation de la persistance (Non-bloquante avec timeout)
  try {
    const initTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('initDatabase timeout')), 3000));
    await Promise.race([initDatabase(), initTimeout]);
  } catch (e: any) {
    console.warn('[initDatabase startup notice]:', e.message);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 2. Middlewares de Sécurité & Hygiène
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  app.use(securityHeaders);
  app.use(sanitizeInput);
  app.use(rateLimiter({ windowMs: 60 * 1000, maxRequests: 300 }));
  app.use(express.json());

  // CORS dynamique & En-têtes standards
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Observabilité : Journalisation structurée des requêtes
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;
      if (res.statusCode >= 500) console.error(`🚨 ${log}`);
      else if (res.statusCode >= 400) console.warn(`⚠️ ${log}`);
      else console.info(`✅ ${log}`);
    });
    next();
  });

  // 3. Montage des Routes API Métier
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() });
  });

  app.use('/api/events', eventsRouter);
  app.use('/api/assets', assetsRouter);
  app.use('/api/workorders', workordersRouter);
  app.use('/api/buildings', buildingsRouter);
  app.use('/api/sites', buildingsRouter);
  app.use('/api/leases', leasesRouter);
  app.use('/api/telemetry', telemetryRouter);
  app.use('/api/lighting', lightingRouter);
  app.use('/api/water', waterRouter);
  app.use('/api/field-operators', operatorsRouter);
  app.use('/api/intervenants', operatorsRouter);
  app.use('/api/esg', esgRouter);
  app.use('/api/spaces', spacesRouter);
  app.use('/api', energyRouter);
  app.use('/api', dashboardRouter);
  app.use('/api/grafana', grafanaRouter);
  app.use('/api', diagnosticsRouter);
  app.use('/api', aiRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/paypal', paypalRouter);
  app.use('/api/export', exportRouter);
  app.use('/api/mro', mroRouter);
  app.use('/api', auditRouter);

  // 4. Gestionnaire d'erreurs global (Observabilité & Zod)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ status: 'error', statusCode: 400, message: 'Invalid input data', errors: err.errors });
    }
    console.error(`[Global Error Handler] 🚨 ${err.message}`, err.stack);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : err.message
    });
  });

  // 5. Intégration Vite Dev Server / Fichiers Statiques
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BeeCarbonat Backend] Running successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[Error starting backend server]:', error);
});
