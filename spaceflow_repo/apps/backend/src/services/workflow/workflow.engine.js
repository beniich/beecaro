/**
 * workflow.engine.js — Moteur d'exécution de workflows no-code
 * Horizon 4 BeeCarbonat
 *
 * Responsabilités :
 *  - Evaluer les conditions booléennes
 *  - Exécuter les actions séquentiellement
 *  - Persister l'audit trail (WorkflowExecution + WorkflowStep)
 *  - Sandbox : rate limiting + timeout par step
 */
const { prisma } = require('../../config/database');

// ─── Action Handlers ─────────────────────────────────────────────────────────

const ACTION_HANDLERS = {
  /**
   * NOTIFY : Créer une notification in-app
   */
  async NOTIFY({ config, triggerData, tenantId }) {
    const { title, body, userIds, priority = 'NORMAL' } = config;
    const targets = userIds || [];

    await prisma.notification.createMany({
      data: targets.map((userId) => ({
        tenantId,
        userId,
        type: 'WORKFLOW',
        title: interpolate(title, triggerData),
        body: interpolate(body, triggerData),
        priority,
      })),
    });
    return { notified: targets.length };
  },

  /**
   * CREATE_WO : Créer un Work Order automatiquement
   */
  async CREATE_WO({ config, triggerData, tenantId }) {
    const { title, description, type, priority, assignedToId } = config;

    // Résolution de l'assetId depuis le contexte de l'événement
    const assetId = triggerData?.assetId || config.assetId;
    if (!assetId) throw new Error('CREATE_WO requires an assetId in triggerData or config');

    // Résolution du createdBy (system user ou premier admin du tenant)
    const systemUser = await prisma.user.findFirst({
      where: { tenantId, role: 'ADMIN', isActive: true },
      select: { id: true },
    });
    if (!systemUser) throw new Error('No admin user found for tenant');

    const wo = await prisma.workOrder.create({
      data: {
        tenantId,
        title: interpolate(title, triggerData),
        description: interpolate(description || '', triggerData),
        type: type || 'CORRECTIVE',
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        scheduledAt: new Date(),
        assetId,
        assignedToId: assignedToId || null,
        createdById: systemUser.id,
      },
    });
    return { workOrderId: wo.id };
  },

  /**
   * UPDATE_STATUS : Mettre à jour le statut d'un asset ou WO
   */
  async UPDATE_STATUS({ config, triggerData }) {
    const { entity, id, status } = config;
    const entityId = id || triggerData?.entityId;

    if (entity === 'ASSET') {
      await prisma.asset.update({ where: { id: entityId }, data: { status } });
    } else if (entity === 'WORK_ORDER') {
      await prisma.workOrder.update({ where: { id: entityId }, data: { status } });
    }
    return { updated: { entity, entityId, status } };
  },

  /**
   * CALL_API : Appel HTTP vers une URL externe (webhook sortant)
   */
  async CALL_API({ config, triggerData }) {
    const axios = require('axios');
    const { url, method = 'POST', headers = {}, bodyTemplate } = config;

    const body = bodyTemplate ? JSON.parse(interpolate(JSON.stringify(bodyTemplate), triggerData)) : triggerData;

    const res = await axios({
      method,
      url,
      data: body,
      headers,
      timeout: 8_000,
    });
    return { status: res.status, data: res.data };
  },

  /**
   * SEND_EMAIL : Envoyer un email via Resend
   */
  async SEND_EMAIL({ config, triggerData }) {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { to, subject, html } = config;
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@BeeCarbonat.com',
      to,
      subject: interpolate(subject, triggerData),
      html: interpolate(html, triggerData),
    });
    return { emailId: result.id };
  },
};

// ─── Condition Evaluator ──────────────────────────────────────────────────────

/**
 * Evalue un tableau de conditions booléennes sur les données de l'événement
 * @param {Array} conditions — [{ field, operator, value, logic }]
 * @param {Object} data — données de l'événement
 * @returns {boolean}
 */
function evaluateConditions(conditions, data) {
  if (!conditions || conditions.length === 0) return true;

  return conditions.reduce((acc, cond, idx) => {
    const actual = getNestedValue(data, cond.field);
    const passed = evaluateOperator(actual, cond.operator, cond.value);
    const logic = cond.logic || 'AND';

    if (idx === 0) return passed;
    return logic === 'OR' ? acc || passed : acc && passed;
  }, true);
}

function evaluateOperator(actual, operator, expected) {
  switch (operator) {
    case 'eq':  return actual === expected;
    case 'neq': return actual !== expected;
    case 'gt':  return Number(actual) > Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'lt':  return Number(actual) < Number(expected);
    case 'lte': return Number(actual) <= Number(expected);
    case 'contains': return String(actual).toLowerCase().includes(String(expected).toLowerCase());
    case 'in':  return Array.isArray(expected) && expected.includes(actual);
    case 'exists': return actual !== undefined && actual !== null;
    default: return false;
  }
}

// ─── Template Interpolation ───────────────────────────────────────────────────

/** Remplace {{field}} par la valeur dans data */
function interpolate(template, data) {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
    return getNestedValue(data, key) ?? '';
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

// ─── Engine ───────────────────────────────────────────────────────────────────

const STEP_TIMEOUT_MS = 10_000;

/**
 * Exécute un workflow avec les données d'événement fournies
 * @param {string} workflowId
 * @param {Object} triggerData — données de l'événement déclencheur
 * @param {string} triggeredBy — SYSTEM | USER | SCHEDULE | WEBHOOK
 */
async function executeWorkflow(workflowId, triggerData = {}, triggeredBy = 'SYSTEM') {
  const workflow = await prisma.workflowDefinition.findUnique({
    where: { id: workflowId },
  });

  if (!workflow || !workflow.active) return null;

  // Rate limiting: count executions in last hour
  if (workflow.rateLimit) {
    const recentCount = await prisma.workflowExecution.count({
      where: {
        workflowId,
        createdAt: { gte: new Date(Date.now() - 3_600_000) },
        status: { in: ['SUCCESS', 'RUNNING'] },
      },
    });
    if (recentCount >= workflow.rateLimit) {
      return { skipped: true, reason: 'rate_limit' };
    }
  }

  // Evaluate conditions
  if (!evaluateConditions(workflow.conditions, triggerData)) {
    return { skipped: true, reason: 'conditions_not_met' };
  }

  // Create execution record
  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      triggeredBy,
      triggerData,
      status: 'RUNNING',
      startedAt: new Date(),
    },
  });

  const actions = Array.isArray(workflow.actions) ? workflow.actions : [];
  let executionStatus = 'SUCCESS';
  let executionError = null;

  // Execute each action sequentially
  for (const action of actions.sort((a, b) => a.order - b.order)) {
    const stepStart = Date.now();

    const step = await prisma.workflowStep.create({
      data: {
        executionId: execution.id,
        actionType: action.type,
        actionConfig: action.config || {},
        order: action.order,
        status: 'PENDING',
      },
    });

    try {
      const handler = ACTION_HANDLERS[action.type];
      if (!handler) throw new Error(`Unknown action type: ${action.type}`);

      // Timeout per step
      const output = await Promise.race([
        handler({ config: action.config || {}, triggerData, tenantId: workflow.tenantId }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Step timeout after ${STEP_TIMEOUT_MS}ms`)), STEP_TIMEOUT_MS)
        ),
      ]);

      await prisma.workflowStep.update({
        where: { id: step.id },
        data: { status: 'SUCCESS', output, executedAt: new Date(), duration: Date.now() - stepStart },
      });
    } catch (err) {
      executionStatus = 'FAILED';
      executionError = err.message;

      await prisma.workflowStep.update({
        where: { id: step.id },
        data: { status: 'FAILED', error: err.message, executedAt: new Date(), duration: Date.now() - stepStart },
      });
      break; // Stop on first failure
    }
  }

  // Finalize execution
  const duration = Date.now() - execution.startedAt.getTime();
  await prisma.workflowExecution.update({
    where: { id: execution.id },
    data: { status: executionStatus, completedAt: new Date(), duration, error: executionError },
  });

  return { executionId: execution.id, status: executionStatus, duration };
}

/**
 * Déclenche tous les workflows actifs répondant à un type d'événement
 */
async function triggerWorkflowsByEvent(tenantId, eventType, eventData) {
  const workflows = await prisma.workflowDefinition.findMany({
    where: { tenantId, active: true, triggerType: eventType },
  });

  return Promise.allSettled(
    workflows.map((wf) => executeWorkflow(wf.id, eventData, 'SYSTEM'))
  );
}

module.exports = { executeWorkflow, triggerWorkflowsByEvent, evaluateConditions };
