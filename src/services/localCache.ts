import Dexie, { Table } from 'dexie';
import { Asset, WorkOrder } from '../types';

export interface SyncQueueItem {
  id: string;
  type: 'CREATE_ASSET' | 'CREATE_WORK_ORDER' | 'UPDATE_WORK_ORDER_STATUS' | 'UPDATE_WORK_ORDER';
  payload: any;
  createdAt: string;
}

export interface CacheMetadata {
  lastSync: string;
  assetCount: number;
  workOrderCount: number;
  pendingSyncCount: number;
  storageEngine: 'Dexie/IndexedDB';
  isOnline: boolean;
  isSimulatedOffline: boolean;
}

// 1. Définition de la base de données locale (Local-First avec Dexie)
class BeeCarbonatDatabase extends Dexie {
  assets!: Table<Asset, string>;
  workOrders!: Table<WorkOrder, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  metadata!: Table<{ key: string, value: any }, string>;

  constructor() {
    super('BeeCarbonatOfflineDB');
    // Déclaration du schéma de base (Identique au serveur)
    this.version(1).stores({
      assets: 'id, name, status, buildingId, category',
      workOrders: 'id, ticketNumber, status, priority, assetId, buildingId',
      syncQueue: 'id, type, createdAt',
      metadata: 'key'
    });
  }
}

export const db = new BeeCarbonatDatabase();

// Event listeners for cache updates across components
type CacheListener = () => void;
const cacheListeners: Set<CacheListener> = new Set();

const notifyListeners = () => {
  cacheListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('Cache listener error:', e);
    }
  });
};

const LS_SIMULATED_OFFLINE_KEY = 'beecarbonat_simulated_offline';

export const localCache = {
  subscribe(listener: CacheListener): () => void {
    cacheListeners.add(listener);
    return () => cacheListeners.delete(listener);
  },

  isSimulatedOffline(): boolean {
    return false;
  },

  setSimulatedOffline(enabled: boolean) {
    // Deprecated for production
    notifyListeners();
  },

  isOnline(): boolean {
    if (this.isSimulatedOffline()) return false;
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  },

  // --- ASSETS ---
  async getCachedAssets(): Promise<Asset[]> {
    return await db.assets.toArray();
  },

  async saveCachedAssets(assets: Asset[]): Promise<void> {
    if (!assets || !Array.isArray(assets)) return;
    await db.assets.clear();
    await db.assets.bulkAdd(assets);
    this.updateMetadataTimestamp();
    notifyListeners();
  },

  async saveOfflineCreatedAsset(assetData: Omit<Asset, 'id'> | Asset): Promise<Asset> {
    const assetId = (assetData as Asset).id || `ast-offline-${Date.now()}`;
    const newAsset: Asset = {
      ...(assetData as any),
      id: assetId,
      code: assetData.code || `AST-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      qrCodeUrl: assetData.qrCodeUrl || `https://beecarbonat.internal/qr/${assetId}`
    };

    await db.assets.put(newAsset);

    await this.addToSyncQueue({
      id: `sync-asset-${assetId}`,
      type: 'CREATE_ASSET',
      payload: newAsset,
      createdAt: new Date().toISOString()
    });

    return newAsset;
  },

  // --- WORK ORDERS ---
  async getCachedWorkOrders(): Promise<WorkOrder[]> {
    return await db.workOrders.toArray();
  },

  async saveCachedWorkOrders(workOrders: WorkOrder[]): Promise<void> {
    if (!workOrders || !Array.isArray(workOrders)) return;
    await db.workOrders.clear();
    await db.workOrders.bulkAdd(workOrders);
    this.updateMetadataTimestamp();
    notifyListeners();
  },

  async saveOfflineCreatedWorkOrder(woData: Omit<WorkOrder, 'id'> | WorkOrder): Promise<WorkOrder> {
    const woId = (woData as WorkOrder).id || `wo-offline-${Date.now()}`;
    const newWo: WorkOrder = {
      ...(woData as any),
      id: woId,
      ticketNumber: (woData as any).ticketNumber || `WO-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: (woData as any).createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
      slaDeadline: (woData as any).slaDeadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16)
    };

    await db.workOrders.put(newWo);

    await this.addToSyncQueue({
      id: `sync-wo-${woId}`,
      type: 'CREATE_WORK_ORDER',
      payload: newWo,
      createdAt: new Date().toISOString()
    });

    return newWo;
  },

  async updateCachedWorkOrderStatus(idOrTicket: string, status: WorkOrder['status']): Promise<WorkOrder | null> {
    return this.updateCachedWorkOrder(idOrTicket, { status });
  },

  async updateCachedWorkOrder(idOrTicket: string, updates: Partial<WorkOrder>): Promise<WorkOrder | null> {
    const wo = await db.workOrders.get(idOrTicket) || await db.workOrders.where('ticketNumber').equals(idOrTicket).first();
    
    if (wo) {
      const newAuditLog = [
        ...(wo.auditLog || []),
        {
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          user: updates.assignedTechnician?.name || 'Opérateur CAFM',
          action: 'Modification locale (Hors-ligne)',
          details: `Mise à jour: ${Object.keys(updates).join(', ')}`
        }
      ];

      const updatedWo = { ...wo, ...updates, auditLog: updates.auditLog || newAuditLog };
      await db.workOrders.put(updatedWo);

      await this.addToSyncQueue({
        id: `sync-wo-update-${idOrTicket}-${Date.now()}`,
        type: 'UPDATE_WORK_ORDER',
        payload: { id: wo.id, ...updates },
        createdAt: new Date().toISOString()
      });

      notifyListeners();
      return updatedWo;
    }
    return null;
  },

  // --- SYNC QUEUE ---
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await db.syncQueue.orderBy('createdAt').toArray();
  },

  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    await db.syncQueue.put(item);
    notifyListeners();
  },

  async clearSyncQueue(): Promise<void> {
    await db.syncQueue.clear();
    notifyListeners();
  },

  async removeSyncItem(id: string): Promise<void> {
    await db.syncQueue.delete(id);
    notifyListeners();
  },

  // --- METADATA & UTILS ---
  async updateMetadataTimestamp() {
    await db.metadata.put({ key: 'lastSync', value: new Date().toISOString() });
  },

  async getCacheMetadata(): Promise<CacheMetadata> {
    const assetCount = await db.assets.count();
    const workOrderCount = await db.workOrders.count();
    const pendingSyncCount = await db.syncQueue.count();
    
    const lastSyncObj = await db.metadata.get('lastSync');
    const lastSync = lastSyncObj ? lastSyncObj.value : new Date().toISOString();

    return {
      lastSync,
      assetCount,
      workOrderCount,
      pendingSyncCount,
      storageEngine: 'Dexie/IndexedDB',
      isOnline: this.isOnline(),
      isSimulatedOffline: this.isSimulatedOffline()
    };
  },

  async clearCache(): Promise<void> {
    await db.assets.clear();
    await db.workOrders.clear();
    await db.metadata.clear();
    await db.syncQueue.clear();
    notifyListeners();
  },

  async primeDefaultCache(): Promise<void> {
    await this.saveCachedAssets([]);
    await this.saveCachedWorkOrders([]);
  }
};
