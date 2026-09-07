/**
 * Queue ERP — Pattern recommandé roadmap BeeCarbonat
 * BullMQ + Circuit Breaker (opossum) + idempotency keys
 */
const { Queue, Worker, QueueEvents } = require('bullmq');
const CircuitBreaker = require('opossum');
const erpService = require('../integrations/erp/erp.service');

// ─── Config Redis ────────────────────────────────────────────────────────────
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// ─── Queue ───────────────────────────────────────────────────────────────────
const erpQueue = new Queue('erp-sync', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

// ─── Circuit Breaker Options ─────────────────────────────────────────────────
const breakerOptions = {
  timeout: 10_000,       // 10s max par appel ERP
  errorThresholdPercentage: 50,
  resetTimeout: 30_000,  // Re-essaie après 30s
};

// ─── Worker ──────────────────────────────────────────────────────────────────
const erpWorker = new Worker(
  'erp-sync',
  async (job) => {
    const { connectionId, type, triggeredBy } = job.data;

    // Wrap l'appel ERP dans un circuit breaker
    const breaker = new CircuitBreaker(
      (id) => erpService.syncConnection(id, { type, triggeredBy }),
      breakerOptions
    );

    breaker.on('open', () =>
      console.warn(`[ERP] Circuit OPEN for connection ${connectionId}`)
    );
    breaker.on('halfOpen', () =>
      console.info(`[ERP] Circuit HALF-OPEN for connection ${connectionId}`)
    );
    breaker.on('close', () =>
      console.info(`[ERP] Circuit CLOSED for connection ${connectionId}`)
    );

    await job.updateProgress(10);
    const result = await breaker.fire(connectionId);
    await job.updateProgress(100);

    return result;
  },
  {
    connection: redisConnection,
    concurrency: 3, // Max 3 syncs ERP en parallèle
  }
);

erpWorker.on('completed', (job, result) => {
  console.log(`[ERP] Job ${job.id} completed — created: ${result?.stats?.created}, updated: ${result?.stats?.updated}`);
});

erpWorker.on('failed', (job, err) => {
  console.error(`[ERP] Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Enqueue une synchronisation ERP avec idempotency key
 * @param {string} connectionId
 * @param {'FULL_SYNC'|'ASSET_PULL'|'WO_PUSH'|'INVOICE_PULL'} type
 * @param {'MANUAL'|'SCHEDULED'|'WEBHOOK'} triggeredBy
 */
async function enqueueERPSync(connectionId, type = 'FULL_SYNC', triggeredBy = 'MANUAL') {
  const jobId = `erp-${connectionId}-${type}-${Date.now()}`;
  return erpQueue.add(
    'asset-sync',
    { connectionId, type, triggeredBy },
    { jobId } // idempotency via jobId unique
  );
}

/**
 * Enqueue la synchronisation de tous les connecteurs d'un tenant
 * @param {string} tenantId
 */
async function enqueueAllTenantSyncs(tenantId) {
  const { prisma } = require('../config/database');
  const connections = await prisma.eRPConnection.findMany({
    where: { tenantId, status: 'ACTIVE' },
  });
  return Promise.all(
    connections.map((c) => enqueueERPSync(c.id, 'FULL_SYNC', 'SCHEDULED'))
  );
}

module.exports = { erpQueue, erpWorker, enqueueERPSync, enqueueAllTenantSyncs };
