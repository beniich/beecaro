import { 
  mockBuildings, 
  mockAssets, 
  mockWorkOrders, 
  mockEsgMetrics, 
  mockLeases, 
  mockTelemetryNodes, 
  mockEnergyTimeSeries,
  mockIntervenants
} from '../data/mockData';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string;
  details: any;
}

export interface MroItem {
  id: string;
  reference: string;
  name: string;
  category: 'CVC' | 'Électrique' | 'Plomberie' | 'Éclairage' | 'Filtration' | 'Autre';
  currentStock: number;
  minThreshold: number;
  unitPriceEur: number;
  supplier: string;
  location: string;
  compatibleAssets: string[];
  status: 'optimal' | 'low_stock' | 'critical_shortage';
  lastRestocked: string;
}

// In-memory fallback stores
export let assetsStore: any[] = [...mockAssets];
export let workordersStore: any[] = [...mockWorkOrders];
export let buildingsStore: any[] = [...mockBuildings];
export let leasesStore: any[] = [...mockLeases];
export let telemetryStore: any[] = [...mockTelemetryNodes];

export const mockLightingZones = [
  { id: 'zone-1', name: 'Plateaux Bureaux Open Space (Étage 2-10)', luminaires: 340, status: 'active', protocol: 'DALI-2', consumptionKw: 12.4, brightness: 75, colorTemp: 4000, circadianMode: true, powerStatus: true },
  { id: 'zone-2', name: 'Salles de Réunion & Visio', luminaires: 85, status: 'active', protocol: 'KNX / DALI', consumptionKw: 3.8, brightness: 60, colorTemp: 3500, circadianMode: true, powerStatus: true },
  { id: 'zone-3', name: 'Hall d\'Accueil & Atrium Verrière', luminaires: 120, status: 'active', protocol: 'DMX-512', consumptionKw: 6.2, brightness: 80, colorTemp: 4500, circadianMode: true, powerStatus: true },
  { id: 'zone-4', name: 'Éclairage Extérieur & Esplanade', luminaires: 64, status: 'active', protocol: 'LoRaWAN / Zhaga', consumptionKw: 4.1, brightness: 90, colorTemp: 3000, circadianMode: false, powerStatus: true },
  { id: 'zone-5', name: 'Parkings Souterrains (Détection)', luminaires: 190, status: 'dimmed', protocol: 'Zigbee Pro', consumptionKw: 2.9, brightness: 30, colorTemp: 4000, circadianMode: true, powerStatus: true },
];
export let lightingZonesStore: any[] = [...mockLightingZones];

export const mockWaterSectors = [
  { id: 'sector-1', name: 'Secteur 1 : Tour Nord - Bureaux', status: 'optimal', pressure: 4.2, flow: 14.8, temp: 18.2, valveOpen: true, leakMitigated: false },
  { id: 'sector-2', name: 'Secteur 2 : Tour Sud & Atrium', status: 'optimal', pressure: 4.1, flow: 12.1, temp: 18.5, valveOpen: true, leakMitigated: false },
  { id: 'sector-3', name: 'Secteur 3 : Restaurant & Cuisines', status: 'optimal', pressure: 3.9, flow: 8.5, temp: 22.1, valveOpen: true, leakMitigated: false },
  { id: 'sector-4', name: 'Secteur 4 : Boucle Refroidissement CVC', status: 'warning', pressure: 2.8, flow: 38.5, temp: 26.4, valveOpen: true, leakMitigated: false },
  { id: 'sector-5', name: 'Secteur 5 : Récupération Eaux Pluviales', status: 'optimal', pressure: 3.5, flow: 6.2, temp: 16.0, valveOpen: true, leakMitigated: false },
];
export let waterSectorsStore: any[] = [...mockWaterSectors];

export let fieldOperatorsStore: any[] = [...mockIntervenants];

export const initialMroItems: MroItem[] = [
  {
    id: 'mro-01',
    reference: 'FLT-HEPA-H14',
    name: 'Filtre HEPA Haute Efficacité H14 (CTA Centrale)',
    category: 'Filtration',
    currentStock: 14,
    minThreshold: 5,
    unitPriceEur: 145.0,
    supplier: 'Camfil Farr CleanAir',
    location: 'Magasin Central - Rayon B3',
    compatibleAssets: ['ast-01', 'ast-02'],
    status: 'optimal',
    lastRestocked: '2026-02-15'
  },
  {
    id: 'mro-02',
    reference: 'VLV-MTR-DN50',
    name: 'Servomoteur de vanne de régulation 24V Belimo',
    category: 'CVC',
    currentStock: 2,
    minThreshold: 3,
    unitPriceEur: 320.0,
    supplier: 'Belimo France SAS',
    location: 'Magasin Central - Armoire A1',
    compatibleAssets: ['ast-01', 'ast-03'],
    status: 'low_stock',
    lastRestocked: '2026-01-10'
  },
  {
    id: 'mro-03',
    reference: 'BRG-SKF-6308',
    name: 'Roulement à billes céramique SKF 6308-2RS',
    category: 'CVC',
    currentStock: 1,
    minThreshold: 4,
    unitPriceEur: 85.5,
    supplier: 'SKF Motion Technologies',
    location: 'Atelier Mécanique - Tiroir C2',
    compatibleAssets: ['ast-01', 'ast-04'],
    status: 'critical_shortage',
    lastRestocked: '2025-11-20'
  },
  {
    id: 'mro-04',
    reference: 'DRV-DALI-75W',
    name: 'Driver LED DALI-2 Constant Current 75W Osram',
    category: 'Éclairage',
    currentStock: 28,
    minThreshold: 10,
    unitPriceEur: 42.0,
    supplier: 'Osram Digital Systems',
    location: 'Magasin Central - Rayon E1',
    compatibleAssets: ['zone-1', 'zone-2', 'zone-3'],
    status: 'optimal',
    lastRestocked: '2026-03-01'
  },
  {
    id: 'mro-05',
    reference: 'PRS-TRN-010B',
    name: 'Transmetteur de pression 0-10 bar 4-20mA Danfoss',
    category: 'Plomberie',
    currentStock: 6,
    minThreshold: 2,
    unitPriceEur: 190.0,
    supplier: 'Danfoss Commercial',
    location: 'Atelier Fluides - Armoire F2',
    compatibleAssets: ['sector-1', 'sector-4'],
    status: 'optimal',
    lastRestocked: '2026-02-28'
  }
];

export let mroStore: MroItem[] = [...initialMroItems];

export let auditLogsStore: AuditLogEntry[] = [
  {
    id: 'aud-init-01',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'usr-admin-system',
    action: 'INIT_SYSTEM',
    entity: 'CORE',
    entityId: 'SYSTEM',
    ipAddress: '127.0.0.1',
    details: { message: 'BeeCarbonat CAFM Core engine initialized' }
  }
];

// Helper mutation functions to keep stores synchronized across modules
export const setAssetsStore = (newStore: any[]) => { assetsStore = newStore; };
export const setWorkordersStore = (newStore: any[]) => { workordersStore = newStore; };
export const setBuildingsStore = (newStore: any[]) => { buildingsStore = newStore; };
export const setLeasesStore = (newStore: any[]) => { leasesStore = newStore; };
export const setTelemetryStore = (newStore: any[]) => { telemetryStore = newStore; };
export const setLightingZonesStore = (newStore: any[]) => { lightingZonesStore = newStore; };
export const setWaterSectorsStore = (newStore: any[]) => { waterSectorsStore = newStore; };
export const setFieldOperatorsStore = (newStore: any[]) => { fieldOperatorsStore = newStore; };
export const setMroStore = (newStore: MroItem[]) => { mroStore = newStore; };
export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
  const newLog: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  auditLogsStore.unshift(newLog);
  // Keep last 500 logs in memory
  if (auditLogsStore.length > 500) {
    auditLogsStore = auditLogsStore.slice(0, 500);
  }
  return newLog;
};
