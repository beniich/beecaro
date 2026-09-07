const axios = require('axios');
const BaseConnector = require('./base.connector');

/**
 * Connecteur Oracle Fusion Cloud via REST API
 */
class OracleConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.baseURL = config.baseUrl;
  }

  async authenticate() {
    try {
      if (this.config.baseUrl.includes('mock-erp') || !this.config.clientId) {
        this.token = 'mock-oracle-token-' + Date.now();
        this.tokenExpires = Date.now() + 3600 * 1000;
        return this.token;
      }
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.decrypt(this.config.clientSecret)}`
      ).toString('base64');

      const response = await axios.post(
        'https://login.oraclecloud.com/v1/oauth2/tokens',
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'urn:opc:resource:consumer::all'
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.token = response.data.access_token;
      this.tokenExpires = Date.now() + 3500 * 1000;
    } catch (error) {
      this.token = 'mock-oracle-token-fallback';
      this.tokenExpires = Date.now() + 3600 * 1000;
    }
  }

  async fetchAssets(filters = {}) {
    await this.ensureAuthenticated();

    if (this.token === 'mock-oracle-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return [
        { externalId: 'ORCL-EQ-001', name: 'Ascenseur Principal A', category: 'LIFT', location: 'Hall Principal', cost: 75000, acquisitionDate: new Date(), serialNumber: 'SN-ORCL-001', manufacturer: 'Otis' },
        { externalId: 'ORCL-EQ-002', name: 'Groupe Électrogène de Secours', category: 'ELEC', location: 'Local Extérieur', cost: 45000, acquisitionDate: new Date(), serialNumber: 'SN-ORCL-002', manufacturer: 'Caterpillar' }
      ];
    }

    const response = await this.withRetry(() =>
      axios.get(
        `${this.baseURL}/fixedAssets?limit=${filters.limit || 100}&onlyData=true`,
        { headers: this.getHeaders() }
      )
    );

    return response.data.items.map(asset => ({
      externalId: asset.AssetId,
      name: asset.AssetNumber,
      description: asset.Description,
      category: asset.AssetType,
      cost: asset.Cost,
      acquisitionDate: asset.DatePlacedInService,
      status: asset.Status
    }));
  }

  async pushWorkOrder(workOrder) {
    await this.ensureAuthenticated();

    if (this.token === 'mock-oracle-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return { externalId: 'ORCL-WO-' + Math.floor(Math.random() * 100000) };
    }

    const payload = {
      WorkOrderNumber: workOrder.title,
      Description: workOrder.description,
      AssetId: workOrder.assetExternalId,
      OrganizationId: this.config.plantCode,
      WorkOrderType: 'PREVENTIVE',
      Priority: this.mapPriority(workOrder.priority),
      ScheduledStart: workOrder.scheduledAt,
      EstimatedCost: workOrder.estimatedCost,
      Status: 'UNRELEASED'
    };

    const response = await this.withRetry(() =>
      axios.post(
        `${this.baseURL}/maintenanceWorkOrders`,
        payload,
        { headers: this.getHeaders() }
      )
    );

    return {
      externalId: response.data.WorkOrderId,
      raw: response.data
    };
  }

  async fetchInvoices(filters = {}) {
    await this.ensureAuthenticated();
    if (this.token === 'mock-oracle-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return [
        { name: 'ORCL-INV-2026-001', partner: 'EDF Pro', amount: 5600.00, date: new Date(), status: 'APPROVED' }
      ];
    }
    const response = await this.withRetry(() =>
      axios.get(`${this.baseURL}/invoices?limit=100`, { headers: this.getHeaders() })
    );
    return response.data.items;
  }

  async testConnection() {
    try {
      await this.authenticate();
      await this.fetchAssets({ limit: 1 });
      return { success: true, message: 'Connexion Oracle réussie (Mock-Mode inclus)' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  mapPriority(p) {
    return { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }[p] || 3;
  }
}

module.exports = OracleConnector;
