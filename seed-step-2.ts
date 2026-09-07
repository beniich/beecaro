import { db } from './src/db/index';
import { buildings, telemetryNodes } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { mockBuildings, mockTelemetryNodes } from './src/data/mockData';

async function seed() {
  const existingBuildings = await db.select().from(buildings);
  if (existingBuildings.length === 0) {
    console.log('Seeding buildings...');
    await db.insert(buildings).values(mockBuildings as any);
  } else {
    console.log('Buildings already seeded.');
  }

  const existingNodes = await db.select().from(telemetryNodes);
  if (existingNodes.length === 0) {
    console.log('Seeding telemetry nodes...');
    await db.insert(telemetryNodes).values(mockTelemetryNodes as any);
  } else {
    console.log('Telemetry nodes already seeded.');
  }
  
  console.log('Seeding complete.');
}

seed().catch(console.error);
