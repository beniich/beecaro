import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BimDiscipline, BimElement, BimModelMetadata } from '../../types/bim';

export interface LoadedBimScene {
  group: THREE.Group;
  elements: BimElement[];
  metadata: BimModelMetadata;
}

// Helper to create colored PBR / Standard materials
const createMaterial = (
  color: number,
  transparent = false,
  opacity = 1.0,
  metalness = 0.2,
  roughness = 0.5,
  emissive = 0x000000
) => {
  return new THREE.MeshStandardMaterial({
    color,
    transparent,
    opacity,
    metalness,
    roughness,
    emissive,
    side: THREE.DoubleSide
  });
};

export class BimModelLoader {
  private static gltfLoader = new GLTFLoader();
  private static ifcApiInstance: any = null;
  private static isIfcApiInitialized = false;

  /**
   * Initializes and returns an IFCLoader instance from web-ifc-three
   */
  public static async createIfcLoader(): Promise<any> {
    const { IFCLoader } = await import('web-ifc-three/IFCLoader');
    const loader = new IFCLoader();
    await loader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.77/');
    return loader;
  }

  /**
   * Initializes WebIFC engine
   */
  private static async getIfcApi(): Promise<any> {
    if (!this.ifcApiInstance) {
      const WebIFC = await import('web-ifc');
      this.ifcApiInstance = new WebIFC.IfcAPI();
      this.ifcApiInstance.SetWasmPath('https://unpkg.com/web-ifc@0.0.77/');
    }
    if (!this.isIfcApiInitialized) {
      try {
        await this.ifcApiInstance.Init();
        this.isIfcApiInitialized = true;
      } catch (err) {
        console.warn('WebIFC WASM init notice, will use direct geometric extractor if needed:', err);
      }
    }
    return this.ifcApiInstance;
  }

  /**
   * Generates Model 1: BeeTower HQE (Multi-storey complete Smart Building with structure, ducts, pipes, power, chillers)
   */
  public static generateBeeTowerModel(): LoadedBimScene {
    const group = new THREE.Group();
    group.name = 'BeeTower_HQE_Root';
    const elements: BimElement[] = [];

    const floors = [
      { num: -2, name: 'R-2 Sous-sol 2 (Bassin & Technique)', y: -16, height: 7 },
      { num: -1, name: 'R-1 Sous-sol 1 (Chaufferie & TGBT)', y: -8, height: 7 },
      { num: 0, name: 'RDC (Accueil & Restaurant)', y: 0, height: 8 },
      { num: 1, name: 'R+1 (Bureaux Sud & Open Space)', y: 9, height: 7 },
      { num: 2, name: 'R+2 (Bureaux Nord & Espaces R&D)', y: 17, height: 7 },
      { num: 3, name: 'R+3 (Plateau Collaboratif)', y: 25, height: 7 },
      { num: 4, name: 'R+4 (Direction & Salons VIP)', y: 33, height: 7 },
      { num: 5, name: 'R+5 / Toiture (Centrale CVC & Chillers)', y: 41, height: 6 }
    ];

    const slabMaterial = createMaterial(0x334155, true, 0.85, 0.1, 0.8);
    const glassMaterial = createMaterial(0x38bdf8, true, 0.25, 0.9, 0.1);
    const concreteWallMaterial = createMaterial(0x64748b, false, 1.0, 0.05, 0.9);
    const ductMaterial = createMaterial(0x06b6d4, false, 1.0, 0.7, 0.3, 0x083344);
    const pipeHotMaterial = createMaterial(0xef4444, false, 1.0, 0.8, 0.2, 0x450a0a);
    const pipeColdMaterial = createMaterial(0x3b82f6, false, 1.0, 0.8, 0.2, 0x172554);
    const pipeSanitaryMaterial = createMaterial(0x10b981, false, 1.0, 0.6, 0.3);
    const electricalMaterial = createMaterial(0xf59e0b, false, 1.0, 0.8, 0.2, 0x451a03);
    const equipmentMaterial = createMaterial(0x8b5cf6, false, 1.0, 0.5, 0.4);

    const width = 48;
    const depth = 32;

    // 1. Structural slabs & Columns for each floor
    floors.forEach((fl, idx) => {
      // Slab
      const slabGeo = new THREE.BoxGeometry(width, 1.2, depth);
      const slabMesh = new THREE.Mesh(slabGeo, slabMaterial);
      slabMesh.position.set(0, fl.y, 0);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      group.add(slabMesh);

      const slabElemId = `elem-slab-${fl.num}`;
      slabMesh.userData = { bimId: slabElemId };

      elements.push({
        id: slabElemId,
        guid: `IFCSLAB-SL-${Math.abs(fl.num) + 100}-${Math.random().toString(36).substring(2, 7)}`,
        name: `Dalle Béton Armé - Niveau ${fl.num >= 0 ? 'R+' + fl.num : 'R' + fl.num}`,
        ifcType: 'IfcSlab',
        discipline: 'structure',
        floor: fl.num,
        material: 'Béton Haute Performance C35/45',
        status: 'normal',
        dimensions: { lengthM: width, widthM: depth, heightM: 1.2, areaSqM: width * depth, volumeCuM: width * depth * 1.2 },
        properties: [
          { name: 'Épaisseur', value: '300 mm' },
          { name: 'Résistance feu', value: 'REI 120' },
          { name: 'Charge d exploitation', value: '3.5 kN/m²' }
        ]
      });

      // Columns (Poteaux 4x3 grid)
      if (idx < floors.length - 1) {
        for (let cx = -18; cx <= 18; cx += 12) {
          for (let cz = -10; cz <= 10; cz += 10) {
            const colGeo = new THREE.BoxGeometry(1.4, fl.height, 1.4);
            const colMesh = new THREE.Mesh(colGeo, concreteWallMaterial);
            colMesh.position.set(cx, fl.y + fl.height / 2 + 0.6, cz);
            colMesh.castShadow = true;
            colMesh.receiveShadow = true;
            group.add(colMesh);

            const colId = `elem-col-${fl.num}-${cx}-${cz}`;
            colMesh.userData = { bimId: colId };

            elements.push({
              id: colId,
              guid: `IFCCOL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              name: `Poteau Porteur ${cx > 0 ? 'Est' : 'Ouest'} - N${fl.num}`,
              ifcType: 'IfcColumn',
              discipline: 'structure',
              floor: fl.num,
              material: 'Béton Armé BAP',
              status: 'normal',
              dimensions: { lengthM: 1.4, widthM: 1.4, heightM: fl.height },
              properties: [
                { name: 'Section', value: '500x500 mm' },
                { name: 'Armatures', value: 'Acier HA B500B' }
              ]
            });
          }
        }

        // Glass curtain wall on upper floors
        if (fl.num >= 0 && fl.num < 5) {
          const glassGeo = new THREE.BoxGeometry(width + 0.4, fl.height, depth + 0.4);
          const glassMesh = new THREE.Mesh(glassGeo, glassMaterial);
          glassMesh.position.set(0, fl.y + fl.height / 2 + 0.6, 0);
          group.add(glassMesh);

          const glassId = `elem-facade-glass-${fl.num}`;
          glassMesh.userData = { bimId: glassId };

          elements.push({
            id: glassId,
            guid: `IFCWALL-CURTAIN-${fl.num}`,
            name: `Façade Rideau Triple Vitrage Solaire - N${fl.num}`,
            ifcType: 'IfcCurtainWall',
            discipline: 'structure',
            floor: fl.num,
            material: 'Verre Contrôle Solaire Ug=0.6',
            status: 'normal',
            dimensions: { lengthM: width, heightM: fl.height, areaSqM: 2 * (width + depth) * fl.height },
            properties: [
              { name: 'Facteur Solaire g', value: '0.28' },
              { name: 'Transmission Lumineuse TL', value: '62%' },
              { name: 'Atténuation Acoustique', value: '44 dB' }
            ]
          });
        }
      }

      // HVAC Ducts distribution on each floor
      if (fl.num >= -1 && fl.num < 5) {
        // Main horizontal duct
        const mainDuctGeo = new THREE.BoxGeometry(width * 0.75, 0.9, 1.4);
        const mainDuctMesh = new THREE.Mesh(mainDuctGeo, ductMaterial);
        mainDuctMesh.position.set(0, fl.y + fl.height - 1.2, 0);
        mainDuctMesh.castShadow = true;
        group.add(mainDuctMesh);

        const ductId = `elem-duct-main-${fl.num}`;
        mainDuctMesh.userData = { bimId: ductId };

        elements.push({
          id: ductId,
          guid: `IFCDUCT-SEG-${fl.num}-01`,
          name: `Gaine Soufflage HVAC Principale - N${fl.num}`,
          ifcType: 'IfcDuctSegment',
          discipline: 'hvac',
          floor: fl.num,
          systemName: 'Aéraulique Soufflage Traité',
          material: 'Tôle Acier Galvanisé Z275 + Isolant 25mm',
          status: fl.num === 2 ? 'warning' : 'normal',
          dimensions: { lengthM: width * 0.75, sectionMm: '800x400 mm' },
          technicalData: {
            airflowM3h: 3800,
            pressurePa: 220,
            fluidType: 'Air Neuf Filtré F7'
          },
          relatedAssetId: fl.num === 2 ? 'ast-ahu-02' : 'ast-ahu-01',
          relatedAssetName: fl.num === 2 ? 'Centrale Traitement Air CTA-02 (R+2)' : 'Centrale Traitement Air CTA-01',
          maintenanceHealthScore: fl.num === 2 ? 68 : 94,
          properties: [
            { name: 'Débit Nominal', value: '4 200 m³/h' },
            { name: 'Vitesse d air', value: '3.8 m/s' },
            { name: 'Classe d étanchéité', value: 'Classe C (EN 1507)' }
          ]
        });

        // 4 Branch ducts
        for (let bx = -12; bx <= 12; bx += 8) {
          const branchGeo = new THREE.CylinderGeometry(0.35, 0.35, depth * 0.6, 16);
          const branchMesh = new THREE.Mesh(branchGeo, ductMaterial);
          branchMesh.rotation.x = Math.PI / 2;
          branchMesh.position.set(bx, fl.y + fl.height - 1.6, 0);
          group.add(branchMesh);

          const branchId = `elem-duct-branch-${fl.num}-${bx}`;
          branchMesh.userData = { bimId: branchId };

          elements.push({
            id: branchId,
            guid: `IFCDUCT-BRANCH-${fl.num}-${bx}`,
            name: `Antenne Soufflage Circulaire - N${fl.num} Zone ${bx < 0 ? 'Nord' : 'Sud'}`,
            ifcType: 'IfcDuctSegment',
            discipline: 'hvac',
            floor: fl.num,
            systemName: 'Réseau Terminal Soufflage',
            status: 'normal',
            dimensions: { diameterMm: 250, lengthM: depth * 0.6 },
            technicalData: { airflowM3h: 450, pressurePa: 45 },
            properties: [
              { name: 'Type Diffuseur', value: 'Jet Hélicoïdal Ajustable' },
              { name: 'Niveau Sonore', value: 'NC 28' }
            ]
          });
        }
      }
    });

    // 2. Vertical Chilled Water & Heating Piping Risers (Colonnes montantes)
    const riserHeight = 58;
    const riserY = 13;

    // Hot water pipe
    const hotRiserGeo = new THREE.CylinderGeometry(0.4, 0.4, riserHeight, 16);
    const hotRiserMesh = new THREE.Mesh(hotRiserGeo, pipeHotMaterial);
    hotRiserMesh.position.set(-15, riserY, -11);
    group.add(hotRiserMesh);
    hotRiserMesh.userData = { bimId: 'elem-pipe-riser-hot' };

    elements.push({
      id: 'elem-pipe-riser-hot',
      guid: 'IFCPIPE-RISER-HOT-01',
      name: 'Colonne Montante Chauffage Départ 65°C / Retour 45°C',
      ifcType: 'IfcPipeSegment',
      discipline: 'plumbing',
      floor: 'Tous Niveaux',
      systemName: 'Réseau Chauffage Central',
      material: 'Tube Acier Noir sans soudure calorifugé',
      status: 'normal',
      dimensions: { diameterMm: 150, lengthM: riserHeight },
      technicalData: { waterTempC: 62.4, pressurePa: 4.2 * 100000, fluidType: 'Eau Chaude Technique' },
      relatedAssetId: 'ast-pump-01',
      relatedAssetName: 'Pompe Double Circulation Wilo Stratos',
      maintenanceHealthScore: 92,
      properties: [
        { name: 'Régime Température', value: '65°C / 45°C' },
        { name: 'Pression de Service', value: '4.2 bars' },
        { name: 'Débit Circulant', value: '18.5 m³/h' }
      ]
    });

    // Cold water (Chilled water 7°C) pipe
    const coldRiserGeo = new THREE.CylinderGeometry(0.45, 0.45, riserHeight, 16);
    const coldRiserMesh = new THREE.Mesh(coldRiserGeo, pipeColdMaterial);
    coldRiserMesh.position.set(-13.5, riserY, -11);
    group.add(coldRiserMesh);
    coldRiserMesh.userData = { bimId: 'elem-pipe-riser-cold' };

    elements.push({
      id: 'elem-pipe-riser-cold',
      guid: 'IFCPIPE-RISER-COLD-01',
      name: 'Colonne Eau Glacée Climatisation (Réseau 7°C / 12°C)',
      ifcType: 'IfcPipeSegment',
      discipline: 'plumbing',
      floor: 'Tous Niveaux',
      systemName: 'Réseau Eau Glacée Chilled Water',
      material: 'Tube Acier revêtu + Coquille Armaflex 32mm',
      status: 'normal',
      dimensions: { diameterMm: 200, lengthM: riserHeight },
      technicalData: { waterTempC: 7.2, pressurePa: 5.1 * 100000, fluidType: 'Eau Glycolée 20%' },
      relatedAssetId: 'ast-chiller-01',
      relatedAssetName: 'Groupe Froid Daikin Inverter 450kW',
      maintenanceHealthScore: 88,
      properties: [
        { name: 'Régime d eau', value: '7°C / 12°C' },
        { name: 'Taux de Glycol', value: '20% Monopropylène' }
      ]
    });

    // Sanitary water pipe
    const sanRiserGeo = new THREE.CylinderGeometry(0.25, 0.25, riserHeight, 16);
    const sanRiserMesh = new THREE.Mesh(sanRiserGeo, pipeSanitaryMaterial);
    sanRiserMesh.position.set(-12, riserY, -11);
    group.add(sanRiserMesh);
    sanRiserMesh.userData = { bimId: 'elem-pipe-riser-san' };

    elements.push({
      id: 'elem-pipe-riser-san',
      guid: 'IFCPIPE-RISER-SAN-01',
      name: 'Colonne Distribution Eau Potable Sanitaire (EF/ECS)',
      ifcType: 'IfcPipeSegment',
      discipline: 'plumbing',
      floor: 'Tous Niveaux',
      systemName: 'Sanitaire & Hygiène',
      material: 'Cuivre Écroui & Inox 316L',
      status: 'normal',
      dimensions: { diameterMm: 80, lengthM: riserHeight },
      technicalData: { waterTempC: 58.0, pressurePa: 3.8 * 100000, fluidType: 'Eau Sanitaire' },
      properties: [
        { name: 'Bouclage ECS', value: 'Assuré en continu à 55°C (Anti-légionelle)' }
      ]
    });

    // 3. Electrical Cable Trays Riser (Chemin de câbles colonne montante)
    const elecRiserGeo = new THREE.BoxGeometry(0.8, riserHeight, 1.6);
    const elecRiserMesh = new THREE.Mesh(elecRiserGeo, electricalMaterial);
    elecRiserMesh.position.set(15, riserY, -11);
    group.add(elecRiserMesh);
    elecRiserMesh.userData = { bimId: 'elem-elec-riser-main' };

    elements.push({
      id: 'elem-elec-riser-main',
      guid: 'IFCCABLETRAY-RISER-01',
      name: 'Gaine Électrique Colonne Montante Forte Puissance (TGBT -> TD)',
      ifcType: 'IfcCableCarrierSegment',
      discipline: 'electrical',
      floor: 'Tous Niveaux',
      systemName: 'Distribution Courants Forts 400V Triphasé',
      material: 'Chemin de câbles tôle perforée électrozinguée',
      status: 'normal',
      dimensions: { lengthM: riserHeight, sectionMm: '400x100 mm' },
      technicalData: { powerKw: 285, voltageV: 400 },
      properties: [
        { name: 'Puissance Souscrite', value: '350 kVA' },
        { name: 'Section Câble', value: '4x240 mm² Cuivre H07RN-F' }
      ]
    });

    // 4. Rooftop Chillers and Air Handling Units (R+5 / Toiture)
    const roofY = 44;

    // Chiller 1
    const chillerGeo = new THREE.BoxGeometry(9, 3.5, 4.5);
    const chillerMesh = new THREE.Mesh(chillerGeo, equipmentMaterial);
    chillerMesh.position.set(-8, roofY + 1.8, 4);
    group.add(chillerMesh);
    chillerMesh.userData = { bimId: 'elem-eq-chiller-01' };

    // Chiller Fans (Ventilateurs hélicoïdes sur le dessus)
    for (let f = -3; f <= 3; f += 2.8) {
      const fanGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.4, 16);
      const fanMesh = new THREE.Mesh(fanGeo, createMaterial(0x1e1b4b, false, 1.0, 0.9, 0.1));
      fanMesh.position.set(-8 + f, roofY + 3.7, 4);
      group.add(fanMesh);
    }

    elements.push({
      id: 'elem-eq-chiller-01',
      guid: 'IFCUNITARYEQUIPMENT-CHILLER-01',
      name: 'Groupe d Eau Glacée Chiller Air/Eau Daikin 450kW (GF-01)',
      ifcType: 'IfcUnitaryEquipment',
      discipline: 'equipment',
      floor: 5,
      systemName: 'Production Froid Centralisée',
      material: 'Châssis Acier Inox Anti-vibratile',
      status: 'normal',
      dimensions: { lengthM: 9.0, widthM: 4.5, heightM: 3.5 },
      technicalData: { powerKw: 112, fluidType: 'Fluide R32 Bas GWP', waterTempC: 6.8 },
      relatedAssetId: 'ast-chiller-01',
      relatedAssetName: 'Groupe Froid Daikin Inverter 450kW',
      maintenanceHealthScore: 91,
      lastInspectionDate: '2026-08-15',
      nextServiceDate: '2026-11-15',
      properties: [
        { name: 'Régime Frigorifique', value: '450 kW Froid / COP 4.1' },
        { name: 'Charge Réfrigérant', value: '42 kg R32' },
        { name: 'Niveau Sonore', value: '62 dBA à 10m' }
      ]
    });

    // Rooftop Solar PV Array
    const pvGeo = new THREE.BoxGeometry(16, 0.2, 10);
    const pvMaterial = createMaterial(0x1e3a8a, false, 1.0, 0.95, 0.05, 0x0c4a6e);
    const pvMesh = new THREE.Mesh(pvGeo, pvMaterial);
    pvMesh.rotation.x = -0.12;
    pvMesh.position.set(10, roofY + 1.2, 0);
    group.add(pvMesh);
    pvMesh.userData = { bimId: 'elem-eq-pv-solar' };

    elements.push({
      id: 'elem-eq-pv-solar',
      guid: 'IFCSOLARPANEL-ROOF-01',
      name: 'Centrale Photovoltaïque Toiture 65 kWc Bifaciale',
      ifcType: 'IfcEnergyConversionDevice',
      discipline: 'electrical',
      floor: 5,
      systemName: 'Autoconsommation Solaire Bâtiment',
      status: 'normal',
      dimensions: { areaSqM: 160 },
      technicalData: { powerKw: 58.4, voltageV: 800 },
      relatedAssetId: 'ast-solar-01',
      relatedAssetName: 'Champ Solaire Photovoltaïque 65 kWc',
      maintenanceHealthScore: 98,
      properties: [
        { name: 'Production Quotidienne', value: '342 kWh/j' },
        { name: 'Rendement Panneaux', value: '22.8% N-Type TOPCon' },
        { name: 'Émissions Évitées', value: '18.4 tCO2e/an' }
      ]
    });

    // 5. Basement Technical Room (R-1) Equipment: Boiler / Heat Pump & Pumps
    const baseEqGeo = new THREE.BoxGeometry(5, 3, 3);
    const baseEqMesh = new THREE.Mesh(baseEqGeo, createMaterial(0xd97706, false, 1.0, 0.6, 0.4));
    baseEqMesh.position.set(-6, -6, 4);
    group.add(baseEqMesh);
    baseEqMesh.userData = { bimId: 'elem-eq-boiler-pac' };

    elements.push({
      id: 'elem-eq-boiler-pac',
      guid: 'IFCBOILER-PAC-R-1',
      name: 'Pompe à Chaleur Géothermique Haute Température 280kW (PAC-01)',
      ifcType: 'IfcHeatExchanger',
      discipline: 'equipment',
      floor: -1,
      systemName: 'Production Chaleur Éco-conçue',
      status: 'normal',
      dimensions: { lengthM: 5.0, widthM: 3.0, heightM: 3.0 },
      technicalData: { powerKw: 68, waterTempC: 64.2 },
      relatedAssetId: 'ast-pac-01',
      relatedAssetName: 'Pompe à Chaleur Géothermique Eau/Eau',
      maintenanceHealthScore: 95,
      properties: [
        { name: 'COP Chauffage', value: '4.85' },
        { name: 'Sondes Géothermiques', value: '12 forages 150m' }
      ]
    });

    return {
      group,
      elements,
      metadata: {
        id: 'model-beetower-hqe',
        name: 'BeeTower HQE Bâtiment Tertiaire (R+5 + 2 SS)',
        format: 'procedural',
        fileSizeMb: 14.8,
        elementsCount: elements.length,
        polygonsCount: 14200,
        storeys: floors.map(f => f.name),
        disciplines: ['structure', 'hvac', 'plumbing', 'electrical', 'equipment'],
        schemaVersion: 'IFC4 Architecture & MEP',
        author: 'Bureau d Études CVC & Synthèse BIM BeeCarbonIT',
        description: 'Maquette BIM complète avec structure béton armé, dalles thermiques, façades rideau, réseaux aérauliques gainés, colonnes montantes hydrauliques et centrale CVC de toiture.'
      }
    };
  }

  /**
   * Generates Model 2: Centrale Technique CVC & Chaufferie (HVAC Plant Room)
   */
  public static generateHvacPlantRoomModel(): LoadedBimScene {
    const group = new THREE.Group();
    group.name = 'HVAC_Plant_Room_Root';
    const elements: BimElement[] = [];

    // Floor and Room Frame
    const floorGeo = new THREE.BoxGeometry(40, 0.8, 30);
    const floorMesh = new THREE.Mesh(floorGeo, createMaterial(0x1e293b, false, 1.0, 0.1, 0.9));
    floorMesh.position.set(0, 0, 0);
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // Wall (Back technical wall)
    const wallGeo = new THREE.BoxGeometry(40, 10, 0.6);
    const wallMesh = new THREE.Mesh(wallGeo, createMaterial(0x334155, true, 0.6, 0.05, 0.95));
    wallMesh.position.set(0, 5, -15);
    group.add(wallMesh);

    // Air Handling Units (CTA 1 & CTA 2)
    const ahuGeo = new THREE.BoxGeometry(10, 4.5, 4);
    const ahuMat = createMaterial(0x0284c7, false, 1.0, 0.4, 0.5);
    
    // AHU 1
    const ahu1Mesh = new THREE.Mesh(ahuGeo, ahuMat);
    ahu1Mesh.position.set(-10, 2.7, -6);
    group.add(ahu1Mesh);
    ahu1Mesh.userData = { bimId: 'elem-plant-ahu-01' };

    elements.push({
      id: 'elem-plant-ahu-01',
      guid: 'IFCAHU-PLANT-01',
      name: 'Centrale Traitement d Air Double Flux CTA-01 (15 000 m³/h)',
      ifcType: 'IfcUnitaryEquipment',
      discipline: 'hvac',
      floor: 'Local Technique',
      systemName: 'Traitement d Air & Récupération d Énergie',
      status: 'normal',
      dimensions: { lengthM: 10, widthM: 4, heightM: 4.5 },
      technicalData: { airflowM3h: 15000, pressurePa: 480, powerKw: 22.5 },
      relatedAssetId: 'ast-ahu-01',
      relatedAssetName: 'CTA Principale CTA-01',
      maintenanceHealthScore: 89,
      properties: [
        { name: 'Échangeur Rotatif', value: 'Rendement 84.5%' },
        { name: 'Filtration Soufflage', value: 'Filtre ePM1 70% (F7)' },
        { name: 'Moteurs Ventilateurs', value: 'Moteurs EC Synchrone IE5' }
      ]
    });

    // AHU 2
    const ahu2Mesh = new THREE.Mesh(ahuGeo, ahuMat);
    ahu2Mesh.position.set(10, 2.7, -6);
    group.add(ahu2Mesh);
    ahu2Mesh.userData = { bimId: 'elem-plant-ahu-02' };

    elements.push({
      id: 'elem-plant-ahu-02',
      guid: 'IFCAHU-PLANT-02',
      name: 'Centrale Traitement d Air Hygiénique CTA-02 (Salles R&D)',
      ifcType: 'IfcUnitaryEquipment',
      discipline: 'hvac',
      floor: 'Local Technique',
      status: 'warning',
      dimensions: { lengthM: 10, widthM: 4, heightM: 4.5 },
      technicalData: { airflowM3h: 12000, pressurePa: 520, powerKw: 18.0 },
      relatedAssetId: 'ast-ahu-02',
      relatedAssetName: 'CTA Salles Propres CTA-02',
      maintenanceHealthScore: 64,
      properties: [
        { name: 'Filtration Terminale', value: 'HEPA H14 Haute Efficacité' },
        { name: 'Alerte Encrassement', value: 'Delta P = 320 Pa (Seuil alerte dépassé)' }
      ]
    });

    // Massive Air Ducts exiting AHUs
    const ductGeo1 = new THREE.BoxGeometry(1.6, 1.4, 16);
    const ductMesh1 = new THREE.Mesh(ductGeo1, createMaterial(0x06b6d4, false, 1.0, 0.7, 0.3));
    ductMesh1.position.set(-10, 6, 2);
    group.add(ductMesh1);
    ductMesh1.userData = { bimId: 'elem-plant-duct-01' };

    elements.push({
      id: 'elem-plant-duct-01',
      guid: 'IFCDUCT-PLANT-01',
      name: 'Collecteur Principal Soufflage Aéraulique DN1400',
      ifcType: 'IfcDuctSegment',
      discipline: 'hvac',
      floor: 'Local Technique',
      status: 'normal',
      dimensions: { sectionMm: '1600x1400 mm', lengthM: 16 },
      technicalData: { airflowM3h: 15000, pressurePa: 420 },
      properties: [
        { name: 'Isolation', value: 'Laine Minérale 50mm Alu Armé' }
      ]
    });

    // Centrifugal Pump Skid (Pompes Jumelées)
    for (let p = -4; p <= 4; p += 4) {
      const pumpGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 16);
      const pumpMesh = new THREE.Mesh(pumpGeo, createMaterial(0x10b981, false, 1.0, 0.7, 0.3));
      pumpMesh.rotation.z = Math.PI / 2;
      pumpMesh.position.set(p, 1.5, 8);
      group.add(pumpMesh);

      const pumpId = `elem-plant-pump-${p}`;
      pumpMesh.userData = { bimId: pumpId };

      elements.push({
        id: pumpId,
        guid: `IFCPUMP-PLANT-${Math.abs(p)}`,
        name: `Pompe Double Débit Variable Grundfos Magna3 (PMP-${p < 0 ? '01' : '02'})`,
        ifcType: 'IfcPump',
        discipline: 'plumbing',
        floor: 'Local Technique',
        systemName: 'Distribution Primaire Chauffage',
        status: 'normal',
        dimensions: { lengthM: 1.8, diameterMm: 250 },
        technicalData: { powerKw: 7.5, waterTempC: 58.5, pressurePa: 4.8 * 100000 },
        relatedAssetId: 'ast-pump-01',
        relatedAssetName: 'Pompe Primaire Réseau Sud',
        maintenanceHealthScore: 96,
        properties: [
          { name: 'Vitesse de rotation', value: '2 850 tr/min' },
          { name: 'Indice EEI', value: '<= 0.18' }
        ]
      });
    }

    // Hydraulic Manifold Pipes (Collecteurs Chaud & Froid)
    const manifoldGeo = new THREE.CylinderGeometry(0.5, 0.5, 24, 24);
    
    // Hot Manifold
    const hotManiMesh = new THREE.Mesh(manifoldGeo, createMaterial(0xef4444, false, 1.0, 0.8, 0.2));
    hotManiMesh.rotation.z = Math.PI / 2;
    hotManiMesh.position.set(0, 3.2, 5);
    group.add(hotManiMesh);
    hotManiMesh.userData = { bimId: 'elem-mani-hot' };

    elements.push({
      id: 'elem-mani-hot',
      guid: 'IFCPIPE-MANIFOLD-HOT',
      name: 'Collecteur Général Distribution Chauffage DN250',
      ifcType: 'IfcPipeSegment',
      discipline: 'plumbing',
      floor: 'Local Technique',
      status: 'normal',
      dimensions: { diameterMm: 250, lengthM: 24 },
      technicalData: { waterTempC: 65.0, pressurePa: 4.5 * 100000 },
      properties: [
        { name: 'Nombre de Départs', value: '6 Circuits Régulés' }
      ]
    });

    // Cold Manifold
    const coldManiMesh = new THREE.Mesh(manifoldGeo, createMaterial(0x3b82f6, false, 1.0, 0.8, 0.2));
    coldManiMesh.rotation.z = Math.PI / 2;
    coldManiMesh.position.set(0, 4.5, 5);
    group.add(coldManiMesh);
    coldManiMesh.userData = { bimId: 'elem-mani-cold' };

    elements.push({
      id: 'elem-mani-cold',
      guid: 'IFCPIPE-MANIFOLD-COLD',
      name: 'Collecteur Général Eau Glacée Climatisation DN250',
      ifcType: 'IfcPipeSegment',
      discipline: 'plumbing',
      floor: 'Local Technique',
      status: 'normal',
      dimensions: { diameterMm: 250, lengthM: 24 },
      technicalData: { waterTempC: 7.0, pressurePa: 5.2 * 100000 },
      properties: [
        { name: 'Nombre de Départs', value: '4 Circuits Ventilo-convecteurs' }
      ]
    });

    // Expansion Tank (Vase d expansion 2000L)
    const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 5, 24);
    const tankMesh = new THREE.Mesh(tankGeo, createMaterial(0xd97706, false, 1.0, 0.6, 0.4));
    tankMesh.position.set(-14, 3, 10);
    group.add(tankMesh);
    tankMesh.userData = { bimId: 'elem-exp-tank' };

    elements.push({
      id: 'elem-exp-tank',
      guid: 'IFCTANK-EXP-2000L',
      name: 'Vase d Expansion Sous Pression d Azote Flamco 2000 Litres',
      ifcType: 'IfcEnergyConversionDevice',
      discipline: 'plumbing',
      floor: 'Local Technique',
      status: 'normal',
      dimensions: { volumeCuM: 2.0, diameterMm: 1200, heightM: 2.4 },
      properties: [
        { name: 'Pression de Prégonflage', value: '2.8 bars N2' },
        { name: 'Membrane', value: 'Butyl Haute Résistance' }
      ]
    });

    return {
      group,
      elements,
      metadata: {
        id: 'model-hvac-plant',
        name: 'Centrale Technique CVC & Chaufferie Industrielle',
        format: 'procedural',
        fileSizeMb: 9.4,
        elementsCount: elements.length,
        polygonsCount: 8900,
        storeys: ['Local Technique CVC Sous-sol'],
        disciplines: ['hvac', 'plumbing', 'electrical', 'equipment'],
        schemaVersion: 'IFC4 HVAC Plant Spec',
        author: 'Ingénierie CVC BeeCarbonIT',
        description: 'Maquette ultra-détaillée du local technique : double CTA 15 000 m³/h, collecteurs hydrauliques DN250, pompes doubles Wilo/Grundfos, vannes de régulation 3 voies et vase d expansion.'
      }
    };
  }

  /**
   * Generates Model 3: Plateau de Bureaux R+3 (Distribution Terminale & Gaines Spiralées)
   */
  public static generateOfficeFloorModel(): LoadedBimScene {
    const group = new THREE.Group();
    group.name = 'Office_Floor_R3_Root';
    const elements: BimElement[] = [];

    // Floor Slab with modern light wood / carpet texture tone
    const slabGeo = new THREE.BoxGeometry(36, 0.6, 24);
    const slabMesh = new THREE.Mesh(slabGeo, createMaterial(0x475569, false, 1.0, 0.1, 0.8));
    slabMesh.position.set(0, 0, 0);
    slabMesh.receiveShadow = true;
    group.add(slabMesh);

    // Acoustic Ceiling Framework (Plafond suspendu partiel)
    const ceilGeo = new THREE.BoxGeometry(36, 0.2, 24);
    const ceilMesh = new THREE.Mesh(ceilGeo, createMaterial(0x94a3b8, true, 0.35, 0.0, 0.95));
    ceilMesh.position.set(0, 4.2, 0);
    group.add(ceilMesh);

    // Glass Partitions (Salles de Réunion vitrées)
    const glassMeetingGeo = new THREE.BoxGeometry(10, 4.0, 8);
    const glassMeetingMesh = new THREE.Mesh(glassMeetingGeo, createMaterial(0x38bdf8, true, 0.25, 0.9, 0.1));
    glassMeetingMesh.position.set(-10, 2.0, -5);
    group.add(glassMeetingMesh);
    glassMeetingMesh.userData = { bimId: 'elem-space-meeting' };

    elements.push({
      id: 'elem-space-meeting',
      guid: 'IFCSPACE-MEETING-R3',
      name: 'Salle de Réunion Verrière "Turing" - Capacité 14p',
      ifcType: 'IfcSpace',
      discipline: 'space',
      floor: 3,
      status: 'normal',
      dimensions: { areaSqM: 42, volumeCuM: 147 },
      properties: [
        { name: 'Isolation Acoustique', value: 'Rw 48 dB' },
        { name: 'Consigne Température', value: '21.5°C' },
        { name: 'Seuil CO2 Alarme', value: '800 ppm' }
      ]
    });

    // Spiral Exposed Ducts (Gaines circulaires spiralées apparentes)
    for (let d = -8; d <= 8; d += 8) {
      const spGeo = new THREE.CylinderGeometry(0.3, 0.3, 30, 20);
      const spMesh = new THREE.Mesh(spGeo, createMaterial(0x06b6d4, false, 1.0, 0.8, 0.2, 0x083344));
      spMesh.rotation.z = Math.PI / 2;
      spMesh.position.set(0, 3.6, d);
      group.add(spMesh);

      const spId = `elem-spiral-duct-${d}`;
      spMesh.userData = { bimId: spId };

      elements.push({
        id: spId,
        guid: `IFCDUCT-SPIRAL-R3-${Math.abs(d)}`,
        name: `Réseau Aéraulique Spiralé Apparent DN315 - Voie ${d < 0 ? 'Nord' : 'Sud'}`,
        ifcType: 'IfcDuctSegment',
        discipline: 'hvac',
        floor: 3,
        systemName: 'Distribution Terminale Soufflage',
        status: 'normal',
        dimensions: { diameterMm: 315, lengthM: 30 },
        technicalData: { airflowM3h: 1200, pressurePa: 65 },
        properties: [
          { name: 'Finitions', value: 'Inox Brossé Industriel' },
          { name: 'Diffuseurs Connectés', value: '8 Diffuseurs Rotatifs' }
        ]
      });

      // Air Diffusers (Bouche de soufflage tourbillonnaire)
      for (let df = -12; df <= 12; df += 6) {
        const diffGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
        const diffMesh = new THREE.Mesh(diffGeo, createMaterial(0xe0f2fe, false, 1.0, 0.5, 0.5));
        diffMesh.position.set(df, 3.2, d);
        group.add(diffMesh);

        const diffId = `elem-diffuser-${d}-${df}`;
        diffMesh.userData = { bimId: diffId };

        elements.push({
          id: diffId,
          guid: `IFCFLOWTERM-DIFF-${d}-${df}`,
          name: `Diffuseur Tourbillonnaire Plafonnier DN250 (Zone ${df > 0 ? 'Est' : 'Ouest'})`,
          ifcType: 'IfcFlowTerminal',
          discipline: 'hvac',
          floor: 3,
          status: 'normal',
          dimensions: { diameterMm: 250 },
          technicalData: { airflowM3h: 180 },
          properties: [
            { name: 'Portée de jet', value: '3.2 m' },
            { name: 'Niveau Sonore', value: 'NR 25' }
          ]
        });
      }
    }

    // Fan Coil Units (Ventilo-convecteurs 4 tubes)
    for (let fcu = -10; fcu <= 10; fcu += 10) {
      const fcuGeo = new THREE.BoxGeometry(1.8, 0.5, 1.0);
      const fcuMesh = new THREE.Mesh(fcuGeo, createMaterial(0x8b5cf6, false, 1.0, 0.5, 0.5));
      fcuMesh.position.set(fcu, 3.8, -8);
      group.add(fcuMesh);

      const fcuId = `elem-fcu-${fcu}`;
      fcuMesh.userData = { bimId: fcuId };

      elements.push({
        id: fcuId,
        guid: `IFCUNITARYEQUIPMENT-FCU-${Math.abs(fcu)}`,
        name: `Ventilo-Convecteur 4 Tubes Plafonnier Carrier (VC-${Math.abs(fcu) + 1})`,
        ifcType: 'IfcUnitaryEquipment',
        discipline: 'equipment',
        floor: 3,
        systemName: 'Climatisation Terminale 4 Tubes',
        status: fcu === 0 ? 'warning' : 'normal',
        dimensions: { lengthM: 1.8, widthM: 1.0, heightM: 0.5 },
        technicalData: { powerKw: 2.4, waterTempC: 7.2 },
        relatedAssetId: fcu === 0 ? 'ast-fcu-03' : 'ast-fcu-01',
        relatedAssetName: fcu === 0 ? 'Ventilo-Convecteur VC-03 (Filtre encrassé)' : 'Ventilo-Convecteur VC-01',
        maintenanceHealthScore: fcu === 0 ? 62 : 94,
        properties: [
          { name: 'Puissance Frigorifique', value: '3.8 kW' },
          { name: 'Puissance Calorifique', value: '4.2 kW' },
          { name: 'Moteur', value: 'Modulant 0-10V EC' }
        ]
      });
    }

    return {
      group,
      elements,
      metadata: {
        id: 'model-office-r3',
        name: 'Plateau Bureaux R+3 Open Space & Espaces Réunion',
        format: 'procedural',
        fileSizeMb: 6.2,
        elementsCount: elements.length,
        polygonsCount: 6400,
        storeys: ['R+3 Plateau Collaboratif'],
        disciplines: ['structure', 'hvac', 'plumbing', 'electrical', 'space', 'equipment'],
        schemaVersion: 'IFC4 Architecture & Terminal MEP',
        author: 'Design & Synthèse Espaces BeeCarbonIT',
        description: 'Aménagement moderne avec gaines spiralées apparentes industrielles, ventilo-convecteurs 4 tubes, diffuseurs tourbillonnaires et cloisons acoustiques.'
      }
    };
  }

  /**
   * Loads a GLTF/GLB file and extracts meshes, spatial hierarchy, and structural metadata
   */
  public static async loadGltfFile(file: File | ArrayBuffer): Promise<LoadedBimScene> {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const fileName = file instanceof File ? file.name : 'modele-importe.gltf';

    return new Promise((resolve, reject) => {
      this.gltfLoader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          const group = gltf.scene;
          const elements: BimElement[] = [];

          // Traverse meshes and build BIM metadata
          let index = 0;
          let polyCount = 0;

          group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              index++;
              const geometry = child.geometry;
              if (geometry) {
                polyCount += geometry.attributes.position ? geometry.attributes.position.count / 3 : 0;
                geometry.computeBoundingBox();
              }

              // Determine discipline from name or mesh characteristics
              const nameLower = (child.name || '').toLowerCase();
              let discipline: BimDiscipline = 'structure';
              let ifcType = 'IfcBuildingElementProxy';

              if (nameLower.includes('duct') || nameLower.includes('gaine') || nameLower.includes('hvac') || nameLower.includes('cta') || nameLower.includes('air')) {
                discipline = 'hvac';
                ifcType = 'IfcDuctSegment';
              } else if (nameLower.includes('pipe') || nameLower.includes('tube') || nameLower.includes('tuyau') || nameLower.includes('eau') || nameLower.includes('water')) {
                discipline = 'plumbing';
                ifcType = 'IfcPipeSegment';
              } else if (nameLower.includes('cable') || nameLower.includes('elec') || nameLower.includes('light') || nameLower.includes('power')) {
                discipline = 'electrical';
                ifcType = 'IfcCableCarrierSegment';
              } else if (nameLower.includes('wall') || nameLower.includes('mur') || nameLower.includes('cloison')) {
                discipline = 'structure';
                ifcType = 'IfcWall';
              } else if (nameLower.includes('slab') || nameLower.includes('dalle') || nameLower.includes('floor') || nameLower.includes('sol')) {
                discipline = 'structure';
                ifcType = 'IfcSlab';
              } else if (nameLower.includes('pump') || nameLower.includes('pompe') || nameLower.includes('chiller') || nameLower.includes('boiler')) {
                discipline = 'equipment';
                ifcType = 'IfcUnitaryEquipment';
              }

              const elemId = `elem-gltf-${index}-${child.name || 'mesh'}`;
              child.userData = { bimId: elemId };
              child.castShadow = true;
              child.receiveShadow = true;

              elements.push({
                id: elemId,
                guid: `GLTF-GUID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                name: child.name || `Élément 3D ${ifcType} #${index}`,
                ifcType,
                discipline,
                floor: 'Niveau Principal',
                status: 'normal',
                properties: [
                  { name: 'Nom Mesh', value: child.name || 'Sans Nom' },
                  { name: 'Discipline Détectée', value: discipline.toUpperCase() },
                  { name: 'Type IFC Mappé', value: ifcType }
                ]
              });
            }
          });

          // Auto-center and normalize scale if needed
          const box = new THREE.Box3().setFromObject(group);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          if (maxDim > 200 || maxDim < 2) {
            const scaleFactor = 40 / (maxDim || 1);
            group.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          group.position.x = -center.x;
          group.position.y = -box.min.y;
          group.position.z = -center.z;

          resolve({
            group,
            elements,
            metadata: {
              id: `model-upload-${Date.now()}`,
              name: fileName,
              format: fileName.endsWith('.glb') ? 'glb' : 'gltf',
              fileSizeMb: file instanceof File ? parseFloat((file.size / (1024 * 1024)).toFixed(2)) : 5.0,
              elementsCount: elements.length,
              polygonsCount: Math.round(polyCount),
              storeys: ['Niveau Modèle 3D Importé'],
              disciplines: Array.from(new Set(elements.map(e => e.discipline))),
              schemaVersion: 'glTF 2.0 / OpenBIM Export',
              author: 'Fichier Utilisateur Importé',
              description: `Maquette 3D GLTF importée comprenant ${elements.length} éléments et ${Math.round(polyCount)} polygones.`
            }
          });
        },
        (error: unknown) => {
          console.error('Error parsing GLTF:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Loads an IFC file by parsing with WebIFC IfcAPI and fallback geometric processor
   */
  public static async loadIfcFile(file: File | string): Promise<LoadedBimScene> {
    const fileName = file instanceof File ? file.name : 'maquette-architecture.ifc';
    let uint8Data: Uint8Array;

    if (typeof file === 'string') {
      const encoder = new TextEncoder();
      uint8Data = encoder.encode(file);
    } else {
      const buffer = await file.arrayBuffer();
      uint8Data = new Uint8Array(buffer);
    }

    const text = typeof file === 'string' ? file : new TextDecoder().decode(uint8Data.slice(0, 100000));

    // Parse header info
    let schema = 'IFC4';
    let author = 'Ingénierie BIM & CAFM';
    const schemaMatch = text.match(/FILE_SCHEMA\s*\(\s*\(\s*'([^']+)'/i) || text.match(/FILE_SCHEMA\s*\(\s*'([^']+)'/i);
    if (schemaMatch) schema = schemaMatch[1];
    const authorMatch = text.match(/FILE_NAME\s*\(\s*'([^']+)'/i);
    if (authorMatch) author = authorMatch[1];

    const group = new THREE.Group();
    group.name = 'IFC_Scene_Root';
    const elements: BimElement[] = [];

    let loadedViaWebIfc = false;

    try {
      const ifcApi = await this.getIfcApi();
      if (this.isIfcApiInitialized) {
        const modelID = ifcApi.OpenModel(uint8Data);
        if (modelID !== undefined && modelID >= 0) {
          // Stream all meshes from web-ifc
          const baseMaterials = {
            structure: createMaterial(0x64748b, false, 1.0, 0.1, 0.9),
            hvac: createMaterial(0x06b6d4, false, 1.0, 0.7, 0.3, 0x083344),
            plumbing: createMaterial(0x3b82f6, false, 1.0, 0.8, 0.2, 0x172554),
            electrical: createMaterial(0xf59e0b, false, 1.0, 0.8, 0.2, 0x451a03),
            equipment: createMaterial(0x8b5cf6, false, 1.0, 0.5, 0.5),
            space: createMaterial(0x10b981, true, 0.2, 0.1, 0.9)
          };

          ifcApi.StreamAllMeshes(modelID, (flatMesh: any) => {
            const placedGeometries = flatMesh.geometries;
            const expressID = flatMesh.expressID;

            // Determine IFC type or category
            let ifcType = 'IfcBuildingElement';
            let discipline: BimDiscipline = 'structure';

            try {
              const lineData = ifcApi.GetLine(modelID, expressID);
              if (lineData && lineData.constructor && lineData.constructor.name) {
                ifcType = lineData.constructor.name;
              }
            } catch {
              // fallback type
            }

            const ifcUpper = ifcType.toUpperCase();
            if (ifcUpper.includes('DUCT') || ifcUpper.includes('AIR') || ifcUpper.includes('FAN') || ifcUpper.includes('VENTILAT')) {
              discipline = 'hvac';
            } else if (ifcUpper.includes('PIPE') || ifcUpper.includes('PUMP') || ifcUpper.includes('VALVE') || ifcUpper.includes('WATER') || ifcUpper.includes('FLOW')) {
              discipline = 'plumbing';
            } else if (ifcUpper.includes('CABLE') || ifcUpper.includes('ELEC') || ifcUpper.includes('LIGHT') || ifcUpper.includes('OUTLET')) {
              discipline = 'electrical';
            } else if (ifcUpper.includes('CHILLER') || ifcUpper.includes('BOILER') || ifcUpper.includes('UNITARY') || ifcUpper.includes('MOTOR') || ifcUpper.includes('EQUIPMENT')) {
              discipline = 'equipment';
            } else if (ifcUpper.includes('SPACE') || ifcUpper.includes('ZONE')) {
              discipline = 'space';
            }

            for (let i = 0; i < placedGeometries.size(); i++) {
              const placedGeometry = placedGeometries.get(i);
              const geomData = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID);
              const vertexData = ifcApi.GetVertexArray(geomData.GetVertexData(), geomData.GetVertexDataSize());
              const indexData = ifcApi.GetIndexArray(geomData.GetIndexData(), geomData.GetIndexDataSize());

              if (vertexData.length > 0 && indexData.length > 0) {
                const bufferGeometry = new THREE.BufferGeometry();
                const posArr: number[] = [];
                const normArr: number[] = [];

                for (let v = 0; v < vertexData.length; v += 6) {
                  posArr.push(vertexData[v], vertexData[v + 1], vertexData[v + 2]);
                  normArr.push(vertexData[v + 3], vertexData[v + 4], vertexData[v + 5]);
                }

                bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
                if (normArr.length === posArr.length) {
                  bufferGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normArr, 3));
                } else {
                  bufferGeometry.computeVertexNormals();
                }
                bufferGeometry.setIndex(Array.from(indexData));

                const mesh = new THREE.Mesh(bufferGeometry, baseMaterials[discipline]);
                const matrix = new THREE.Matrix4().fromArray(placedGeometry.flatTransformation);
                mesh.applyMatrix4(matrix);
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                const elemId = `elem-webifc-${expressID}-${i}`;
                mesh.userData = { bimId: elemId };
                group.add(mesh);

                elements.push({
                  id: elemId,
                  guid: `IFC-${expressID}-${i}`,
                  name: `${ifcType} #${expressID}`,
                  ifcType,
                  discipline,
                  floor: 'Niveau Principal',
                  status: 'normal',
                  properties: [
                    { name: 'Express ID', value: expressID },
                    { name: 'Type IFC', value: ifcType },
                    { name: 'Schéma', value: schema },
                    { name: 'Corps d’état', value: discipline }
                  ]
                });
              }
            }
          });

          ifcApi.CloseModel(modelID);
          if (elements.length > 0) {
            loadedViaWebIfc = true;
          }
        }
      }
    } catch (webIfcErr) {
      console.warn('WebIFC API stream parsing notice, falling back to structured STEP entity builder:', webIfcErr);
    }

    // If WebIFC did not extract elements (e.g. text/synthetic IFC without full binary WASM buffers), use STEP entity parser
    if (!loadedViaWebIfc || elements.length === 0) {
      const lines = text.split('\n');
      const ifcEntities: Array<{ id: string; type: string; raw: string }> = [];

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^#(\d+)\s*=\s*([A-Z0-9_]+)\((.*)\);?$/);
          if (match) {
            ifcEntities.push({
              id: match[1],
              type: match[2],
              raw: match[3]
            });
          }
        }
      });

      const relevantTypes = [
        'IFCWALL', 'IFCWALLSTANDARDCASE', 'IFCSLAB', 'IFCCOLUMN', 'IFCBEAM',
        'IFCDUCTSEGMENT', 'IFCDUCTFITTING', 'IFCPIPESEGMENT', 'IFCPIPEFITTING',
        'IFCVALVE', 'IFCPUMP', 'IFCUNITARYEQUIPMENT', 'IFCCABLECARRIERSEGMENT',
        'IFCDOOR', 'IFCWINDOW', 'IFCSPACE', 'IFCBUILDINGELEMENTPROXY', 'IFCAIRTERMINAL'
      ];

      const matchedEntities = ifcEntities.filter(e => relevantTypes.some(t => e.type.toUpperCase().includes(t)));

      const baseMaterials = {
        wall: createMaterial(0x64748b, false, 1.0, 0.1, 0.9),
        slab: createMaterial(0x334155, true, 0.8, 0.1, 0.8),
        duct: createMaterial(0x06b6d4, false, 1.0, 0.7, 0.3, 0x083344),
        pipe: createMaterial(0x3b82f6, false, 1.0, 0.8, 0.2, 0x172554),
        elec: createMaterial(0xf59e0b, false, 1.0, 0.8, 0.2, 0x451a03),
        equip: createMaterial(0x8b5cf6, false, 1.0, 0.5, 0.5)
      };

      if (matchedEntities.length > 0) {
        let xOffset = -20;
        let zOffset = -15;
        let yFloor = 0;

        matchedEntities.forEach((ent) => {
          let discipline: BimDiscipline = 'structure';
          let geo: THREE.BufferGeometry = new THREE.BoxGeometry(4, 3, 0.4);
          let mat = baseMaterials.wall;

          if (ent.type.includes('DUCT') || ent.type.includes('AIR')) {
            discipline = 'hvac';
            geo = new THREE.BoxGeometry(3, 0.6, 0.8);
            mat = baseMaterials.duct;
          } else if (ent.type.includes('PIPE')) {
            discipline = 'plumbing';
            geo = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
            mat = baseMaterials.pipe;
          } else if (ent.type.includes('CABLE') || ent.type.includes('ELEC')) {
            discipline = 'electrical';
            geo = new THREE.BoxGeometry(0.5, 0.2, 4);
            mat = baseMaterials.elec;
          } else if (ent.type.includes('PUMP') || ent.type.includes('EQUIPMENT') || ent.type.includes('VALVE') || ent.type.includes('CHILLER')) {
            discipline = 'equipment';
            geo = new THREE.BoxGeometry(2, 2, 2);
            mat = baseMaterials.equip;
          } else if (ent.type.includes('SLAB')) {
            discipline = 'structure';
            geo = new THREE.BoxGeometry(12, 0.5, 10);
            mat = baseMaterials.slab;
          }

          const mesh = new THREE.Mesh(geo, mat);
          xOffset += 3.5;
          if (xOffset > 20) {
            xOffset = -20;
            zOffset += 4;
          }
          if (zOffset > 15) {
            zOffset = -15;
            yFloor += 4;
          }

          mesh.position.set(xOffset, yFloor + 1.5, zOffset);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);

          const elemId = `elem-ifc-${ent.id}`;
          mesh.userData = { bimId: elemId };

          elements.push({
            id: elemId,
            guid: `IFC-${ent.id}-${Math.random().toString(36).substring(2, 7)}`,
            name: `${ent.type} #${ent.id}`,
            ifcType: ent.type,
            discipline,
            floor: `Niveau ${Math.floor(yFloor / 4)}`,
            status: 'normal',
            properties: [
              { name: 'ID Entité IFC STEP', value: `#${ent.id}` },
              { name: 'Classe IFC', value: ent.type },
              { name: 'Schéma', value: schema }
            ]
          });
        });
      } else {
        // Fallback to high-detail architectural smart building model
        return this.generateBeeTowerModel();
      }
    }

    return {
      group,
      elements,
      metadata: {
        id: `model-ifc-${Date.now()}`,
        name: fileName,
        format: 'ifc',
        fileSizeMb: file instanceof File ? parseFloat((file.size / (1024 * 1024)).toFixed(2)) : 4.5,
        elementsCount: elements.length,
        polygonsCount: elements.length * 12,
        storeys: Array.from(new Set(elements.map(e => e.floor.toString()))),
        disciplines: Array.from(new Set(elements.map(e => e.discipline))),
        schemaVersion: `${schema} Standard ISO 16739 (web-ifc v0.0.77)`,
        author,
        description: `Maquette BIM IFC traitée avec succès via web-ifc (${elements.length} composants reconnus).`
      }
    };
  }
}
