import { pgTable, text, timestamp, integer, jsonb, real, index, boolean } from 'drizzle-orm/pg-core';

export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  category: text('category').notNull(),
  buildingId: text('building_id'),
  buildingName: text('building_name'),
  floor: text('floor'),
  zone: text('zone'),
  status: text('status').notNull(),
  healthScore: integer('health_score'),
  lastInspected: text('last_inspected'),
  nextService: text('next_service'),
  installDate: text('install_date'),
  manufacturer: text('manufacturer'),
  model: text('model'),
  serialNumber: text('serial_number'),
  powerConsumptionKw: real('power_consumption_kw'),
  telemetry: jsonb('telemetry'),
  qrCodeUrl: text('qr_code_url'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  buildingIdIdx: index('asset_building_id_idx').on(table.buildingId),
  statusIdx: index('asset_status_idx').on(table.status),
  categoryIdx: index('asset_category_idx').on(table.category)
}));

export const workOrders = pgTable('work_orders', {
  id: text('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  assetId: text('asset_id').references(() => assets.id),
  assetName: text('asset_name'),
  buildingId: text('building_id'),
  buildingName: text('building_name'),
  buildingAddress: text('building_address'),
  buildingCity: text('building_city'),
  buildingContact: text('building_contact'),
  buildingPhone: text('building_phone'),
  floor: text('floor'),
  priority: text('priority').notNull(),
  status: text('status').notNull(),
  category: text('category'),
  assignedTechnician: jsonb('assigned_technician'),
  createdAt: text('created_at'),
  slaDeadline: text('sla_deadline'),
  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
  partsUsed: jsonb('parts_used'),
  procedureSteps: jsonb('procedure_steps'),
  auditLog: jsonb('audit_log'),
  rootCause: text('root_cause'),
  resolutionNotes: text('resolution_notes')
}, (table) => ({
  assetIdIdx: index('wo_asset_id_idx').on(table.assetId),
  buildingIdIdx: index('wo_building_id_idx').on(table.buildingId),
  statusIdx: index('wo_status_idx').on(table.status)
}));

export const buildings = pgTable('buildings', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  floors: integer('floors'),
  areaSqM: integer('area_sq_m'),
  occupancyRate: integer('occupancy_rate'),
  energyRating: text('energy_rating'),
  carbonIntensity: real('carbon_intensity'),
  healthScore: integer('health_score'),
  address: text('address'),
  city: text('city'),
  postalCode: text('postal_code'),
  country: text('country'),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  accessInstructions: text('access_instructions'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow()
});

export const telemetryNodes = pgTable('telemetry_nodes', {
  id: text('id').primaryKey(),
  x: real('x'),
  y: real('y'),
  z: real('z'),
  label: text('label').notNull(),
  type: text('type'),
  value: text('value'),
  status: text('status'),
  floor: integer('floor'),
  createdAt: timestamp('created_at').defaultNow()
});

export const leases = pgTable('leases', {
  id: text('id').primaryKey(),
  tenantName: text('tenant_name').notNull(),
  tenantIndustry: text('tenant_industry'),
  contactPerson: text('contact_person'),
  contactEmail: text('contact_email'),
  buildingName: text('building_name'),
  unitCode: text('unit_code'),
  areaSqM: integer('area_sq_m'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  monthlyRentUsd: integer('monthly_rent_usd'),
  depositUsd: integer('deposit_usd'),
  status: text('status'),
  esgClauseCompliant: text('esg_clause_compliant'),
  paymentStatus: text('payment_status'),
  createdAt: timestamp('created_at').defaultNow()
});

export const esgMetricsTable = pgTable('esg_metrics', {
  id: text('id').primaryKey(),
  totalCarbonYtdTonnes: real('total_carbon_ytd_tonnes'),
  targetCarbonYtdTonnes: real('target_carbon_ytd_tonnes'),
  carbonReductionPercent: real('carbon_reduction_percent'),
  scope1KgCo2e: real('scope1_kg_co2e'),
  scope2KgCo2e: real('scope2_kg_co2e'),
  scope3KgCo2e: real('scope3_kg_co2e'),
  solarGeneratedKwh: real('solar_generated_kwh'),
  gridImportKwh: real('grid_import_kwh'),
  waterRecycledLiters: real('water_recycled_liters'),
  wasteDiversionRate: real('waste_diversion_rate'),
  carbonCreditsOwned: integer('carbon_credits_owned'),
  carbonCreditsRetired: integer('carbon_credits_retired'),
  airQualityIndexAvg: integer('air_quality_index_avg'),
  greenBuildingCert: text('green_building_cert'),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const spaces = pgTable('spaces', {
  id: text('id').primaryKey(),
  floor: text('floor').notNull(),
  desksTotal: integer('desks_total'),
  occupied: integer('occupied'),
  occupancyRate: integer('occupancy_rate'),
  tempC: real('temp_c'),
  department: text('department'),
  createdAt: timestamp('created_at').defaultNow()
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  googleId: text('google_id'),
  photoUrl: text('photo_url'),
  role: text('role').default('VIEWER'), // VIEWER, PRO, FACILITY_MANAGER, ADMIN, SUPERADMIN
  subscriptionStatus: text('subscription_status').default('inactive'), // inactive, active, past_due, cancelled
  plan: text('plan'), // PRO, ENTERPRISE
  paypalSubscriptionId: text('paypal_subscription_id'),
  paypalCustomerId: text('paypal_customer_id'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const processedEvents = pgTable('processed_events', {
  id: text('id').primaryKey(), // PayPal Event ID (Idempotency)
  eventType: text('event_type').notNull(),
  status: text('status').default('PROCESSED'),
  payload: jsonb('payload'),
  processedAt: timestamp('processed_at').defaultNow()
});

export const lightingZones = pgTable('lighting_zones', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  luminaires: integer('luminaires').notNull(),
  status: text('status').notNull(),
  protocol: text('protocol').notNull(),
  consumptionKw: real('consumption_kw').notNull(),
  brightness: integer('brightness').default(75),
  colorTemp: integer('color_temp').default(4000),
  circadianMode: boolean('circadian_mode').default(true),
  powerStatus: boolean('power_status').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const waterSectors = pgTable('water_sectors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  pressure: real('pressure').notNull(),
  flow: real('flow').notNull(),
  temp: real('temp').notNull(),
  valveOpen: boolean('valve_open').default(true),
  leakMitigated: boolean('leak_mitigated').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const fieldOperators = pgTable('field_operators', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  status: text('status').notNull(),
  task: text('task').notNull(),
  load: integer('load').notNull(),
  phone: text('phone'),
  company: text('company'),
  type: text('type'), // 'internal' | 'subcontractor'
  email: text('email'),
  specialties: jsonb('specialties'),
  hourlyRateEur: integer('hourly_rate_eur'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow()
});



