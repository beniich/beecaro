const { prisma } = require('../config/database');
const twinService = require('../services/twin.service');

exports.getTwins = async (req, res) => {
  try {
    const where = {};
    if (req.user?.tenantId) where.tenantId = req.user.tenantId;

    const twins = await prisma.digitalTwin.findMany({
      where,
      include: {
        building: { select: { name: true } },
        asset: { select: { name: true } },
        _count: { select: { snapshots: true, simulations: true } }
      }
    });
    res.json(twins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBuildingOverview = async (req, res) => {
  try {
    const overview = await twinService.getBuildingOverview(req.params.buildingId);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.captureSnapshot = async (req, res) => {
  try {
    const snapshot = await twinService.captureSnapshot(req.params.id);
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.runSimulation = async (req, res) => {
  try {
    const { scenario, parameters } = req.body;
    const simulation = await twinService.runSimulation(req.params.id, scenario, parameters);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('twin:simulation', { twinId: req.params.id, simulation });
    }
    
    res.status(201).json(simulation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSnapshots = async (req, res) => {
  try {
    const snapshots = await prisma.twinSnapshot.findMany({
      where: { twinId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
