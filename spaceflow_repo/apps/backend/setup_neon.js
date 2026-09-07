require('dotenv').config();
const { Client } = require('pg');

async function enablePostgis() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to Neon DB.");
    
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log("PostGIS extension enabled.");
    
    // Also enable pgvector for H3 (AI RAG)
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log("pgvector extension enabled.");
    
  } catch (error) {
    console.error("Error enabling extensions:", error);
  } finally {
    await client.end();
  }
}

enablePostgis();
