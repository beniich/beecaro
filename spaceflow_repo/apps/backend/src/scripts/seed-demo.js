const { PrismaClient } = require("@prisma/client");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const { logger } = require("../lib/logger.js");

const prisma = new PrismaClient();

// ===== Configuration démo =====
const DEMO_TENANT_SLUG = "demo-buildings";
const DEMO_PASSWORD_HASH = process.env.DEMO_PASSWORD_HASH || bcrypt.hashSync("demo123", 10);

const SEED_CONFIG = {
  // Mode démo activé
  enableDemoMode: process.env.NODE_ENV !== "production",
  
  // Options
  generateDemoData: true,
  generateSensors: true,
  generateAlerts: true,
  generateHistoricalReadings: true,
  
  // Volume
  historicalReadingsDays: 7,
  readingsPerDayPerSensor: 24, // toutes les heures
  alertsCount: 15,
};

// ============================================
// DONNEES DE BASE
// ============================================

const DEMO_USERS = [
  {
    email: "admin@BeeCarbonat.com",
    fullName: "Admin Demo",
    role: "OWNER",
    passwordPlaintext: "admin123", // À retirer en production
  },
  {
    email: "facility@BeeCarbonat.com",
    fullName: "Marie Dupont",
    role: "ADMIN",
    passwordPlaintext: "manager123",
  },
  {
    email: "tech@BeeCarbonat.com",
    fullName: "Pierre Martin",
    role: "MEMBER",
    passwordPlaintext: "tech123",
  },
  {
    email: "viewer@BeeCarbonat.com",
    fullName: "Sophie Bernard",
    role: "VIEWER",
    passwordPlaintext: "view123",
  },
  {
    email: "demo@BeeCarbonat.com",
    fullName: "Demo User",
    role: "DEMO",
    passwordPlaintext: "demo123",
  },
];

const DEMO_BUILDINGS = [
  {
    name: "Office Tower A",
    address: "15 Rue de la Paix",
    city: "Paris",
    country: "France",
    geoLocation: { lat: 48.8698, lng: 2.3311 },
    totalSurface: 12500,
  },
  {
    name: "Logistics Center Lyon",
    address: "Zone Industrielle Sud",
    city: "Lyon",
    country: "France",
    geoLocation: { lat: 45.764, lng: 4.8357 },
    totalSurface: 28000,
  },
];

// ============================================
// SEED IFC ELEMENTS
// ============================================

/**
 * Génère un arbre IFC réaliste pour "Office Tower A"
 * 5 étages, 30+ assets HVAC/CVC
 */
function generateIFCElements(modelId, tenantId) {
  const elements = [];

  // Site
  const siteId = 1;
  elements.push({
    id: `${modelId}-${siteId}`,
    tenantId,
    modelId,
    expressID: siteId,
    ifcGlobalId: crypto.randomUUID().replace(/-/g, "").slice(0, 22),
    ifcType: "IFCSITE",
    elementType: "SITE",
    name: "Site Principal Tour A",
    level: "Site",
  });

  // Building
  const buildingId = 10;
  elements.push({
    id: `${modelId}-${buildingId}`,
    tenantId,
    modelId,
    expressID: buildingId,
    ifcGlobalId: crypto.randomUUID().replace(/-/g, "").slice(0, 22),
    ifcType: "IFCBUILDING",
    elementType: "BUILDING",
    name: "Office Tower A",
    parentExpressID: siteId,
    level: "Building",
  });

  // Étages + Equipements
  const FLOORS = ["L1", "L2", "L3", "L4", "L5"];
  const ASSET_TYPES = [
    { type: "IFCDISTRIBUTIONELEMENT", code: "AHU", name: "Air Handling Unit", count: 1, surface: 12 },
    { type: "IFCDISTRIBUTIONELEMENT", code: "VAV", name: "Variable Air Volume", count: 4, surface: 6 },
    { type: "IFCDISTRIBUTIONCONTROLELEMENT", code: "PUMP", name: "Circulation Pump", count: 2, surface: 4 },
    { type: "IFCFLOWSEGMENT", code: "DUCT", name: "HVAC Duct", count: 8, surface: 1.5 },
    { type: "IFCFLOWTERMINAL", code: "DIFF", name: "Air Diffuser", count: 16, surface: 0.5 },
    { type: "IFCEQUIPMENT", code: "SPLIT", name: "Split AC Unit", count: 2, surface: 6 },
    { type: "IFCFLOWSEGMENT", code: "PIPE-W", name: "Water Pipe", count: 6, surface: 0.3 },
    { type: "IFCEQUIPMENT", code: "LIGHT", name: "LED Panel", count: 10, surface: 0.5 },
  ];

  let nextExpressId = 100;
  const assetsWithIfcGuid = [];

  FLOORS.forEach((floor, floorIdx) => {
    // Le floor
    const floorExpressId = nextExpressId++;
    elements.push({
      id: `${modelId}-${floorExpressId}`,
      tenantId,
      modelId,
      expressID: floorExpressId,
      ifcGlobalId: crypto.randomUUID().replace(/-/g, "").slice(0, 22),
      ifcType: "IFCBUILDINGSTOREY",
      elementType: "FLOOR",
      name: floor,
      parentExpressID: buildingId,
      level: floor,
    });

    // Spaces par floor (2-3 par étage)
    [1, 2, 3].forEach(spaceIdx => {
      const spaceId = nextExpressId++;
      elements.push({
        id: `${modelId}-${spaceId}`,
        tenantId,
        modelId,
        expressID: spaceId,
        ifcGlobalId: crypto.randomUUID().replace(/-/g, "").slice(0, 22),
        ifcType: "IFCSPACE",
        elementType: "SPACE",
        name: `${floor} - ${["Open Space", "Meeting Room", "Mechanical Room"][spaceIdx - 1]}`,
        parentExpressID: floorExpressId,
        level: floor,
      });
    });

    // Assets par floor
    ASSET_TYPES.forEach(assetType => {
      const assetsOnFloor = Math.max(1, Math.floor(assetType.count / FLOORS.length));
      for (let i = 0; i < assetsOnFloor; i++) {
        const assetCode = `${assetType.code}-${floor}-${String(i + 1).padStart(2, "0")}`;
        const elementId = nextExpressId++;
        const ifcGuid = crypto.randomUUID().replace(/-/g, "").slice(0, 22);
        
        elements.push({
          id: `${modelId}-${elementId}`,
          tenantId,
          modelId,
          expressID: elementId,
          ifcGlobalId: ifcGuid,
          ifcType: assetType.type,
          elementType: "ASSET",
          name: `${assetType.name} ${assetCode}`,
          parentExpressID: floorExpressId,
          level: floor,
          metadata: {
            code: assetCode,
            assetTypeName: assetType.name,
            surface: assetType.surface,
          },
        });
        
        assetsWithIfcGuid.push({ ifcGuid, assetCode, type: assetType.code, floor });
      }
    });
  });

  return { elements, assetsWithIfcGuid };
}

// ============================================
// SEED ASSETS
// ============================================

async function seedAssets(tenantId, buildingId, assetsWithIfcGuid) {
  const assetMap = [];

  for (const { ifcGuid, assetCode, type, floor } of assetsWithIfcGuid) {
    const assetTypeMap = {
      AHU: "EQUIPMENT",
      VAV: "COMPONENT",
      PUMP: "EQUIPMENT",
      DUCT: "SYSTEM",
      DIFF: "COMPONENT",
      SPLIT: "EQUIPMENT",
      "PIPE-W": "SYSTEM",
      LIGHT: "EQUIPMENT",
    };

    const statusDistribution = {
      AHU: "OPERATIONAL",
      VAV: Math.random() > 0.85 ? "ALERT" : "OPERATIONAL",
      PUMP: Math.random() > 0.9 ? "MAINTENANCE" : "OPERATIONAL",
    };

    const asset = await prisma.asset.upsert({
      where: { tenantId_code: { tenantId, code: assetCode } },
      create: {
        tenantId,
        code: assetCode,
        name: `${assetCode} (${floor})`,
        type: assetTypeMap[type] || "EQUIPMENT",
        status: statusDistribution[type] || "OPERATIONAL",
        buildingId,
        floor: floor === "L1" ? 1 : floor === "L2" ? 2 : floor === "L3" ? 3 : floor === "L4" ? 4 : 5,
        criticality: ["AHU", "PUMP"].includes(type) ? 5 : ["VAV", "SPLIT"].includes(type) ? 3 : 2,
        healthScore: Math.floor(Math.random() * 30 + 70), // 70-100
        ifcGuid,
        manufacturer: ["Daikin", "Trane", "Carrier", "York", "Bosch"][Math.floor(Math.random() * 5)],
        model: ["VAV-III-2024", "PAC-3000", "CRAC-4500"][Math.floor(Math.random() * 3)],
        installDate: new Date(Date.now() - Math.random() * 365 * 5 * 24 * 3600 * 1000), // < 5 ans
      },
      update: { ifcGuid },
    });

    assetMap.push(asset);
  }

  return assetMap;
}

// ============================================
// SEED SENSORS
// ============================================

async function seedSensors(tenantId, assets) {
  const sensorTypesByAssetType = {
    AHU: [
      { type: "TEMPERATURE", count: 2, unit: "°C" },
      { type: "FLOW", count: 1, unit: "m³/h" },
      { type: "VIBRATION", count: 2, unit: "mm/s" },
      { type: "ENERGY", count: 1, unit: "kWh" },
    ],
    VAV: [
      { type: "TEMPERATURE", count: 1, unit: "°C" },
      { type: "AIR_QUALITY", count: 1, unit: "ppm" },
    ],
    PUMP: [
      { type: "VIBRATION", count: 2, unit: "mm/s" },
      { type: "PRESSURE", count: 1, unit: "bar" },
      { type: "TEMPERATURE", count: 1, unit: "°C" },
    ],
    SPLIT: [
      { type: "TEMPERATURE", count: 2, unit: "°C" },
      { type: "ENERGY", count: 1, unit: "kWh" },
    ],
  };

  for (const asset of assets) {
    const sensorConfig = sensorTypesByAssetType[asset.code.split("-")[0]] || [];

    for (const config of sensorConfig) {
      for (let i = 0; i < config.count; i++) {
        const sensorCode = `${asset.code}-${config.type}-${i + 1}`;
        
        // Valeurs réalistes par type
        const baseValueMap = {
          TEMPERATURE: 22,
          VIBRATION: 1.5,
          PRESSURE: 2.5,
          FLOW: 1500,
          ENERGY: 45,
          AIR_QUALITY: 600,
        };

        const baseValue = baseValueMap[config.type] || 0;
        const lastValue = baseValue + (Math.random() - 0.5) * baseValue * 0.2;

        await prisma.sensor.upsert({
          where: { tenantId_code: { tenantId, code: sensorCode } },
          create: {
            tenantId,
            assetId: asset.id,
            code: sensorCode,
            name: `${asset.name} - ${config.type}`,
            type: config.type,
            unit: config.unit,
            status: "ACTIVE",
            lastReadingValue: lastValue,
            lastReadingAt: new Date(Date.now() - Math.random() * 3600 * 1000),
          },
          update: {},
        });

        // Seuil par défaut
        await prisma.sensorThreshold.upsert({
          where: { id: `thresh-${sensorCode}` },
          create: {
            id: `thresh-${sensorCode}`,
            sensorId: `pending-${sensorCode}`, // hack, sera fixé
            minValue: baseValue * 0.7,
            maxValue: baseValue * 1.4,
            minCritical: baseValue * 0.5,
            maxCritical: baseValue * 1.8,
          },
          update: {},
        });
      }
    }
  }
}

// ============================================
// SEED HISTORICAL READINGS
// ============================================

async function seedHistoricalReadings(tenantId) {
  const sensors = await prisma.sensor.findMany({
    where: { tenantId, status: "ACTIVE" },
  });

  const readings = [];
  const now = Date.now();
  const interval = 3600 * 1000; // 1h

  for (const sensor of sensors) {
    const baseValue = sensor.lastReadingValue || 50;
    
    for (let day = SEED_CONFIG.historicalReadingsDays; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour += Math.ceil(24 / SEED_CONFIG.readingsPerDayPerSensor)) {
        const timestamp = new Date(now - day * 24 * 3600 * 1000 - hour * 3600 * 1000);
        const variation = Math.sin((hour / 24) * Math.PI * 2) * 0.15; // cycle jour/nuit
        const noise = (Math.random() - 0.5) * 0.1;
        const value = baseValue * (1 + variation + noise);

        readings.push({
          tenantId,
          sensorId: sensor.id,
          value: Math.round(value * 100) / 100,
          timestamp,
          quality: Math.random() > 0.95 ? "DEGRADED" : "GOOD",
        });
      }
    }
  }

  // Insertion en batches
  const BATCH = 1000;
  for (let i = 0; i < readings.length; i += BATCH) {
    await prisma.sensorReading.createMany({
      data: readings.slice(i, i + BATCH),
      skipDuplicates: true,
    });
  }

  logger.info(`Inserted ${readings.length} sensor readings`);
}

// ============================================
// SEED ALERTS
// ============================================

async function seedAlerts(tenantId, modelId) {
  const sensors = await prisma.sensor.findMany({
    where: { tenantId, status: "ACTIVE" },
    take: 10,
  });

  const alertTemplates = [
    {
      severity: "CRITICAL",
      title: "Température élevée détectée",
      description: "Capteur au-dessus du seuil critique",
      location: "Floor L3 · Structural",
    },
    {
      severity: "WARNING",
      title: "Vibration anormale moteur",
      description: "Niveau vibratoire dépassant la norme ISO 10816-3",
      location: "Floor L2 · Mechanical Room",
    },
    {
      severity: "INFO",
      title: "Maintenance préventive requise",
      description: "Intervention planifiée dans 7 jours",
      location: "Floor L1 · Rooftop",
    },
  ];

  for (let i = 0; i < SEED_CONFIG.alertsCount; i++) {
    const template = alertTemplates[i % alertTemplates.length];
    const sensor = sensors[Math.floor(Math.random() * sensors.length)];

    await prisma.alert.create({
      data: {
        tenantId,
        modelId,
        sensorId: sensor?.id,
        severity: template.severity,
        title: template.title,
        description: template.description,
        location: template.location,
        value: sensor?.lastReadingValue || 0,
        threshold: sensor?.lastReadingValue ? sensor.lastReadingValue * 1.3 : 0,
        createdAt: new Date(Date.now() - Math.random() * 24 * 3600 * 1000),
      },
    });
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("🌱 Starting demo seed...\n");

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO_TENANT_SLUG },
    create: {
      id: "demo-tenant-uuid",
      name: "BeeCarbonat Demo Buildings",
      slug: DEMO_TENANT_SLUG,
      status: "ACTIVE",
      config: { 
        isDemo: SEED_CONFIG.enableDemoMode,
        generatedAt: new Date().toISOString(),
      },
    },
    update: {},
  });

  console.log(`✅ Tenant: ${tenant.name}`);

  // 2. Users
  for (const userData of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { 
        tenantId: tenant.id, 
        email: userData.email 
      }},
      create: {
        tenantId: tenant.id,
        email: userData.email,
        passwordHash: bcrypt.hashSync(userData.passwordPlaintext, 10),
        fullName: userData.fullName,
        role: userData.role,
      },
      update: {},
    });
    console.log(`✅ User: ${user.email} (${user.role})`);
  }

  // 3. Buildings
  const buildings = [];
  for (const buildingData of DEMO_BUILDINGS) {
    const building = await prisma.building.upsert({
      where: { id: `building-${buildingData.name.replace(/\s+/g, "-").toLowerCase()}` },
      create: {
        id: `building-${buildingData.name.replace(/\s+/g, "-").toLowerCase()}`,
        tenantId: tenant.id,
        ...buildingData,
      },
      update: {},
    });
    buildings.push(building);
    console.log(`✅ Building: ${building.name}`);
  }

  // 4. BIM Model
  for (const building of buildings) {
    const model = await prisma.bIMModel.upsert({
      where: { id: `model-${building.id}` },
      create: {
        id: `model-${building.id}`,
        tenantId: tenant.id,
        name: `${building.name} - IFC`,
        status: "READY",
        storageKey: `demo/${building.id}.ifc`,
        fileSize: BigInt(45_000_000),
        elementCount: 0,
        buildingId: building.id,
        processedAt: new Date(),
      },
      update: {},
    });

    // 5. BIM Elements (Office Tower A only - others progressif)
    if (building.name === "Office Tower A") {
      const { elements, assetsWithIfcGuid } = generateIFCElements(model.id, tenant.id);
      
      // Lier les BIMElements aux Assets via ifcGuid
      const assets = await seedAssets(tenant.id, building.id, assetsWithIfcGuid);
      
      // Mettre à jour les éléments avec assetId
      for (const element of elements) {
        if (element.metadata?.code) {
          const linkedAsset = assets.find(a => a.code === element.metadata.code);
          if (linkedAsset) element.assetId = linkedAsset.id;
        }
      }
      
      // Insertion BIMElements
      await prisma.bIMElement.deleteMany({ where: { modelId: model.id } });
      await prisma.bIMElement.createMany({ data: elements });
      
      // Mettre à jour le compteur
      await prisma.bIMModel.update({
        where: { id: model.id },
        data: { elementCount: elements.length },
      });
      
      console.log(`✅ BIM Model: ${model.name} (${elements.length} éléments)`);
      
      // 6. Sensors + Thresholds
      if (SEED_CONFIG.generateSensors) {
        await seedSensors(tenant.id, assets);
        console.log(`✅ Sensors générés`);
      }
      
      // 7. Alerts
      if (SEED_CONFIG.generateAlerts) {
        await seedAlerts(tenant.id, model.id);
        console.log(`✅ ${SEED_CONFIG.alertsCount} alertes générées`);
      }
    } else {
      console.log(`✅ BIM Model: ${model.name} (vide - autres modèles en cours)`);
    }
  }

  // 8. Historical Readings
  if (SEED_CONFIG.generateHistoricalReadings) {
    console.log("📊 Génération des lectures historiques...");
    await seedHistoricalReadings(tenant.id);
  }

  console.log("\n🎉 Seed terminé avec succès!");
  console.log("\n📋 Comptes démo créés:");
  console.log("   admin@BeeCarbonat.com / admin123");
  console.log("   facility@BeeCarbonat.com / manager123");
  console.log("   tech@BeeCarbonat.com / tech123");
  console.log("   demo@BeeCarbonat.com / demo123");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
