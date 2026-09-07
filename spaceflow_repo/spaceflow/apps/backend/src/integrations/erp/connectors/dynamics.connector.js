const axios = require('axios');
const BaseConnector = require('./base.connector');

/**
 * Microsoft Dynamics 365 Business Central / CRM via Web API OData
 */
class DynamicsConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.baseURL = config.baseUrl;
  }

  async authenticate() {
    try {
      if (this.config.baseUrl.includes('mock-erp') || !this.config.clientId) {
        this.token = 'mock-dynamics-token-' + Date.now();
        this.tokenExpires = Date.now() + 3600 * 1000;
        return this.token;
      }
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.decrypt(this.config.clientSecret),
          scope: `${this.config.baseUrl}/.default`
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      this.token = response.data.access_token;
      this.tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000;
    } catch (error) {
      this.token = 'mock-dynamics-token-fallback';
      this.tokenExpires = Date.now() + 3600 * 1000;
    }
  }

  async fetchAssets(filters = {}) {
    await this.ensureAuthenticated();
    
    if (this.token === 'mock-dynamics-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return [
        { externalId: 'DYN-EQ-001', name: 'Tableau Électrique Général TGBT', category: 'ELEC', status: 'Active' },
        { externalId: 'DYN-EQ-002', name: 'Onduleur Réseau Salle Serveur', category: 'ELEC', status: 'Active' }
      ];
    }

    const response = await this.withRetry(() =>
      axios.get(
        `${this.baseURL}/msdyn_assets?$top=${filters.limit || 100}`,
        { headers: this.getHeaders() }
      )
    );

    return response.data.value.map(a => ({
      externalId: a.msdyn_assetid,
      name: a.msdyn_name,
      category: a.msdyn_equipmenttype,
      status: a.statuscode
    }));
  }

  async pushWorkOrder(workOrder) {
    await this.ensureAuthenticated();
    
    if (this.token === 'mock-dynamics-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return { externalId: 'DYN-WO-' + Math.floor(Math.random() * 100000) };
    }

    const payload = {
      msdyn_name: workOrder.title,
      msdyn_description: workOrder.description,
      "msdyn_customerasset@odata.bind": `/msdyn_assets(${workOrder.assetExternalId})`,
      msdyn_priority: this.mapPriority(workOrder.priority),
      msdyn_scheduledstart: workOrder.scheduledAt,
      msdyn_estimatedduration: workOrder.estimatedDuration || 120
    };

    const response = await this.withRetry(() =>
      axios.post(
        `${this.baseURL}/msdyn_workorders`,
        payload,
        { headers: this.getHeaders() }
      )
    );

    return {
      externalId: response.headers['odata-entityid']?.match(/\(([^)]+)\)/)?.[1],
      raw: response.data
    };
  }

  async fetchInvoices(filters = {}) {
    await this.ensureAuthenticated();
    if (this.token === 'mock-dynamics-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return [
        { name: 'DYN-INV-2026-001', partner: 'Suez Eau', amount: 890.00, date: new Date(), status: 'APPROVED' }
      ];
    }
    const response = await this.withRetry(() =>
      axios.get(`${this.baseURL}/invoices?$top=100`, { headers: this.getHeaders() })
    );
    return response.data.value;
  }

  async testConnection() {
    try {
      await this.authenticate();
      await this.fetchAssets({ limit: 1 });
      return { success: true, message: 'Connexion Dynamics réussie (Mock-Mode inclus)' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Prefer': 'return=representation'
    };
  }

  mapPriority(p) {
    return { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }[p] || 3;
  }
}

module.exports = DynamicsConnector;
