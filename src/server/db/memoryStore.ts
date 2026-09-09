import { 
  mockBuildings, 
  mockAssets, 
  mockWorkOrders, 
  mockLeases, 
  mockTelemetryNodes, 
  mockIntervenants 
} from '../../data/mockData';

const mockLightingZones = [
  { id: 'zone-1', name: 'Plateaux Bureaux Open Space (Étage 2-10)', luminaires: 340, status: 'active', protocol: 'DALI-2', consumptionKw: 12.4, brightness: 75, colorTemp: 4000, circadianMode: true, powerStatus: true },
  { id: 'zone-2', name: 'Salles de Réunion & Visio', luminaires: 85, status: 'active', protocol: 'KNX / DALI', consumptionKw: 3.8, brightness: 60, colorTemp: 3500, circadianMode: true, powerStatus: true },
  { id: 'zone-3', name: 'Hall d\'Accueil & Atrium Verrière', luminaires: 120, status: 'active', protocol: 'DMX-512', consumptionKw: 6.2, brightness: 80, colorTemp: 4500, circadianMode: true, powerStatus: true },
  { id: 'zone-4', name: 'Éclairage Extérieur & Esplanade', luminaires: 64, status: 'active', protocol: 'LoRaWAN / Zhaga', consumptionKw: 4.1, brightness: 90, colorTemp: 3000, circadianMode: false, powerStatus: true },
  { id: 'zone-5', name: 'Parkings Souterrains (Détection)', luminaires: 190, status: 'dimmed', protocol: 'Zigbee Pro', consumptionKw: 2.9, brightness: 30, colorTemp: 4000, circadianMode: true, powerStatus: true },
];

const mockWaterSectors = [
  { id: 'sector-1', name: 'Secteur 1 : Tour Nord - Bureaux', status: 'optimal', pressure: 4.2, flow: 14.8, temp: 18.2, valveOpen: true, leakMitigated: false },
  { id: 'sector-2', name: 'Secteur 2 : Tour Sud & Atrium', status: 'optimal', pressure: 4.1, flow: 12.1, temp: 18.5, valveOpen: true, leakMitigated: false },
  { id: 'sector-3', name: 'Secteur 3 : Restaurant & Cuisines', status: 'optimal', pressure: 3.9, flow: 8.5, temp: 22.1, valveOpen: true, leakMitigated: false },
  { id: 'sector-4', name: 'Secteur 4 : Boucle Refroidissement CVC', status: 'warning', pressure: 2.8, flow: 38.5, temp: 26.4, valveOpen: true, leakMitigated: false },
  { id: 'sector-5', name: 'Secteur 5 : Récupération Eaux Pluviales', status: 'optimal', pressure: 3.5, flow: 6.2, temp: 16.0, valveOpen: true, leakMitigated: false },
];

export const stores = {
  assetsStore: [...mockAssets],
  workordersStore: [...mockWorkOrders],
  buildingsStore: [...mockBuildings],
  leasesStore: [...mockLeases],
  telemetryStore: [...mockTelemetryNodes],
  lightingZonesStore: [...mockLightingZones],
  waterSectorsStore: [...mockWaterSectors],
  fieldOperatorsStore: [...mockIntervenants]
};
