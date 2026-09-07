const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const express = require("express");
const { logger } = require("../lib/logger.js");
const { authMiddleware } = require("../middleware/auth.middleware.js");

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Toutes les queues à monitorer
const queues = [
  new Queue("bim-extraction", { connection }),
  new Queue("erp-sync", { connection }),
  new Queue("iot-ingestion", { connection }),
  new Queue("esg-reporting", { connection }),
  new Queue("notification-emails", { connection }),
];

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: queues.map((q) => new BullMQAdapter(q)),
  serverAdapter,
  options: {
    uiConfig: {
      boardTitle: "BeeCarbonat Worker Dashboard",
      menuLogo: "🔧",
      theme: "dark",
      favIcon: { default: "/favicon.ico" },
      pollingInterval: 5000,
    },
  },
});

/**
 * Monter le dashboard sur une app Express
 * Routes: /admin/queues (UI), /admin/queues/api/* (API)
 */
function mountBullBoard(app) {
  // AUTH obligatoire : protection par token admin
  const adminAuth = (req, res, next) => {
    const adminToken = req.headers["x-admin-token"] || req.query.token;
    
    if (adminToken !== process.env.ADMIN_DASHBOARD_TOKEN) {
      logger.warn("Bull Board unauthorized access attempt", {
        ip: req.ip,
        path: req.path,
      });
      return res.status(403).json({ 
        error: "FORBIDDEN",
        message: "Admin access required",
      });
    }
    next();
  };

  // Protection par sous-domaine OU IP allowlist OU token admin
  app.use(
    "/admin/queues",
    (req, res, next) => {
      // Allowlist IPs (optionnel : configurer selon infrastructure)
      const allowedIPs = (process.env.ADMIN_ALLOWED_IPS || "127.0.0.1,::1").split(",");
      if (allowedIPs.includes(req.ip) || req.headers["x-admin-token"]) {
        return next();
      }
      adminAuth(req, res, next);
    },
    serverAdapter.getRouter()
  );

  // Métriques Prometheus sur les queues
  app.get("/admin/queues/metrics", adminAuth, async (req, res) => {
    const metrics = await getQueueMetrics();
    res.json(metrics);
  });

  logger.info("Bull Board mounted at /admin/queues");
}

async function getQueueMetrics() {
  const metrics = {};
  for (const queue of queues) {
    const counts = await queue.getJobCounts();
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    metrics[queue.name] = {
      waiting,
      active,
      completed,
      failed,
      delayed,
      jobs: counts,
      isHealthy: failed < 100 && waiting < 1000,
    };
  }
  return metrics;
}

module.exports = { mountBullBoard, queues };
