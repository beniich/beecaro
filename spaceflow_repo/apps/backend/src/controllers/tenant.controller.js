const tenantService = require('../services/tenant.service');

exports.getTenants = async (req, res) => {
  try {
    const tenants = await tenantService.getAllTenants();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await tenantService.getTenant(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant non trouvé' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const tenant = await tenantService.createTenant(req.body);
    res.status(201).json(tenant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const tenant = await tenantService.updateTenant(req.params.id, req.body);
    res.json(tenant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.setConfig = async (req, res) => {
  try {
    const { key, value } = req.body;
    const config = await tenantService.setConfig(req.params.id, key, value);
    res.json(config);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addDomain = async (req, res) => {
  try {
    const { domain } = req.body;
    const tenantDomain = await tenantService.addDomain(req.params.id, domain);
    res.status(201).json(tenantDomain);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
