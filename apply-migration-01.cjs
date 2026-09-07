const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

async function apply() {
  const client = new Client({
    connectionString: process.env.MY_NEON_DB_URL
  });
  await client.connect();
  const sql = fs.readFileSync('drizzle/0001_simple_fallen_one.sql', 'utf8');
  console.log('Applying migration...');
  try {
    await client.query(sql);
    console.log('Migration applied successfully!');
  } catch(e) {
    console.error('Migration failed:', e);
  } finally {
    await client.end();
  }
}
apply();
