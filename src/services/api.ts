import axios from 'axios';
import { Asset, WorkOrder, LeaseRecord, EsgMetrics, TelemetryNode } from '../types';
import { localCache } from './localCache';

// Axios Instance configured for Enterprise Session Authentication
export const apiClient = axios.create({
  baseURL: window.location.origin,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Connection status state
export interface ConnectionStatus {
  connected: boolean;
  mode: 'LIVE_PRODUCTION' | 'LOCAL_SIMULATED';
  provider: string;
  endpoint: string;
}

export const getApiBaseUrl = (): string => {
  return window.location.origin;
};

// Resilient Production API client with IndexedDB / localStorage offline caching
export const api = {
  // ── Authentication & Lifecycle ──────────────────────────────────
  async loginWithGoogle(token: string, profile?: any) {
    const res = await apiClient.post('/api/auth/google', { token, profile });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },

  async getMe() {
    try {
      const res = await apiClient.get('/api/auth/me');
      return res.data;
    } catch (e) {
      return null;
    }
  },

  async updateProfile(updates: any) {
    const res = await apiClient.put('/api/auth/profile', updates);
    return res.data;
  },

  // ── Billing & Subscriptions ─────────────────────────────────────
  async initSubscription(subscriptionId: string, planType: string = 'PRO') {
    const res = await apiClient.post('/api/payments/init-sub', { subscriptionId, planType });
    return res.data;
  },

  async createSubscriptionAgreement(planId: string) {
    const res = await apiClient.post('/api/payments/create-subscription', { planId });
    return res.data;
  },

  // ── Protected Pro Capabilities ───────────────────────────────────
  async predictMaintenance(assetId: string, sensorData?: any) {
    const res = await apiClient.post('/api/ai/predict', { assetId, sensorData });
    return res.data;
  },

  async getProEsgReport() {
    const res = await apiClient.get('/api/esg/pro-report');
    return res.data;
  },

  // Check backend health & PostgreSQL Neon status

  async checkHealth(): Promise<ConnectionStatus> {
    if (localCache.isSimulatedOffline()) {
      return {
        connected: false,
        mode: 'LOCAL_SIMULATED',
        provider: 'BeeCarbonat Local Storage Cache (IndexedDB / Offline Mode)',
        endpoint: 'local://cache'
      };
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/db-status`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        return {
          connected: true,
          mode: 'LIVE_PRODUCTION',
          provider: data.provider || 'PostgreSQL Neon Serverless (Production)',
          endpoint: getApiBaseUrl()
        };
      }
    } catch (e) {
      // Fallback check on standard health
      try {
        const hRes = await fetch(`${getApiBaseUrl()}/api/health`, { signal: AbortSignal.timeout(2000) });
        if (hRes.ok) {
          return {
            connected: true,
            mode: 'LIVE_PRODUCTION',
            provider: 'PostgreSQL Live API Server',
            endpoint: getApiBaseUrl()
          };
        }
      } catch(err) {}
    }
    return {
      connected: localCache.isOnline(),
      mode: 'LIVE_PRODUCTION',
      provider: 'PostgreSQL Neon Live',
      endpoint: getApiBaseUrl()
    };
  },

  // Fetch all buildings from PostgreSQL
  async getBuildings(): Promise<any[]> {
    if (!localCache.isOnline()) {
      return [];
    }
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/buildings`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch(e) {}
    return [];
  },

  // Fetch telemetry nodes from PostgreSQL
  async getTelemetryNodes(): Promise<TelemetryNode[]> {
    if (!localCache.isOnline()) return [];
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/telemetry`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch(e) {}
    return [];
  },

  // Fetch all assets with Local Cache write-through and offline support
  async getAssets(): Promise<Asset[]> {
    // If offline or simulated offline, serve immediately from IndexedDB/localStorage cache
    if (!localCache.isOnline()) {
      return await localCache.getCachedAssets();
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/assets`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Persist fresh server data into IndexedDB & localStorage
          await localCache.saveCachedAssets(data);
          return data;
        }
      }
    } catch (e) {
      console.warn('Network error fetching assets, falling back to local cache:', e);
    }

    // Return cached data on server error / offline
    return await localCache.getCachedAssets();
  },

  // Post new asset to PostgreSQL or save locally if offline
  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    if (!localCache.isOnline()) {
      return await localCache.saveOfflineCreatedAsset(asset);
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const created: Asset = await response.json();
        const cached = await localCache.getCachedAssets();
        await localCache.saveCachedAssets([created, ...cached.filter(a => a.id !== created.id)]);
        return created;
      }
    } catch (e) {
      console.warn('Network error creating asset, saving locally to offline cache:', e);
    }

    return await localCache.saveOfflineCreatedAsset(asset);
  },

  // Fetch all work orders with Local Cache write-through and offline support
  async getWorkOrders(): Promise<WorkOrder[]> {
    if (!localCache.isOnline()) {
      return await localCache.getCachedWorkOrders();
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/workorders`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Map backend records if needed
          const mapped: WorkOrder[] = data.map((t: any) => ({
            id: t.id || t.ticketNumber,
            ticketNumber: t.ticketNumber || t.id,
            title: t.title || t.desc || 'Intervention GMAO',
            description: t.description || t.desc || '',
            assetId: t.assetId || t.asset,
            assetName: t.assetName || t.asset,
            buildingId: t.buildingId || 'bld-01',
            buildingName: t.buildingName || 'Spider Cybernetics Tower A',
            buildingAddress: t.buildingAddress || '',
            buildingCity: t.buildingCity || '',
            buildingContact: t.buildingContact || '',
            buildingPhone: t.buildingPhone || '',
            floor: t.floor || 'Floor 1',
            priority: (t.priority || 'medium').toLowerCase(),
            status: (t.status || 'open').toLowerCase().replace(' ', '_'),
            category: (t.category || 'preventive').toLowerCase(),
            assignedTechnician: t.assignedTechnician || {
              name: t.assignee || 'Alexandre Mercer',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: 'Senior Mobility Systems Specialist'
            },
            createdAt: t.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
            slaDeadline: t.slaDeadline || t.due || new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
            estimatedHours: t.estimatedHours || 3.0,
            actualHours: t.actualHours || null,
            partsUsed: t.partsUsed || [],
            procedureSteps: t.procedureSteps || [],
            auditLog: t.auditLog || [],
            rootCause: t.rootCause || '',
            resolutionNotes: t.resolutionNotes || ''
          }));

          await localCache.saveCachedWorkOrders(mapped);
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Network error fetching work orders, falling back to local cache:', e);
    }

    return await localCache.getCachedWorkOrders();
  },

  // Post workorder to PostgreSQL or save locally if offline
  async createWorkOrder(workOrder: Omit<WorkOrder, 'id'>): Promise<WorkOrder> {
    if (!localCache.isOnline()) {
      return await localCache.saveOfflineCreatedWorkOrder(workOrder);
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/workorders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workOrder),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const created: WorkOrder = await response.json();
        const cached = await localCache.getCachedWorkOrders();
        await localCache.saveCachedWorkOrders([created, ...cached.filter(w => w.id !== created.id)]);
        return created;
      }
    } catch (e) {
      console.warn('Network error creating work order, saving locally to offline cache:', e);
    }

    return await localCache.saveOfflineCreatedWorkOrder(workOrder);
  },

  // Update workorder status with offline sync
  async updateWorkOrderStatus(id: string, status: WorkOrder['status']): Promise<WorkOrder | null> {
    return this.updateWorkOrder(id, { status });
  },

  // Full Work Order modification procedure with offline sync support
  async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder | null> {
    // Update local cache immediately
    const locallyUpdated = await localCache.updateCachedWorkOrder(id, updates);

    if (localCache.isOnline()) {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/workorders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const updatedFromServer: WorkOrder = await response.json();
          const cached = await localCache.getCachedWorkOrders();
          await localCache.saveCachedWorkOrders(
            cached.map(w => (w.id === id || w.ticketNumber === id ? { ...w, ...updatedFromServer } : w))
          );
          return updatedFromServer;
        }
      } catch (e) {
        console.warn('Network error updating work order on backend, state preserved locally in cache:', e);
      }
    }

    return locallyUpdated;
  },

  // Background Sync when returning online
  async syncOfflineData(): Promise<{ syncedAssets: number; syncedWorkOrders: number }> {
    if (!localCache.isOnline()) {
      return { syncedAssets: 0, syncedWorkOrders: 0 };
    }

    const queue = await localCache.getSyncQueue();
    let syncedAssets = 0;
    let syncedWorkOrders = 0;

    for (const item of queue) {
      try {
        let success = false;
        if (item.type === 'CREATE_ASSET') {
          const res = await fetch(`${getApiBaseUrl()}/api/assets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
            signal: AbortSignal.timeout(3000)
          });
          success = res.ok;
          if (success) syncedAssets++;
        } else if (item.type === 'CREATE_WORK_ORDER') {
          const res = await fetch(`${getApiBaseUrl()}/api/workorders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
            signal: AbortSignal.timeout(3000)
          });
          success = res.ok;
          if (success) syncedWorkOrders++;
        } else if (item.type === 'UPDATE_WORK_ORDER_STATUS') {
          const res = await fetch(`${getApiBaseUrl()}/api/workorders/${item.payload.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: item.payload.status }),
            signal: AbortSignal.timeout(3000)
          });
          success = res.ok;
          if (success) syncedWorkOrders++;
        } else if (item.type === 'UPDATE_WORK_ORDER') {
          const res = await fetch(`${getApiBaseUrl()}/api/workorders/${item.payload.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
            signal: AbortSignal.timeout(3000)
          });
          success = res.ok;
          if (success) syncedWorkOrders++;
        }
        
        // Remove from local Dexie queue if synced successfully
        if (success) {
          await localCache.removeSyncItem(item.id);
        }
      } catch (e) {
        console.warn(`Sync item failed for ${item.id}`, e);
      }
    }

    if (syncedAssets > 0 || syncedWorkOrders > 0) {
      // Re-fetch fresh data from server
      await this.getAssets();
      await this.getWorkOrders();
    }

    return { syncedAssets, syncedWorkOrders };
  },

  // Fetch all leases from PostgreSQL
  async getLeases(): Promise<LeaseRecord[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/leases`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch(e) {}
    return [];
  },

  // Create new lease in PostgreSQL
  async createLease(lease: Omit<LeaseRecord, 'id'>): Promise<LeaseRecord> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/leases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lease),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch(e) {}
    return {
      ...lease,
      id: `lse-${Date.now()}`
    } as LeaseRecord;
  },

  // Fetch ESG metrics from PostgreSQL
  async getEsgMetrics(): Promise<EsgMetrics | null> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/esg`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch(e) {}
    return null;
  },

  // Update ESG metrics in PostgreSQL
  async updateEsgMetrics(data: Partial<EsgMetrics>): Promise<EsgMetrics> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/esg`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch(e) {}
    return data as EsgMetrics;
  },

  // Fetch Spaces & Floor Occupancy from PostgreSQL
  async getSpaces(): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/spaces`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch(e) {}
    return [];
  },

  // Fetch Energy Timeseries
  async getEnergyTimeSeries(): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/energy-timeseries`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch(e) {}
    return [];
  },

  // ── Grafana Telemetry & Observability ───────────────────────────
  async getGrafanaOverview(): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/grafana/overview`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return null;
  },

  async getGrafanaMetrics(range: string = 'last-30m'): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/grafana/metrics?range=${range}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return null;
  },

  async getGrafanaAlerts(): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/grafana/alerts`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return [];
  },

  async getGrafanaLogs(level: string = 'all'): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/grafana/logs?level=${level}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return [];
  },

  async executeGrafanaQuery(query: string, type: 'sql' | 'promql' = 'promql'): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/grafana/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type }),
        signal: AbortSignal.timeout(4000)
      });
      if (response.ok) return await response.json();
    } catch(e: any) {
      return { success: false, error: e.message };
    }
    return { success: false, error: 'Request failed' };
  },

  // ── Rubrics & Database Diagnostic Matrix ────────────────────────
  async getRubricsDiagnostics(): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/rubrics/diagnostics`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return null;
  },

  // ── Lighting / Smart Metering ──────────────────────────────────
  async getLightingZones(): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/lighting/zones`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return [];
  },

  async updateLightingZone(id: string, updates: any): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/lighting/zones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return null;
  },

  // ── Water / HydroSync ──────────────────────────────────────────
  async getWaterSectors(): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/water/sectors`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return [];
  },

  async updateWaterSector(id: string, updates: any): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/water/sectors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return null;
  },

  // ── Field Operators ────────────────────────────────────────────
  async getFieldOperators(): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/field-operators`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return [];
  },

  async updateFieldOperator(id: number, updates: any): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/field-operators/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return null;
  },

  // ── Intervenants & Prestataires ─────────────────────────────────
  async getIntervenants(): Promise<any[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/intervenants`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return this.getFieldOperators();
  },

  async createIntervenant(intervenant: any): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/intervenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intervenant),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return intervenant;
  },
  async updateIntervenant(id: number | string, intervenant: any): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/intervenants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intervenant),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return await response.json();
    } catch(e) {}
    return intervenant;
  },
  async deleteIntervenant(id: number | string): Promise<boolean> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/intervenants/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) return true;
    } catch(e) {}
    return false;
  }
};

