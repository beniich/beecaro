const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// 1. Update imports
server = server.replace(
  "import { assets as assetsTable, workOrders as workOrdersTable } from './src/db/schema';",
  "import { assets as assetsTable, workOrders as workOrdersTable, buildings as buildingsTable, telemetryNodes as telemetryNodesTable } from './src/db/schema';"
);

// 2. Add endpoints
const newEndpoints = `
  // ── Buildings Endpoints ──────────────────────────────────────────
  app.get('/api/buildings', async (req, res) => {
    try {
      const allBuildings = await db.select().from(buildingsTable);
      res.json(allBuildings);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Telemetry Endpoints ──────────────────────────────────────────
  app.get('/api/telemetry', async (req, res) => {
    try {
      const allNodes = await db.select().from(telemetryNodesTable);
      res.json(allNodes);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

// Insert the new endpoints just before the Assets endpoints
server = server.replace(
  "  // ── Assets Endpoints ───────────────────────────────────────────",
  newEndpoints + "\n  // ── Assets Endpoints ───────────────────────────────────────────"
);

fs.writeFileSync('server.ts', server);
console.log('Server updated with buildings and telemetry routes.');
