export type BimDiscipline = 'structure' | 'hvac' | 'plumbing' | 'electrical' | 'equipment' | 'space' | 'sensor';

export type BimRenderMode = 'pbr' | 'xray' | 'wireframe' | 'thermal' | 'clipping';

export interface BimLayerVisibility {
  walls: boolean;            // Murs, cloisons et façades (IfcWall, IfcWallStandardCase, IfcCurtainWall)
  foundations: boolean;      // Fondations, dalles, radier, poteaux et structure (IfcSlab, IfcColumn, IfcBeam, IfcFooting)
  hvac: boolean;             // Gaines CVC, ventilation, climatisation, CTA (IfcDuctSegment, IfcAirTerminal)
  plumbing: boolean;         // Canalisations, fluides, eau chaude/froide (IfcPipeSegment, IfcFlowTerminal)
  electrical: boolean;       // Réseaux électriques, chemins de câbles, TGBT (IfcCableCarrier, TGBT)
  equipment: boolean;        // Équipements techniques, pompes, chaudières, chillers (IfcPump, IfcBoiler, IfcChiller)
  spaces: boolean;           // Espaces, pièces et volumes (IfcSpace)
}

export function getElementLayer(elem: BimElement): keyof BimLayerVisibility {
  if (elem.discipline === 'hvac') return 'hvac';
  if (elem.discipline === 'plumbing') return 'plumbing';
  if (elem.discipline === 'electrical') return 'electrical';
  if (elem.discipline === 'equipment') return 'equipment';
  if (elem.discipline === 'space') return 'spaces';
  
  const type = (elem.ifcType || '').toLowerCase();
  const name = (elem.name || '').toLowerCase();
  if (
    type.includes('wall') || 
    type.includes('curtain') || 
    name.includes('mur') || 
    name.includes('façade') || 
    name.includes('facade') || 
    name.includes('cloison') ||
    name.includes('vitrage')
  ) {
    return 'walls';
  }
  return 'foundations';
}

export interface BimProperty {
  name: string;
  value: string | number | boolean;
  unit?: string;
  category?: string;
}

export interface BimElement {
  id: string;
  guid: string;
  name: string;
  ifcType: string; // e.g. 'IfcWall', 'IfcDuctSegment', 'IfcPipeSegment', 'IfcPump', 'IfcUnitaryEquipment', 'IfcSpace', 'IfcSlab', 'IfcColumn'
  discipline: BimDiscipline;
  floor: number | string; // e.g. -2, -1, 0, 1, 2, 3, 4, 5 or 'R+3'
  systemName?: string;
  material?: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  
  // Geometric & Technical properties
  dimensions?: {
    lengthM?: number;
    widthM?: number;
    heightM?: number;
    diameterMm?: number;
    sectionMm?: string;
    areaSqM?: number;
    volumeCuM?: number;
  };

  technicalData?: {
    airflowM3h?: number;
    pressurePa?: number;
    waterTempC?: number;
    powerKw?: number;
    fluidType?: string;
    voltageV?: number;
  };

  // CAFM / GMAO Link
  relatedAssetId?: string;
  relatedAssetName?: string;
  maintenanceHealthScore?: number; // 0-100
  lastInspectionDate?: string;
  nextServiceDate?: string;
  activeWorkOrdersCount?: number;

  properties: BimProperty[];
  meshId?: string;
  boundingBox?: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

export interface BimSpatialStorey {
  id: string;
  name: string;
  elevationM: number;
  floorNumber: number;
  elements: BimElement[];
}

export interface BimModelMetadata {
  id: string;
  name: string;
  format: 'ifc' | 'gltf' | 'glb' | 'procedural';
  fileSizeMb?: number;
  elementsCount: number;
  polygonsCount: number;
  storeys: string[];
  disciplines: BimDiscipline[];
  schemaVersion?: string; // e.g. 'IFC4', 'IFC2X3', 'glTF 2.0'
  author?: string;
  description?: string;
}
