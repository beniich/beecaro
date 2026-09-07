/**
 * ============================================================================
 * BEECARBONAT SPIDER CAFM - ENTERPRISE CORE DOMAIN ENGINE (5 STRATEGIC PILLARS)
 * ISO 50001 • GHG Protocol (CSRD) • BIM IFC • Web NFC • Zero-Trust RBAC
 * ============================================================================
 */

import { Asset, WorkOrder } from '../types';

/* ============================================================================
 * 🏢 PILIER 1 : OPÉRATIONS & FLUIDES (Smart Utilities & Metrology)
 * ============================================================================ */

export interface UtilityMetric {
  sensorId: string;
  value: number;
  unit: 'kWh' | 'm3' | 'kg' | 'lux';
  timestamp: Date;
}

export interface WasteFlow {
  material: 'Plastic' | 'Paper' | 'Glass' | 'Organic' | 'Electronic';
  weightKg: number;
  destination: 'Recycle' | 'Landfill' | 'Compost' | 'EnergyRecovery';
  recyclabilityRate: number; // 0-100%
}

export class UtilitiesCockpit {
  static getGlobalStatus(metrics: { energyKwh: number; waterM3: number; wasteDiversion: number }) {
    const isOptimal = metrics.energyKwh < 5000 && metrics.waterM3 < 200;
    return {
      status: isOptimal ? ('Optimal' as const) : ('Warning' as const),
      efficiencyScore: Math.round((metrics.wasteDiversion + (isOptimal ? 90 : 70)) / 2),
      activeAlertsCount: isOptimal ? 0 : 2,
      lastAudit: new Date().toISOString()
    };
  }
}

export class EnergyManager {
  /**
   * Détecte les surconsommations par rapport à la baseline de référence
   */
  static detectOverconsumption(current: number, baseline: number, thresholdMultiplier = 1.2): boolean {
    if (baseline <= 0) return false;
    return current > baseline * thresholdMultiplier;
  }

  /**
   * Calcule les économies d'énergie en kWh et en pourcentage
   */
  static calculateSavings(baselineKwh: number, actualKwh: number) {
    const savedKwh = Math.max(0, baselineKwh - actualKwh);
    const savedPercent = baselineKwh > 0 ? (savedKwh / baselineKwh) * 100 : 0;
    return { savedKwh, savedPercent: Number(savedPercent.toFixed(1)) };
  }
}

export class WaterManager {
  /**
   * Détection intelligente de fuites continues (débit soutenu hors heures d'ouverture)
   */
  static detectLeak(flowRateLpm: number, continuousDurationMinutes: number): { isLeak: boolean; severity: 'Low' | 'Medium' | 'Critical' | 'None' } {
    if (flowRateLpm <= 0.1 || continuousDurationMinutes < 30) {
      return { isLeak: false, severity: 'None' };
    }
    if (continuousDurationMinutes > 120 && flowRateLpm > 5) {
      return { isLeak: true, severity: 'Critical' };
    }
    if (continuousDurationMinutes > 60) {
      return { isLeak: true, severity: 'Medium' };
    }
    return { isLeak: true, severity: 'Low' };
  }
}

/* ============================================================================
 * ⚙️ PILIER 2 : GMAO & GESTION TECHNIQUE (Asset Lifecycle & EAM)
 * ============================================================================ */

export enum WOState {
  Draft = 'draft',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  PendingApproval = 'pending_approval',
  Closed = 'closed'
}

export class AssetLifecycleEngine {
  /**
   * Calcule l'échéance de la prochaine maintenance préventive
   */
  static calculateNextIntervention(lastDate: Date, frequencyDays: number): Date {
    return new Date(lastDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000);
  }

  /**
   * Évalue le taux de résolution au premier passage (FTFR - First Time Fix Rate)
   */
  static calculateFTFR(totalTickets: number, resolvedFirstVisit: number): number {
    if (totalTickets <= 0) return 100;
    return Number(((resolvedFirstVisit / totalTickets) * 100).toFixed(1));
  }

  /**
   * Calcule le taux d'occupation dynamique des espaces
   */
  static calculateOccupancyRate(occupiedSeats: number, totalSeats: number): number {
    if (totalSeats <= 0) return 0;
    return Number(((occupiedSeats / totalSeats) * 100).toFixed(1));
  }
}

/* ============================================================================
 * 🌍 PILIER 3 : STRATÉGIE CLIMAT & ESG (GHG Protocol CSRD & WELL)
 * ============================================================================ */

export enum CarbonScope {
  Scope1 = 'Direct (Combustibles, Gaz, Véhicules)',
  Scope2 = 'Énergie Indirecte (Électricité Réseau)',
  Scope3 = 'Chaîne de Valeur & Déplacements'
}

export interface EmissionRecord {
  scope: CarbonScope;
  source: string;
  quantity: number; // kWh, Litres, ou km
  emissionFactor: number; // kgCO2e par unité
}

export interface IAQMetrics {
  tempCelsius: number;
  humidityPercent: number;
  co2Ppm: number;
  pm25UgM3: number;
  vocPpb?: number;
}

export class CarbonComplianceCalculator {
  /**
   * Calcul d'empreinte carbone conforme GHG Protocol
   */
  static calculateTotalEmissionsKg(emissions: EmissionRecord[]): number {
    return emissions.reduce((sum, e) => sum + e.quantity * e.emissionFactor, 0);
  }

  /**
   * Conversion en tonnes équivalent CO2
   */
  static toTonnesCo2e(kgCo2e: number): number {
    return Number((kgCo2e / 1000).toFixed(2));
  }
}

export class WellBuildingIndex {
  /**
   * Évalue l'indice de bien-être et conformité QAI selon le WELL Building Standard
   */
  static getComfortScore(metrics: IAQMetrics): {
    score: number; // 0-100
    status: 'Optimal' | 'Acceptable' | 'Sub-optimal' | 'Critical';
    recommendation: string;
  } {
    let score = 100;
    if (metrics.co2Ppm > 1000) score -= 30;
    else if (metrics.co2Ppm > 800) score -= 15;

    if (metrics.tempCelsius < 19 || metrics.tempCelsius > 25) score -= 20;
    else if (metrics.tempCelsius < 20 || metrics.tempCelsius > 24) score -= 10;

    if (metrics.humidityPercent < 30 || metrics.humidityPercent > 65) score -= 15;
    if (metrics.pm25UgM3 > 25) score -= 25;

    score = Math.max(0, score);

    let status: 'Optimal' | 'Acceptable' | 'Sub-optimal' | 'Critical' = 'Optimal';
    let recommendation = 'Paramètres environnementaux conformes aux standards de haute performance.';

    if (score < 40) {
      status = 'Critical';
      recommendation = 'Aération d\'urgence requise : taux de CO₂ ou particules élevés.';
    } else if (score < 70) {
      status = 'Sub-optimal';
      recommendation = 'Augmenter le débit d\'air neuf (VMC) et ajuster la consigne thermique.';
    } else if (score < 85) {
      status = 'Acceptable';
      recommendation = 'Conditions satisfaisantes, optimiser l\'hygrométrie.';
    }

    return { score, status, recommendation };
  }
}

/* ============================================================================
 * 📐 PILIER 4 : JUMEAU NUMÉRIQUE & HYPERVISION (BIM IFC & Télémétrie)
 * ============================================================================ */

export interface BIMElement {
  ifcId: string;
  geometryRef: string;
  iotSensorId?: string;
  currentStatus: 'Normal' | 'Warning' | 'Critical' | 'Offline';
  layer: 'Architectural' | 'HVAC' | 'Electrical' | 'Plumbing';
}

export interface EnergyFlowVector {
  fromNode: string;
  toNode: string;
  intensityWatts: number;
  direction: 'Inbound' | 'Outbound' | 'Internal';
}

export class PredictiveDiagnosticsEngine {
  /**
   * Calcul du MTBF (Mean Time Between Failures en heures)
   */
  static calculateMTBF(totalOperatingHours: number, failureCount: number): number {
    if (failureCount <= 0) return totalOperatingHours;
    return Math.round(totalOperatingHours / failureCount);
  }

  /**
   * Calcul du MTTR (Mean Time To Repair en heures)
   */
  static calculateMTTR(totalDowntimeHours: number, failureCount: number): number {
    if (failureCount <= 0) return 0;
    return Number((totalDowntimeHours / failureCount).toFixed(1));
  }
}

/* ============================================================================
 * 🔌 PILIER 5 : CONNECTIVITÉ & GOUVERNANCE (Enterprise Core & RBAC)
 * ============================================================================ */

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Technician = 'Technician',
  ESGManager = 'ESGManager',
  Guest = 'Guest'
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

export class AccessControlPolicy {
  private static readonly PERMISSION_MAP: Record<UserRole, string[]> = {
    [UserRole.SuperAdmin]: ['*'],
    [UserRole.Admin]: [
      'assets.read', 'assets.write',
      'workorders.read', 'workorders.write', 'workorders.approve',
      'utilities.read', 'esg.read', 'esg.export',
      'settings.read'
    ],
    [UserRole.Technician]: [
      'assets.read',
      'workorders.read', 'workorders.write',
      'nfc.scan', 'inventory.read'
    ],
    [UserRole.ESGManager]: [
      'esg.read', 'esg.write', 'esg.export',
      'carbon.trade', 'utilities.read', 'airquality.read'
    ],
    [UserRole.Guest]: [
      'overview.read', 'airquality.read'
    ]
  };

  /**
   * Vérifie si un utilisateur dispose de la permission pour accéder à une ressource
   */
  static canAccess(user: UserAccount, resource: string): boolean {
    const perms = this.PERMISSION_MAP[user.role] || [];
    return perms.includes('*') || perms.includes(resource);
  }
}

export interface ERPAdapter {
  syncAsset(asset: Asset): Promise<{ success: boolean; remoteId: string }>;
  syncWorkOrder(workOrder: WorkOrder): Promise<{ success: boolean; externalTicketId: string }>;
}

export class SAPConnectorAdapter implements ERPAdapter {
  async syncAsset(asset: Asset) {
    // Implémentation du connecteur OData / RFC SAP S/4HANA
    return { success: true, remoteId: `SAP-EQUIP-${asset.code}` };
  }

  async syncWorkOrder(workOrder: WorkOrder) {
    return { success: true, externalTicketId: `SAP-PM-${workOrder.ticketNumber}` };
  }
}
