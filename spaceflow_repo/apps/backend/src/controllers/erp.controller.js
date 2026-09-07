const { prisma } = require('../config/database');
const erpService = require('../integrations/erp/erp.service');

exports.getConnections = async (req, res) => {
  try {
    const where = {};
    if (req.user?.tenantId) where.tenantId = req.user.tenantId;
    
    const connections = await prisma.eRPConnection.findMany({
      where,
      include: {
        _count: { select: { syncLogs: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const safe = connections.map(c => ({
      ...c,
      clientSecret: c.clientSecret ? '***' : null,
      password: c.password ? '***' : null,
      apiKey: c.apiKey ? '***' : null
    }));
    
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createConnection = async (req, res) => {
  try {
    const ConnectorClass = require(`./connectors/${req.body.type.toLowerCase()}.connector`);
    const connector = new ConnectorClass(req.body);
    
    if (req.body.clientSecret) {
      req.body.clientSecret = connector.encrypt(req.body.clientSecret);
    }
    if (req.body.password) {
      req.body.password = connector.encrypt(req.body.password);
    }

    const tenantId = req.user?.tenantId || (await prisma.tenant.findFirst())?.id || 'mock-tenant-id';

    const connection = await prisma.eRPConnection.create({
      data: {
        ...req.body,
        entityMapping: JSON.stringify(req.body.entityMapping || {}),
        tenantId
      }
    });
    res.status(201).json(connection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.testConnection = async (req, res) => {
  try {
    const connection = await prisma.eRPConnection.findUnique({ where: { id: req.params.id } });
    if (!connection) return res.status(404).json({ error: 'Connexion non trouvee' });
    const connector = erpService.getConnector(connection);
    const result = await connector.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncConnection = async (req, res) => {
  try {
    const result = await erpService.syncConnection(req.params.id, {
      triggeredBy: 'MANUAL',
      type: req.body.type || 'FULL_SYNC'
    });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('erp:sync:complete', result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSyncLogs = async (req, res) => {
  try {
    const logs = await prisma.eRPSyncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const parsedLogs = logs.map(l => ({
      ...l,
      errors: l.errors ? JSON.parse(l.errors) : null
    }));

    res.json(parsedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
