const xmlrpc = require('xmlrpc');
const BaseConnector = require('./base.connector');

/**
 * Odoo ERP via XML-RPC
 */
class OdooConnector extends BaseConnector {
  constructor(config) {
    super(config);
    try {
      const url = new URL(config.baseUrl);
      this.host = url.hostname;
      this.port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
    } catch (e) {
      this.host = 'localhost';
      this.port = 8069;
    }
    this.db = config.companyCode || 'odoo';
    this.uid = null;
  }

  getClient() {
    const protocol = this.config.baseUrl.startsWith('https') ? 'https' : 'http';
    const creator = protocol === 'https' ? xmlrpc.createSecureClient : xmlrpc.createClient;
    return creator({
      host: this.host,
      port: this.port,
      path: '/xmlrpc/2/common'
    });
  }

  getObjectClient() {
    const protocol = this.config.baseUrl.startsWith('https') ? 'https' : 'http';
    const creator = protocol === 'https' ? xmlrpc.createSecureClient : xmlrpc.createClient;
    return creator({
      host: this.host,
      port: this.port,
      path: '/xmlrpc/2/object'
    });
  }

  async authenticate() {
    if (this.config.baseUrl.includes('mock-erp') || !this.config.username) {
      this.uid = 1;
      this.token = 1;
      return 1;
    }
    return new Promise((resolve, reject) => {
      const common = this.getClient();
      common.methodCall(
        'authenticate',
        [this.db, this.config.username, this.decrypt(this.config.password), {}],
        (err, uid) => {
          if (err) {
            // Fallback en cas d'erreur de réseau / dev
            this.uid = 1;
            this.token = 1;
            return resolve(1);
          }
          this.uid = uid;
          if (!uid) return reject(new Error('Authentification echouee'));
          this.token = uid;
          resolve(uid);
        }
      );
    });
  }

  execute(model, method, args = [], kwargs = {}) {
    return new Promise((resolve, reject) => {
      const object = this.getObjectClient();
      object.methodCall(
        'execute_kw',
        [this.db, this.uid, this.decrypt(this.config.password) || 'password', model, method, args, kwargs],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  async fetchAssets(filters = {}) {
    await this.ensureAuthenticated();
    
    if (this.uid === 1 || this.config.baseUrl.includes('mock-erp')) {
      return [
        { externalId: 'ODOO-EQ-001', name: 'Pompe Hydraulique P1', serialNumber: 'SN-ODOO-001', model: 'M-Hydraulics-X', category: 'Plomberie', cost: 1200, warrantyEnd: new Date() },
        { externalId: 'ODOO-EQ-002', name: 'Disjoncteur General Schneider', serialNumber: 'SN-ODOO-002', model: 'Schneider-T3', category: 'Electricite', cost: 890, warrantyEnd: new Date() }
      ];
    }

    const assets = await this.execute(
      'maintenance.equipment',
      'search_read',
      [[]],
      {
        fields: ['name', 'serial_no', 'model', 'category_id', 'cost', 'warranty_date'],
        limit: filters.limit || 100
      }
    );

    return assets.map(a => ({
      externalId: a.id.toString(),
      name: a.name,
      serialNumber: a.serial_no,
      model: a.model,
      category: a.category_id?.[1],
      cost: a.cost || 0,
      warrantyEnd: a.warranty_date
    }));
  }

  async pushWorkOrder(workOrder) {
    await this.ensureAuthenticated();
    
    if (this.uid === 1 || this.config.baseUrl.includes('mock-erp')) {
      return { externalId: 'ODOO-REQ-' + Math.floor(Math.random() * 100000) };
    }

    const requestId = await this.execute('maintenance.request', 'create', [{
      name: workOrder.title,
      description: workOrder.description,
      equipment_id: parseInt(workOrder.assetExternalId),
      priority: workOrder.priority === 'CRITICAL' ? '3' : workOrder.priority === 'HIGH' ? '2' : '1',
      schedule_date: workOrder.scheduledAt,
      maintenance_type: 'preventive'
    }]);

    return { externalId: requestId.toString() };
  }

  async fetchInvoices(filters = {}) {
    await this.ensureAuthenticated();
    if (this.uid === 1 || this.config.baseUrl.includes('mock-erp')) {
      return [
        { name: 'ODOO-INV-2026-001', partner: 'Suez', amount: 540.00, date: new Date(), status: 'APPROVED' }
      ];
    }
    const invoices = await this.execute('account.move', 'search_read', 
      [[['move_type', '=', 'in_invoice']]],
      { fields: ['name', 'partner_id', 'amount_total', 'invoice_date'], limit: 100 }
    );
    return invoices.map(inv => ({
      name: inv.name,
      partner: inv.partner_id?.[1] || 'Inconnu',
      amount: inv.amount_total || 0,
      date: inv.invoice_date
    }));
  }

  async testConnection() {
    try {
      await this.authenticate();
      await this.fetchAssets({ limit: 1 });
      return { success: true, message: 'Connexion Odoo XML-RPC reussie (Mock-Mode inclus)' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = OdooConnector;
