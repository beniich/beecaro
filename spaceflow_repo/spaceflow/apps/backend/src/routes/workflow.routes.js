/**
 * workflow.routes.js — CRUD API pour les Workflow Definitions (No-Code)
 * Horizon 3 BeeCarbonat
 */
const router = require('express').Router();
const { prisma } = require('../config/database');
const { authMiddleware } = require('../middleware/auth.middleware');
const { executeWorkflow } = require('../services/workflow/workflow.engine');

router.use(authMiddleware);

// ─── GET /workflows — Liste tous les workflows du tenant ────────────────────
router.get('/', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const workflows = await prisma.workflowDefinition.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ workflows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /workflows — Créer un nouveau workflow ────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, description, triggerType, conditions, actions, rateLimit } = req.body;
    const tenantId = req.user?.tenantId;

    if (!name || !triggerType || !actions?.length) {
      return res.status(400).json({ error: 'name, triggerType et au moins une action sont requis.' });
    }

    const workflow = await prisma.workflowDefinition.create({
      data: {
        tenantId,
        name,
        description: description || '',
        triggerType,
        conditions: conditions || [],
        actions,
        rateLimit: rateLimit || null,
        active: true,
        createdById: req.user?.id
      }
    });

    res.status(201).json({ workflow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /workflows/:id — Activer/Désactiver ou modifier un workflow ───────
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    const { active, name, description, conditions, actions } = req.body;

    const workflow = await prisma.workflowDefinition.findFirst({ where: { id, tenantId } });
    if (!workflow) return res.status(404).json({ error: 'Workflow non trouvé.' });

    const updated = await prisma.workflowDefinition.update({
      where: { id },
      data: {
        ...(active !== undefined && { active }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(conditions && { conditions }),
        ...(actions && { actions })
      }
    });

    res.json({ workflow: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /workflows/:id — Supprimer un workflow ──────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    const workflow = await prisma.workflowDefinition.findFirst({ where: { id, tenantId } });
    if (!workflow) return res.status(404).json({ error: 'Workflow non trouvé.' });

    await prisma.workflowDefinition.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /workflows/:id/test — Tester manuellement un workflow ──────────────
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const triggerData = req.body?.triggerData || { value: 27, type: 'temperature', assetId: null };

    const result = await executeWorkflow(id, triggerData, 'USER');
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /workflows/:id/executions — Historique des executions ──────────────
router.get('/:id/executions', async (req, res) => {
  try {
    const { id } = req.params;
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { steps: { orderBy: { order: 'asc' } } }
    });
    res.json({ executions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
