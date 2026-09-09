import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

const { Pool } = pkg;

const connectionString = 
  process.env.MY_NEON_DB_URL || 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: connectionString || 'postgresql://localhost:5432/fallback',
  ssl: connectionString && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 5000,
});

export const isDbConfigured = (): boolean => {
  if (!connectionString) return false;
  if (
    connectionString.includes('@host:') || 
    connectionString.includes('localhost:5432/fallback') || 
    connectionString.includes('neondb_owner:password') ||
    connectionString.includes('user:password@host')
  ) {
    return false;
  }
  return true;
};

pool.on('error', (err) => {
  console.warn('[PostgreSQL Pool Background Notice]:', err.message);
});

export const db = drizzle(pool, { schema });

