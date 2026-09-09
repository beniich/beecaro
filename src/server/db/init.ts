


// Automatic Database Migration & Schema Synchronizer
import { pool } from '../../db/index';
import { mockAssets, mockWorkOrders, mockBuildings, mockLeases, mockTelemetryNodes,   mockIntervenants, mockEsgMetrics } from '../../data/mockData';
import { stores } from './memoryStore';

const dbConnectionString = process.env.MY_NEON_DB_URL;

export async function initDatabase() {
  if (!dbConnectionString) {
    console.log('[BeeCarbonat Backend] Running with in-memory database simulation.');
    return;
  }


  let client: any = null;
  try {
    client = await pool.connect();
    console.log('[BeeCarbonat DB] Connected to Neon PostgreSQL. Synchronizing tables and columns...');

    // 1. Ensure all core tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        category TEXT NOT NULL,
        building_id TEXT,
        building_name TEXT,
        floor TEXT,
        zone TEXT,
        status TEXT NOT NULL,
        health_score INTEGER,
        last_inspected TEXT,
        next_service TEXT,
        install_date TEXT,
        manufacturer TEXT,
        model TEXT,
        serial_number TEXT,
        power_consumption_kw REAL,
        telemetry JSONB,
        qr_code_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS work_orders (
        id TEXT PRIMARY KEY,
        ticket_number TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        asset_id TEXT,
        asset_name TEXT,
        building_id TEXT,
        building_name TEXT,
        floor TEXT,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        category TEXT,
        assigned_technician JSONB,
        created_at TEXT,
        sla_deadline TEXT,
        estimated_hours REAL,
        actual_hours REAL,
        parts_used JSONB,
        procedure_steps JSONB,
        audit_log JSONB,
        root_cause TEXT,
        resolution_notes TEXT
      );

      CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        floors INTEGER,
        area_sq_m INTEGER,
        occupancy_rate INTEGER,
        energy_rating TEXT,
        carbon_intensity REAL,
        health_score INTEGER,
        address TEXT,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS telemetry_nodes (
        id TEXT PRIMARY KEY,
        x REAL,
        y REAL,
        z REAL,
        label TEXT NOT NULL,
        type TEXT,
        value TEXT,
        status TEXT,
        floor INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leases (
        id TEXT PRIMARY KEY,
        tenant_name TEXT NOT NULL,
        tenant_industry TEXT,
        contact_person TEXT,
        contact_email TEXT,
        building_name TEXT,
        unit_code TEXT,
        area_sq_m INTEGER,
        start_date TEXT,
        end_date TEXT,
        monthly_rent_usd INTEGER,
        deposit_usd INTEGER,
        status TEXT,
        esg_clause_compliant TEXT,
        payment_status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS esg_metrics (
        id TEXT PRIMARY KEY,
        total_carbon_ytd_tonnes REAL,
        target_carbon_ytd_tonnes REAL,
        carbon_reduction_percent REAL,
        scope1_kg_co2e REAL,
        scope2_kg_co2e REAL,
        scope3_kg_co2e REAL,
        solar_generated_kwh REAL,
        grid_import_kwh REAL,
        water_recycled_liters REAL,
        waste_diversion_rate REAL,
        carbon_credits_owned INTEGER,
        carbon_credits_retired INTEGER,
        air_quality_index_avg INTEGER,
        green_building_cert TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS spaces (
        id TEXT PRIMARY KEY,
        floor TEXT NOT NULL,
        desks_total INTEGER,
        occupied INTEGER,
        occupancy_rate INTEGER,
        temp_c REAL,
        department TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        google_id TEXT,
        photo_url TEXT,
        role TEXT DEFAULT 'VIEWER',
        subscription_status TEXT DEFAULT 'inactive',
        plan TEXT,
        paypal_subscription_id TEXT,
        paypal_customer_id TEXT,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS processed_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        status TEXT DEFAULT 'PROCESSED',
        payload JSONB,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lighting_zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        luminaires INTEGER NOT NULL,
        status TEXT NOT NULL,
        protocol TEXT NOT NULL,
        consumption_kw REAL NOT NULL,
        brightness INTEGER DEFAULT 75,
        color_temp INTEGER DEFAULT 4000,
        circadian_mode BOOLEAN DEFAULT TRUE,
        power_status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS water_sectors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        pressure REAL NOT NULL,
        flow REAL NOT NULL,
        temp REAL NOT NULL,
        valve_open BOOLEAN DEFAULT TRUE,
        leak_mitigated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS field_operators (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        task TEXT NOT NULL,
        load INTEGER NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Ensure all columns in work_orders, assets, buildings, and field_operators exist individually
    const alterStatements = [
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS procedure_steps JSONB',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS audit_log JSONB',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS root_cause TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS resolution_notes TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS estimated_hours REAL',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS actual_hours REAL',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS parts_used JSONB',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS assigned_technician JSONB',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS created_at TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS sla_deadline TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS category TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS floor TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_id TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_name TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_address TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_city TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_contact TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_phone TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS asset_id TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS asset_name TEXT',
      'ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS description TEXT',

      'ALTER TABLE assets ADD COLUMN IF NOT EXISTS power_consumption_kw REAL',
      'ALTER TABLE assets ADD COLUMN IF NOT EXISTS telemetry JSONB',
      'ALTER TABLE assets ADD COLUMN IF NOT EXISTS qr_code_url TEXT',
      'ALTER TABLE assets ADD COLUMN IF NOT EXISTS health_score INTEGER',

      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS address TEXT',
      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS city TEXT',
      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS postal_code TEXT',
      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS country TEXT',
      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS contact_person TEXT',
      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS contact_phone TEXT',
      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS contact_email TEXT',
      'ALTER TABLE buildings ADD COLUMN IF NOT EXISTS access_instructions TEXT',

      'ALTER TABLE field_operators ADD COLUMN IF NOT EXISTS company TEXT',
      'ALTER TABLE field_operators ADD COLUMN IF NOT EXISTS type TEXT',
      'ALTER TABLE field_operators ADD COLUMN IF NOT EXISTS email TEXT',
      'ALTER TABLE field_operators ADD COLUMN IF NOT EXISTS specialties JSONB',
      'ALTER TABLE field_operators ADD COLUMN IF NOT EXISTS hourly_rate_eur INTEGER',
      'ALTER TABLE field_operators ADD COLUMN IF NOT EXISTS avatar TEXT'
    ];

    for (const stmt of alterStatements) {
      try {
        await client.query(stmt);
      } catch (colErr: any) {
        // Safe to ignore if column already exists or table structure variation
      }
    }

    // 4. Seed initial work orders if empty
    const woCheck = await client.query('SELECT count(*) FROM work_orders');
    if (parseInt(woCheck.rows[0].count, 10) === 0) {
      console.log('[BeeCarbonat DB] Auto-seeding initial work orders...');
      for (const wo of mockWorkOrders) {
        await client.query(
          `INSERT INTO work_orders (
            id, ticket_number, title, description, asset_id, asset_name,
            building_id, building_name, floor, priority, status, category,
            assigned_technician, created_at, sla_deadline, estimated_hours,
            actual_hours, parts_used, procedure_steps, audit_log, root_cause, resolution_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO NOTHING`,
          [
            wo.id,
            wo.ticketNumber,
            wo.title,
            wo.description,
            wo.assetId || null,
            wo.assetName || null,
            wo.buildingId,
            wo.buildingName,
            wo.floor,
            wo.priority,
            wo.status,
            wo.category,
            JSON.stringify(wo.assignedTechnician),
            wo.createdAt,
            wo.slaDeadline,
            wo.estimatedHours,
            wo.actualHours || null,
            JSON.stringify(wo.partsUsed || stores.lightingZonesStore),
            JSON.stringify((wo as any).procedureSteps || stores.lightingZonesStore),
            JSON.stringify((wo as any).auditLog || stores.lightingZonesStore),
            (wo as any).rootCause || null,
            (wo as any).resolutionNotes || null
          ]
        );
      }
    }

    // 5. Seed initial assets if empty
    const astCheck = await client.query('SELECT count(*) FROM assets');
    if (parseInt(astCheck.rows[0].count, 10) === 0) {
      console.log('[BeeCarbonat DB] Auto-seeding initial assets...');
      for (const ast of mockAssets) {
        await client.query(
          `INSERT INTO assets (
            id, name, code, category, building_id, building_name, floor, zone,
            status, health_score, last_inspected, next_service, install_date,
            manufacturer, model, serial_number, power_consumption_kw, telemetry, qr_code_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (id) DO NOTHING`,
          [
            ast.id,
            ast.name,
            ast.code,
            ast.category,
            ast.buildingId,
            ast.buildingName,
            ast.floor,
            ast.zone,
            ast.status,
            ast.healthScore,
            ast.lastInspected,
            ast.nextService,
            ast.installDate,
            ast.manufacturer,
            ast.model,
            ast.serialNumber,
            ast.powerConsumptionKw,
            JSON.stringify(ast.telemetry),
            ast.qrCodeUrl
          ]
        );
      }
    }

    // 6. Seed initial buildings if empty
    const bldCheck = await client.query('SELECT count(*) FROM buildings');
    if (parseInt(bldCheck.rows[0].count, 10) === 0) {
      console.log('[BeeCarbonat DB] Auto-seeding initial buildings...');
      for (const bld of mockBuildings) {
        await client.query(
          `INSERT INTO buildings (
            id, name, code, floors, area_sq_m, occupancy_rate, energy_rating,
            carbon_intensity, health_score, address, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING`,
          [
            bld.id,
            bld.name,
            bld.code,
            bld.floors,
            bld.areaSqM,
            bld.occupancyRate,
            bld.energyRating,
            bld.carbonIntensity,
            bld.healthScore,
            bld.address,
            bld.status
          ]
        );
      }
    }

    // 7. Seed initial telemetry nodes if empty
    const nodeCheck = await client.query('SELECT count(*) FROM telemetry_nodes');
    if (parseInt(nodeCheck.rows[0].count, 10) === 0) {
      for (const node of mockTelemetryNodes) {
        await client.query(
          `INSERT INTO telemetry_nodes (id, x, y, z, label, type, value, status, floor)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [node.id, node.x, node.y, node.z, node.label, node.type, node.value, node.status, node.floor]
        );
      }
    }

    // 8. Seed initial leases if empty
    const leaseCheck = await client.query('SELECT count(*) FROM leases');
    if (parseInt(leaseCheck.rows[0].count, 10) === 0) {
      for (const lse of mockLeases) {
        await client.query(
          `INSERT INTO leases (
            id, tenant_name, tenant_industry, contact_person, contact_email,
            building_name, unit_code, area_sq_m, start_date, end_date,
            monthly_rent_usd, deposit_usd, status, esg_clause_compliant, payment_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO NOTHING`,
          [
            lse.id, lse.tenantName, lse.tenantIndustry, lse.contactPerson, lse.contactEmail,
            lse.buildingName, lse.unitCode, lse.areaSqM, lse.startDate, lse.endDate,
            lse.monthlyRentUsd, lse.depositUsd, lse.status, lse.esgClauseCompliant ? 'true' : 'false', lse.paymentStatus
          ]
        );
      }
    }

    // 9. Seed initial ESG record if empty
    const esgCheck = await client.query('SELECT count(*) FROM esg_metrics');
    if (parseInt(esgCheck.rows[0].count, 10) === 0) {
      await client.query(
        `INSERT INTO esg_metrics (
          id, total_carbon_ytd_tonnes, target_carbon_ytd_tonnes, carbon_reduction_percent,
          scope1_kg_co2e, scope2_kg_co2e, scope3_kg_co2e, solar_generated_kwh, grid_import_kwh,
          water_recycled_liters, waste_diversion_rate, carbon_credits_owned, carbon_credits_retired,
          air_quality_index_avg, green_building_cert
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO NOTHING`,
        [
          'esg-main-2026',
          mockEsgMetrics.totalCarbonYtdTonnes,
          mockEsgMetrics.targetCarbonYtdTonnes,
          mockEsgMetrics.carbonReductionPercent,
          mockEsgMetrics.scope1KgCo2e,
          mockEsgMetrics.scope2KgCo2e,
          mockEsgMetrics.scope3KgCo2e,
          mockEsgMetrics.solarGeneratedKwh,
          mockEsgMetrics.gridImportKwh,
          mockEsgMetrics.waterRecycledLiters,
          mockEsgMetrics.wasteDiversionRate,
          mockEsgMetrics.carbonCreditsOwned,
          mockEsgMetrics.carbonCreditsRetired,
          mockEsgMetrics.airQualityIndexAvg,
          mockEsgMetrics.greenBuildingCert
        ]
      );
    }

    // 5. Seed initial lighting zones if empty
    const lzCheck = await client.query('SELECT count(*) FROM lighting_zones');
    if (parseInt(lzCheck.rows[0].count, 10) === 0) {
      console.log('[BeeCarbonat DB] Auto-seeding initial lighting zones...');
      for (const lz of stores.lightingZonesStore) {
        await client.query(
          `INSERT INTO lighting_zones (
            id, name, luminaires, status, protocol, consumption_kw, brightness, color_temp, circadian_mode, power_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING`,
          [
            lz.id,
            lz.name,
            lz.luminaires,
            lz.status,
            lz.protocol,
            lz.consumptionKw,
            lz.brightness,
            lz.colorTemp,
            lz.circadianMode,
            lz.powerStatus
          ]
        );
      }
    }

    // 6. Seed initial water sectors if empty
    const wsCheck = await client.query('SELECT count(*) FROM water_sectors');
    if (parseInt(wsCheck.rows[0].count, 10) === 0) {
      console.log('[BeeCarbonat DB] Auto-seeding initial water sectors...');
      for (const ws of stores.waterSectorsStore) {
        await client.query(
          `INSERT INTO water_sectors (
            id, name, status, pressure, flow, temp, valve_open, leak_mitigated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING`,
          [
            ws.id,
            ws.name,
            ws.status,
            ws.pressure,
            ws.flow,
            ws.temp,
            ws.valveOpen,
            ws.leakMitigated
          ]
        );
      }
    }

    // 7. Seed initial field operators if empty
    const foCheck = await client.query('SELECT count(*) FROM field_operators');
    if (parseInt(foCheck.rows[0].count, 10) === 0) {
      console.log('[BeeCarbonat DB] Auto-seeding initial field operators / intervenants...');
      for (const fo of stores.fieldOperatorsStore) {
        await client.query(
          `INSERT INTO field_operators (
            id, name, role, status, task, load, phone, company, type, email, specialties, hourly_rate_eur, avatar
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING`,
          [
            fo.id,
            fo.name,
            fo.role,
            fo.status,
            fo.task,
            fo.load,
            fo.phone,
            fo.company || 'BeeCarbonat',
            fo.type || 'internal',
            fo.email || 'tech@beecarbonat.com',
            JSON.stringify(fo.specialties || stores.lightingZonesStore),
            fo.hourlyRateEur || 65,
            fo.avatar || ''
          ]
        );
      }
    }

    console.log('[BeeCarbonat DB] PostgreSQL schema & seed check completed successfully.');
  } catch (err: any) {
    console.warn('[BeeCarbonat DB] Notice during initDatabase:', err.message);
  } finally {
    if (client) client.release();
  }
}

