import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const dbConnectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.NEON_DATABASE_URL || 
  process.env.MY_NEON_DB_URL || 
  process.env.DATABASE_URL_UNPOOLED;

export const pool = new Pool({
  connectionString: dbConnectionString || 'postgresql://localhost:5432/fallback',
  ssl: dbConnectionString && !dbConnectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.warn('[Neon Pool Background Notice]:', err.message);
});
