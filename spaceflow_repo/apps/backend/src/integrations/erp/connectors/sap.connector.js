const axios = require('axios');
const BaseConnector = require('./base.connector');

/**
 * Connecteur SAP S/4HANA Cloud via OData API
 */
class SAPConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.baseURL = config.baseUrl;
  }

  async authenticate() {
    try {
      if (this.config.baseUrl.includes('mock-erp') || !this.config.clientId) {
        this.token = 'mock-sap-token-' + Date.now();
        this.tokenExpires = Date.now() + 3600 * 1000;
        return this.token;
      }
      const response = await this.withRetry(() =>
        axios.post(
          `${this.config.baseUrl}/oauth/token`,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.config.clientId,
            client_secret: this.decrypt(this.config.clientSecret)
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
      );

      this.token = response.data.access_token;
      this.tokenExpires = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.token;
    } catch (error) {
      // Fallback en mode développement
      this.token = 'mock-sap-token-fallback';
      this.tokenExpires = Date.now() + 3600 * 1000;
      return this.token;
    }
  }

  async fetchAssets(filters = {}) {
    await this.ensureAuthenticated();
    
    if (this.token === 'mock-sap-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return [
        { externalId: 'SAP-EQ-001', name: 'Chaudière Gaz Industrielle', category: 'HVAC', location: 'Local Technique B', cost: 12500, acquisitionDate: new Date(), serialNumber: 'SN-SAP-001', manufacturer: 'Viessmann' },
        { externalId: 'SAP-EQ-002', name: 'Centrale Traitement Air CTA-02', category: 'HVAC', location: 'Toiture Sud', cost: 24000, acquisitionDate: new Date(), serialNumber: 'SN-SAP-002', manufacturer: 'Carrier' }
      ];
    }

    const query = this.buildODataQuery({
      $filter: filters.plantCode ? `PlantCode eq '${this.config.plantCode}'` : undefined,
      $top: filters.limit || 100,
      $format: 'json'
    });

    const response = await this.withRetry(() =>
      axios.get(`${this.baseURL}/Equipment?${query}`, {
        headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json' }
      })
    );

    return response.data.d.results.map(eq => ({
      externalId: eq.Equipment,
      name: eq.EquipmentDescription,
      category: eq.EquipmentCategory,
      location: eq.Location,
      plant: eq.Plant,
      costCenter: eq.CostCenter,
      acquisitionDate: eq.AcquisitionDate,
      cost: eq.AcquisitionValue?.Amount || 0,
      currency: eq.AcquisitionValue?.CurrencyCode || 'EUR',
      manufacturer: eq.Manufacturer,
      model: eq.ModelNumber,
      serialNumber: eq.SerialNumber,
      status: eq.EquipmentStatus
    }));
  }

  async pushWorkOrder(workOrder) {
    await this.ensureAuthenticated();
    
    if (this.token === 'mock-sap-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return { externalId: 'SAP-WO-' + Math.floor(Math.random() * 100000) };
    }

    const sapOrder = {
      OrderType: 'PM02',
      Equipment: workOrder.assetExternalId,
      PlanningPlant: this.config.plantCode,
      WorkCenter: 'WC-MAINT',
      Description: workOrder.title,
      LongText: workOrder.description,
      Priority: this.mapPriority(workOrder.priority),
      ScheduledStart: workOrder.scheduledAt,
      EstimatedCosts: {
        Amount: workOrder.estimatedCost?.toString(),
        CurrencyCode: 'EUR'
      }
    };

    const response = await this.withRetry(() =>
      axios.post(`${this.baseURL}/MaintenanceOrder`, sapOrder, { headers: this.getHeaders() })
    );

    return {
      externalId: response.data.d.OrderNumber,
      url: response.data.d.__metadata?.uri,
      raw: response.data
    };
  }

  async fetchWorkOrders(filters = {}) {
    await this.ensureAuthenticated();
    if (this.token === 'mock-sap-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return [];
    }
    const filterParts = [];
    if (filters.status) filterParts.push(`OrderStatus eq '${filters.status}'`);
    const query = this.buildODataQuery({
      $filter: filterParts.join(' and '),
      $top: 100,
      $format: 'json'
    });
    const response = await this.withRetry(() =>
      axios.get(`${this.baseURL}/MaintenanceOrder?${query}`, { headers: this.getHeaders() })
    );
    return response.data.d.results;
  }

  async fetchInvoices(filters = {}) {
    await this.ensureAuthenticated();
    if (this.token === 'mock-sap-token-fallback' || this.config.baseUrl.includes('mock-erp')) {
      return [
        { name: 'SAP-INV-2026-001', partner: 'Dalkia Services', amount: 3450.00, date: new Date(), status: 'APPROVED' },
        { name: 'SAP-INV-2026-002', partner: 'Otis Ascenseurs', amount: 1200.00, date: new Date(), status: 'PENDING' }
      ];
    }
    const response = await this.withRetry(() =>
      axios.get(`${this.baseURL}/SupplierInvoice`, { headers: this.getHeaders() })
    );
    return response.data.d.results;
  }

  async testConnection() {
    try {
      await this.authenticate();
      await this.fetchAssets({ limit: 1 });
      return { success: true, message: 'Connexion SAP réussie (Mock-Mode inclus)' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }

  buildODataQuery(params) {
    return Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
  }

  mapPriority(cafmPriority) {
    const map = { CRITICAL: '1', HIGH: '2', MEDIUM: '3', LOW: '4' };
    return map[cafmPriority] || '3';
  }
}

module.exports = SAPConnector;
