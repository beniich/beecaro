export type NavigationTab = 
  | 'overview'
  | 'digital-twin'
  | 'grafana'
  | 'diagnostics'
  | 'cmms'
  | 'predictive'
  | 'assets'
  | 'water-sync'
  | 'air-quality'
  | 'lighting'
  | 'carbon-market'
  | 'inventory'
  | 'spaces'
  | 'esg-sustainability'
  | 'leases'
  | 'pricing'
  | 'qr-scanner'
  | 'ai-assistant'
  | 'threat-matrix'
  | 'sustainability-matrix'
  | 'traffic-hub'
  | 'settings';

export interface BuildingMetric {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  status: 'optimal' | 'warning' | 'critical';
  category: 'energy' | 'carbon' | 'water' | 'occupancy' | 'maintenance';
}

export interface Building {
  id: string;
  name: string;
  code: string;
  floors: number;
  areaSqM: number;
  occupancyRate: number;
  energyRating: 'A+' | 'A' | 'B' | 'C' | 'D';
  carbonIntensity: number; // kgCO2e/m2/yr
  healthScore: number; // 0-100
  address: string;
  city?: string;
  postalCode?: string;
  country?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  accessInstructions?: string;
  status: 'active' | 'maintenance' | 'offline';
}

export interface Intervenant {
  id: string | number;
  name: string;
  role: string;
  type: 'internal' | 'subcontractor'; // Interne ou Prestataire externe
  company: string;
  email: string;
  phone: string;
  specialties: string[];
  status: 'available' | 'in_intervention' | 'on_call' | 'unavailable';
  task?: string;
  load?: number;
  hourlyRateEur?: number;
  avatar?: string;
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  category: 'HVAC' | 'Electrical' | 'Plumbing' | 'Elevator' | 'Fire Safety' | 'Solar/Renewable' | 'IoT Sensor';
  buildingId: string;
  buildingName: string;
  floor: string;
  zone: string;
  status: 'operational' | 'degraded' | 'critical' | 'maintenance';
  healthScore: number; // 0-100
  lastInspected: string;
  nextService: string;
  installDate: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  powerConsumptionKw: number;
  telemetry: {
    tempC?: number;
    vibrationMmS?: number;
    pressureBar?: number;
    runtimeHours: number;
    efficiencyRatio: number; // %
  };
  qrCodeUrl: string;
}

export interface ProcedureStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  requiredValidation?: boolean;
}

export interface WorkOrderAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  details?: string;
}

export interface WorkOrder {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  assetId?: string;
  assetName?: string;
  buildingId: string;
  buildingName: string;
  buildingAddress?: string;
  buildingCity?: string;
  buildingContact?: string;
  buildingPhone?: string;
  floor: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'pending_parts' | 'resolved' | 'closed';
  category: 'preventive' | 'corrective' | 'inspection' | 'emergency' | 'esg_audit';
  assignedTechnician: {
    id?: string | number;
    name: string;
    avatar?: string;
    role: string;
    company?: string;
    phone?: string;
    email?: string;
    type?: 'internal' | 'subcontractor';
  };
  createdAt: string;
  slaDeadline: string;
  estimatedHours: number;
  actualHours?: number;
  partsUsed?: Array<{ name: string; cost: number; quantity: number; partNumber?: string }>;
  signatureUrl?: string;
  procedureSteps?: ProcedureStep[];
  resolutionNotes?: string;
  rootCause?: string;
  auditLog?: WorkOrderAuditEntry[];
}

export interface EsgMetrics {
  totalCarbonYtdTonnes: number;
  targetCarbonYtdTonnes: number;
  carbonReductionPercent: number;
  scope1KgCo2e: number;
  scope2KgCo2e: number;
  scope3KgCo2e: number;
  solarGeneratedKwh: number;
  gridImportKwh: number;
  waterRecycledLiters: number;
  wasteDiversionRate: number; // %
  carbonCreditsOwned: number;
  carbonCreditsRetired: number;
  airQualityIndexAvg: number;
  greenBuildingCert: 'LEED Platinum' | 'BREEAM Outstanding' | 'HQE Excellent';
}

export interface LeaseRecord {
  id: string;
  tenantName: string;
  tenantIndustry: string;
  contactPerson: string;
  contactEmail: string;
  buildingName: string;
  unitCode: string;
  areaSqM: number;
  startDate: string;
  endDate: string;
  monthlyRentUsd: number;
  depositUsd: number;
  status: 'active' | 'expiring_soon' | 'pending_renewal' | 'terminated';
  esgClauseCompliant: boolean;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

export interface TelemetryNode {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
  type: 'hvac' | 'power' | 'water' | 'air' | 'security' | 'lighting';
  value: string;
  status: 'normal' | 'alert' | 'offline';
  floor: number;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  actionableInsights?: Array<{
    title: string;
    actionLabel: string;
    category: 'energy' | 'cmms' | 'esg';
  }>;
}
