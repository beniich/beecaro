import { db } from './src/db/index';
import { leases, esgMetricsTable, spaces } from './src/db/schema';
import { mockLeases, mockEsgMetrics } from './src/data/mockData';

const mockFloorOccupancy = [
  { id: 'sp-01', floor: 'RDC / Lobby', desksTotal: 40, occupied: 32, occupancyRate: 80, tempC: 21.5, department: 'Reception' },
  { id: 'sp-02', floor: 'Level 1', desksTotal: 120, occupied: 102, occupancyRate: 85, tempC: 22.0, department: 'Sales & Mktg' },
  { id: 'sp-03', floor: 'Level 2', desksTotal: 120, occupied: 114, occupancyRate: 95, tempC: 22.8, department: 'Engineering' },
  { id: 'sp-04', floor: 'Level 3', desksTotal: 120, occupied: 84, occupancyRate: 70, tempC: 21.8, department: 'Operations' },
  { id: 'sp-05', floor: 'Level 4 (Lab)', desksTotal: 80, occupied: 48, occupancyRate: 60, tempC: 20.5, department: 'R&D' },
  { id: 'sp-06', floor: 'Level 5 (Exec)', desksTotal: 50, occupied: 35, occupancyRate: 70, tempC: 21.0, department: 'C-Suite' },
];

async function seed() {
  const existingLeases = await db.select().from(leases);
  if (existingLeases.length === 0) {
    console.log('Seeding leases...');
    const formattedLeases = mockLeases.map(l => ({
      ...l,
      esgClauseCompliant: l.esgClauseCompliant ? 'true' : 'false'
    }));
    await db.insert(leases).values(formattedLeases as any);
  }

  const existingEsg = await db.select().from(esgMetricsTable);
  if (existingEsg.length === 0) {
    console.log('Seeding ESG metrics...');
    await db.insert(esgMetricsTable).values({
      id: 'esg-main-2026',
      ...mockEsgMetrics
    } as any);
  }

  const existingSpaces = await db.select().from(spaces);
  if (existingSpaces.length === 0) {
    console.log('Seeding spaces...');
    await db.insert(spaces).values(mockFloorOccupancy as any);
  }

  console.log('Seeding complete for leases, ESG, and spaces.');
}

seed().catch(console.error);
