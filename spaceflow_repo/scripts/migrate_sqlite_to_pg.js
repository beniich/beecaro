const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');

/**
 * Migration Script: SQLite to PostgreSQL
 * 
 * PRE-REQUISITES:
 * 1. Install sqlite3: `cd backend && npm install sqlite3`
 * 2. Ensure your `backend/prisma/schema.prisma` is configured for PostgreSQL 
 *    (`provider = "postgresql"`) and `npx prisma generate` has been run.
 * 3. Make sure your PostgreSQL database is running and `DATABASE_URL` is set.
 * 4. Run `npx prisma db push` to create the tables in PostgreSQL.
 * 
 * EXECUTION:
 * `cd backend && node ../scripts/migrate_sqlite_to_pg.js`
 */

async function migrate() {
  // Point to the SQLite file
  const dbPath = './prisma/dev.db';
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ SQLite database not found at ${dbPath}`);
    process.exit(1);
  }

  const db = new sqlite3.Database(dbPath);
  const prisma = new PrismaClient();

  const query = (sql) => new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Helper to convert SQLite timestamp/string to Date object
  const toDate = (val) => val ? new Date(val) : null;

  try {
    console.log('🚀 Starting migration from SQLite to PostgreSQL...');

    // 1. Users
    console.log('Migrating Users...');
    const users = await query('SELECT * FROM "User"');
    for (const user of users) {
      // Convert dates
      if (user.createdAt) user.createdAt = toDate(user.createdAt);
      if (user.updatedAt) user.updatedAt = toDate(user.updatedAt);
      
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: user,
      });
    }

    // 2. Buildings
    console.log('Migrating Buildings...');
    const buildings = await query('SELECT * FROM "Building"');
    for (const building of buildings) {
      if (building.createdAt) building.createdAt = toDate(building.createdAt);
      if (building.updatedAt) building.updatedAt = toDate(building.updatedAt);

      await prisma.building.upsert({
        where: { id: building.id },
        update: {},
        create: building,
      });
    }

    // 3. Spaces
    console.log('Migrating Spaces...');
    const spaces = await query('SELECT * FROM "Space"');
    for (const space of spaces) {
      if (space.createdAt) space.createdAt = toDate(space.createdAt);
      if (space.updatedAt) space.updatedAt = toDate(space.updatedAt);

      await prisma.space.upsert({
        where: { id: space.id },
        update: {},
        create: space,
      });
    }

    // 4. Assets
    console.log('Migrating Assets...');
    const assets = await query('SELECT * FROM "Asset"');
    for (const asset of assets) {
      if (asset.purchaseDate) asset.purchaseDate = toDate(asset.purchaseDate);
      if (asset.warrantyEnd) asset.warrantyEnd = toDate(asset.warrantyEnd);
      if (asset.lastMaintenance) asset.lastMaintenance = toDate(asset.lastMaintenance);
      if (asset.nextMaintenance) asset.nextMaintenance = toDate(asset.nextMaintenance);
      if (asset.createdAt) asset.createdAt = toDate(asset.createdAt);
      if (asset.updatedAt) asset.updatedAt = toDate(asset.updatedAt);

      await prisma.asset.upsert({
        where: { id: asset.id },
        update: {},
        create: asset,
      });
    }

    // 5. WorkOrders
    console.log('Migrating WorkOrders...');
    const workOrders = await query('SELECT * FROM "WorkOrder"');
    for (const wo of workOrders) {
      if (wo.scheduledDate) wo.scheduledDate = toDate(wo.scheduledDate);
      if (wo.completedDate) wo.completedDate = toDate(wo.completedDate);
      if (wo.createdAt) wo.createdAt = toDate(wo.createdAt);
      if (wo.updatedAt) wo.updatedAt = toDate(wo.updatedAt);

      await prisma.workOrder.upsert({
        where: { id: wo.id },
        update: {},
        create: wo,
      });
    }

    // 6. MaintenanceLogs
    console.log('Migrating MaintenanceLogs...');
    const logs = await query('SELECT * FROM "MaintenanceLog"');
    for (const log of logs) {
      if (log.date) log.date = toDate(log.date);
      if (log.createdAt) log.createdAt = toDate(log.createdAt);
      if (log.updatedAt) log.updatedAt = toDate(log.updatedAt);

      await prisma.maintenanceLog.upsert({
        where: { id: log.id },
        update: {},
        create: log,
      });
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
    await prisma.$disconnect();
  }
}

migrate();
