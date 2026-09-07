const { prisma } = require('../config/database');
const { body, param, validationResult } = require('express-validator');

// ============================================================
// GET /api/maintenance — Liste des logs de maintenance
// ============================================================
exports.getAll = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { assetId, type, page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      tenantId,
      ...(assetId && { assetId }),
      ...(type    && { type }),
    };

    const [items, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        include: {
          asset: { select: { id: true, name: true, code: true, type: true } },
        },
        orderBy: { performedAt: 'desc' },
        take: Number(limit),
        skip,
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    res.json({
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GET /api/maintenance/:id
// ============================================================
exports.getById = async (req, res) => {
  try {
    const item = await prisma.maintenanceLog.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId },
      include: { asset: true },
    });
    if (!item) return res.status(404).json({ error: 'Log introuvable' });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// POST /api/maintenance
// ============================================================
exports.create = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId   = req.user?.id;
    const {
      assetId, workOrderId, type = 'CORRECTIVE',
      performedAt, completedAt, technicianId, technicianName,
      notes, laborHours, totalCost, beforePhotos, afterPhotos,
      signatureUrl, partsReplaced
    } = req.body;

    const item = await prisma.maintenanceLog.create({
      data: {
        tenantId,
        assetId,
        workOrderId:    workOrderId || null,
        type,
        performedAt:    performedAt  ? new Date(performedAt)  : new Date(),
        completedAt:    completedAt  ? new Date(completedAt)  : new Date(),
        technicianId:   technicianId || userId || 'system',
        technicianName: technicianName || req.user?.fullName || 'Système',
        notes,
        laborHours:     laborHours  ? Number(laborHours) : null,
        totalCost:      totalCost   ? Number(totalCost)  : null,
        beforePhotos:   beforePhotos  || [],
        afterPhotos:    afterPhotos   || [],
        signatureUrl:   signatureUrl  || null,
        partsReplaced:  partsReplaced || null,
      },
    });

    // Mettre à jour la date de dernière maintenance sur l'asset
    await prisma.asset.update({
      where: { id: assetId },
      data: { lastMaintenanceAt: new Date() },
    });

    res.status(201).json({ data: item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// PUT /api/maintenance/:id
// ============================================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.maintenanceLog.update({
      where: { id },
      data: req.body,
    });
    res.json({ data: item });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// DELETE /api/maintenance/:id
// ============================================================
exports.delete = async (req, res) => {
  try {
    await prisma.maintenanceLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(400).json({ error: err.message });
  }
};
