import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.MY_NEON_DB_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
  },
});
