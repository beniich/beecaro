const { prisma } = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const leases = await prisma.lease.findMany({
      include: { building: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { tenant, buildingId, startDate, endDate, monthlyRent, deposit } = req.body;
    const lease = await prisma.lease.create({
      data: {
        tenant,
        buildingId,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        monthlyRent: Number(monthlyRent),
        deposit:     Number(deposit || 0),
        status: 'active'
      },
      include: { building: { select: { name: true } } }
    });
    res.status(201).json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant, buildingId, startDate, endDate, monthlyRent, deposit, status } = req.body;
    const lease = await prisma.lease.update({
      where: { id },
      data: {
        ...(tenant       && { tenant }),
        ...(buildingId   && { buildingId }),
        ...(startDate    && { startDate: new Date(startDate) }),
        ...(endDate      && { endDate:   new Date(endDate) }),
        ...(monthlyRent  !== undefined && { monthlyRent: Number(monthlyRent) }),
        ...(deposit      !== undefined && { deposit:     Number(deposit) }),
        ...(status       && { status })
      },
      include: { building: { select: { name: true } } }
    });
    res.json(lease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lease.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
