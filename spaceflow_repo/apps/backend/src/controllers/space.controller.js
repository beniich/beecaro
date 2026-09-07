/**
 * space.controller.js
 * 
 * IMPORTANT: Le schema Prisma n'a pas de modèle "Space" dédié.
 * Les espaces sont représentés par des Asset de type SPACE ou par les Building.
 * Ce controller utilise le modèle `Building` pour les espaces physiques
 * et peut filtrer les Assets de type SPACE si nécessaire.
 */
const { prisma } = require('../config/database');

// ============================================================
// GET /api/spaces
// ============================================================
exports.getAll = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { search, buildingId, page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      tenantId,
      deletedAt: null,
      ...(buildingId && { id: buildingId }),
      ...(search && {
        OR: [
          { name:    { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { city:    { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.building.findMany({
        where,
        include: {
          _count: { select: { assets: true, tickets: true } },
        },
        orderBy: { name: 'asc' },
        take: Number(limit),
        skip,
      }),
      prisma.building.count({ where }),
    ]);

    res.json({
      data: items,
      pagination: {
        page:       Number(page),
        limit:      Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext:    skip + Number(limit) < total,
        hasPrev:    skip > 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// GET /api/spaces/:id
// ============================================================
exports.getById = async (req, res) => {
  try {
    const item = await prisma.building.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId, deletedAt: null },
      include: {
        assets:   { where: { deletedAt: null }, select: { id: true, name: true, code: true, type: true, status: true } },
        tickets:  { where: { deletedAt: null }, select: { id: true, reference: true, status: true, severity: true } },
        _count:   { select: { assets: true, tickets: true } },
      },
    });
    if (!item) return res.status(404).json({ error: 'Espace introuvable' });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============================================================
// POST /api/spaces
// ============================================================
exports.create = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, address, city, country, geoLocation, totalSurface } = req.body;

    const item = await prisma.building.create({
      data: {
        tenantId,
        name,
        address:      address      || null,
        city:         city         || null,
        country:      country      || null,
        geoLocation:  geoLocation  || undefined,
        totalSurface: totalSurface ? Number(totalSurface) : null,
      },
    });
    res.status(201).json({ data: item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// PUT /api/spaces/:id
// ============================================================
exports.update = async (req, res) => {
  try {
    const { name, address, city, country, geoLocation, totalSurface } = req.body;
    const item = await prisma.building.update({
      where: { id: req.params.id },
      data: {
        ...(name         !== undefined && { name }),
        ...(address      !== undefined && { address }),
        ...(city         !== undefined && { city }),
        ...(country      !== undefined && { country }),
        ...(geoLocation  !== undefined && { geoLocation }),
        ...(totalSurface !== undefined && { totalSurface: Number(totalSurface) }),
      },
    });
    res.json({ data: item });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(400).json({ error: err.message });
  }
};

// ============================================================
// DELETE /api/spaces/:id  (soft delete)
// ============================================================
exports.delete = async (req, res) => {
  try {
    await prisma.building.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(400).json({ error: err.message });
  }
};
