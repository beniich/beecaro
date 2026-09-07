import { pool, dbConnectionString } from './database';
import { 
  mockBuildings, 
  mockAssets, 
  mockWorkOrders, 
  mockEsgMetrics, 
  mockLeases, 
  mockTelemetryNodes, 
  mockIntervenants
} from '../../data/mockData';
import { mockLightingZones, mockWaterSectors } from '../stores';

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
        resolution_notes TEXT,
        building_address TEXT,
        building_city TEXT,
        building_contact TEXT,
        building_phone TEXT
      );

      CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        floors INTEGER NOT NULL,
        area_sq_m REAL NOT NULL,
        occupancy_rate REAL NOT NULL,
        energy_rating TEXT NOT NULL,
        carbon_intensity REAL NOT NULL,
        health_score REAL NOT NULL,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT,
        contact_person TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        access_instructions TEXT,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS telemetry_nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        zone TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        status TEXT NOT NULL,
        trend TEXT NOT NULL,
        health_score REAL NOT NULL,
        building_id TEXT
      );

      CREATE TABLE IF NOT EXISTS leases (
        id TEXT PRIMARY KEY,
        tenant_name TEXT NOT NULL,
        tenant_industry TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        building_name TEXT NOT NULL,
        unit_code TEXT NOT NULL,
        area_sq_m REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        monthly_rent_usd REAL NOT NULL,
        deposit_usd REAL NOT NULL,
        status TEXT NOT NULL,
        esg_clause_compliant TEXT NOT NULL,
        payment_status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS esg_metrics (
        id TEXT PRIMARY KEY,
        scope1 REAL,
        scope2 REAL,
        scope3 REAL,
        energy_consumption_kwh REAL,
        renewable_percentage REAL,
        carbon_offsets_credits REAL,
        reduction_target_percentage REAL,
        csrd_compliance_status TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS spaces (
        id TEXT PRIMARY KEY,
        floor TEXT NOT NULL,
        desks_total INTEGER NOT NULL,
        occupied INTEGER NOT NULL,
        occupancy_rate REAL NOT NULL,
        temp_c REAL NOT NULL,
        department TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS lighting_zones (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        luminaires INTEGER NOT NULL,
        status TEXT NOT NULL,
        protocol TEXT NOT NULL,
        consumption_kw REAL NOT NULL,
        brightness INTEGER NOT NULL,
        color_temp INTEGER NOT NULL,
        circadian_mode BOOLEAN NOT NULL,
        power_status BOOLEAN NOT NULL
      );

      CREATE TABLE IF NOT EXISTS water_sectors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        pressure REAL NOT NULL,
        flow REAL NOT NULL,
        temp REAL NOT NULL,
        valve_open BOOLEAN NOT NULL,
        leak_mitigated BOOLEAN NOT NULL
      );

      CREATE TABLE IF NOT EXISTS field_operators (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        type TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        specialties JSONB NOT NULL,
        status TEXT NOT NULL,
        task TEXT NOT NULL,
        load INTEGER NOT NULL,
        phone TEXT NOT NULL,
        hourly_rate_eur REAL NOT NULL,
        avatar TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS processed_events (
        event_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        ip_address TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Safe Schema Migrations (Add missing columns if tables already existed)
    await client.query(`
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_address TEXT;
          ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_city TEXT;
          ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_contact TEXT;
          ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS building_phone TEXT;
        EXCEPTION WHEN others THEN NULL;
        END;
        BEGIN
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS address TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS city TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS postal_code TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS country TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS contact_person TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS contact_phone TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS contact_email TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS access_instructions TEXT;
          ALTER TABLE buildings ADD COLUMN IF NOT EXISTS status TEXT;
        EXCEPTION WHEN others THEN NULL;
        END;
      END $$;
    `);

    // 3. Seed data if tables are empty
    const checkAssets = await client.query('SELECT COUNT(*) FROM assets');
    if (parseInt(checkAssets.rows[0].count, 10) === 0) {
      for (const a of mockAssets) {
        await client.query(
          `INSERT INTO assets (id, name, code, category, building_id, building_name, floor, zone, status, health_score, last_inspected, next_service, install_date, manufacturer, model, serial_number, power_consumption_kw, telemetry, qr_code_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) ON CONFLICT (id) DO NOTHING`,
          [a.id, a.name, a.code, a.category, a.buildingId, a.buildingName, a.floor, a.zone, a.status, a.healthScore, a.lastInspected, a.nextService, a.installDate, a.manufacturer, a.model, a.serialNumber, a.powerConsumptionKw, JSON.stringify(a.telemetry), a.qrCodeUrl]
        );
      }
    }

    const checkWo = await client.query('SELECT COUNT(*) FROM work_orders');
    if (parseInt(checkWo.rows[0].count, 10) === 0) {
      for (const w of mockWorkOrders) {
        await client.query(
          `INSERT INTO work_orders (id, ticket_number, title, description, asset_id, asset_name, building_id, building_name, floor, priority, status, category, assigned_technician, created_at, sla_deadline, estimated_hours, actual_hours, parts_used, procedure_steps, audit_log, root_cause, resolution_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) ON CONFLICT (id) DO NOTHING`,
          [w.id, w.ticketNumber, w.title, w.description, w.assetId, w.assetName, w.buildingId, w.buildingName, w.floor, w.priority, w.status, w.category, JSON.stringify(w.assignedTechnician), w.createdAt, w.slaDeadline, w.estimatedHours, w.actualHours, JSON.stringify(w.partsUsed), JSON.stringify(w.procedureSteps), JSON.stringify(w.auditLog), w.rootCause, w.resolutionNotes]
        );
      }
    }

    const checkBuildings = await client.query('SELECT COUNT(*) FROM buildings');
    if (parseInt(checkBuildings.rows[0].count, 10) === 0) {
      for (const b of mockBuildings) {
        await client.query(
          `INSERT INTO buildings (id, name, code, floors, area_sq_m, occupancy_rate, energy_rating, carbon_intensity, health_score, address, city, postal_code, country, contact_person, contact_phone, contact_email, access_instructions, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) ON CONFLICT (id) DO NOTHING`,
          [b.id, b.name, b.code, b.floors, b.areaSqM, b.occupancyRate, b.energyRating, b.carbonIntensity, b.healthScore, (b as any).address || '120 Avenue des Champs-Élysées', (b as any).city || 'Paris', (b as any).postalCode || '75008', (b as any).country || 'France', (b as any).contactPerson || 'Directeur de Site', (b as any).contactPhone || '+33 1 40 00 00 00', (b as any).contactEmail || 'site@beecarbonat.com', (b as any).accessInstructions || 'Accès par le poste de garde Nord.', (b as any).status || 'optimal']
        );
      }
    }

    const checkLighting = await client.query('SELECT COUNT(*) FROM lighting_zones');
    if (parseInt(checkLighting.rows[0].count, 10) === 0) {
      for (const lz of mockLightingZones) {
        await client.query(
          `INSERT INTO lighting_zones (id, name, luminaires, status, protocol, consumption_kw, brightness, color_temp, circadian_mode, power_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
          [lz.id, lz.name, lz.luminaires, lz.status, lz.protocol, lz.consumptionKw, lz.brightness, lz.colorTemp, lz.circadianMode, lz.powerStatus]
        );
      }
    }

    const checkWater = await client.query('SELECT COUNT(*) FROM water_sectors');
    if (parseInt(checkWater.rows[0].count, 10) === 0) {
      for (const ws of mockWaterSectors) {
        await client.query(
          `INSERT INTO water_sectors (id, name, status, pressure, flow, temp, valve_open, leak_mitigated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [ws.id, ws.name, ws.status, ws.pressure, ws.flow, ws.temp, ws.valveOpen, ws.leakMitigated]
        );
      }
    }

    const checkOperators = await client.query('SELECT COUNT(*) FROM field_operators');
    if (parseInt(checkOperators.rows[0].count, 10) === 0) {
      for (const fo of mockIntervenants) {
        await client.query(
          `INSERT INTO field_operators (id, name, company, type, email, role, specialties, status, task, load, phone, hourly_rate_eur, avatar)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING`,
          [
            Number(fo.id),
            fo.name,
            fo.company || 'BeeCarbonat Maintenance',
            fo.type || 'internal',
            fo.email || 'tech@beecarbonat.com',
            fo.role || 'Technicien',
            JSON.stringify(fo.specialties || []),
            fo.status || 'On Call',
            fo.task || 'Disponible',
            fo.load || 0,
            fo.phone || '+33 6 00 00 00 00',
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
