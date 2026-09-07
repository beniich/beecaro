const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// 1. Add DB imports
server = server.replace(
  "import * as dotenv from 'dotenv';",
  "import * as dotenv from 'dotenv';\nimport { db } from './src/db/index';\nimport { assets as assetsTable, workOrders as workOrdersTable } from './src/db/schema';\nimport { eq } from 'drizzle-orm';"
);

// 2. Remove in-memory arrays and setInterval. We'll find them and replace with empty string or comment out.
// Since the arrays are large, I'll just use Regex or replace them with empty arrays.

server = server.replace(/const assets: Asset\[\] = \[[\s\S]*?\];/m, 'const assets: Asset[] = [];');
server = server.replace(/const workorders: WorkOrder\[\] = \[[\s\S]*?\];/m, 'const workorders: WorkOrder[] = [];');
server = server.replace(/setInterval\(\(\) => \{[\s\S]*?\}, 3000\);/m, '// setInterval removed');

// 3. Update endpoints
server = server.replace(
  /app\.get\('\/api\/assets', \(req, res\) => \{[\s\S]*?\}\);/m,
  `app.get('/api/assets', async (req, res) => {
    try {
      const allAssets = await db.select().from(assetsTable);
      res.json(allAssets);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });`
);

server = server.replace(
  /app\.get\('\/api\/assets\/stats', \(req, res\) => \{[\s\S]*?\}\);/m,
  `app.get('/api/assets/stats', async (req, res) => {
    try {
      const allAssets = await db.select().from(assetsTable);
      const totalCount = allAssets.length;
      const criticalCount = allAssets.filter(a => a.status === 'broken' || (a.healthScore !== null && a.healthScore < 75)).length;
      const maintenanceCount = allAssets.filter(a => a.status === 'maintenance' || a.status === 'degraded').length;
      const greenCount = allAssets.filter(a => a.status === 'operational' && (a.healthScore !== null && a.healthScore >= 90)).length;
      const healthSum = allAssets.reduce((sum, a) => sum + (a.healthScore || 0), 0);

      res.json({
        total: totalCount,
        critical: criticalCount,
        maintenance: maintenanceCount,
        operational: greenCount,
        averageHealth: totalCount > 0 ? +(healthSum / totalCount).toFixed(1) : 0
      });
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });`
);

server = server.replace(
  /app\.get\('\/api\/assets\/:id', \(req, res\) => \{[\s\S]*?\}\);/m,
  `app.get('/api/assets/:id', async (req, res) => {
    try {
      const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, req.params.id));
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      res.json(asset);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });`
);

server = server.replace(
  /app\.post\('\/api\/assets', \(req, res\) => \{[\s\S]*?\}\);/m,
  `app.post('/api/assets', async (req, res) => {
    try {
      const newAssetData = req.body;
      const newAsset = {
        id: \`ast-\${Math.floor(Math.random() * 1000 + 100)}\`,
        name: newAssetData.name || 'New Asset',
        code: newAssetData.code || 'AST-NEW',
        category: newAssetData.category || 'HVAC',
        buildingId: newAssetData.buildingId || 'bld-01',
        buildingName: newAssetData.buildingName || 'Spider Cybernetics Tower A',
        floor: newAssetData.floor || 'Fl.1',
        zone: newAssetData.zone || 'Zone West',
        status: newAssetData.status || 'operational',
        healthScore: newAssetData.healthScore || 100,
        lastInspected: new Date().toISOString().split('T')[0],
        nextService: newAssetData.nextService || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        installDate: new Date().toISOString().split('T')[0],
        manufacturer: newAssetData.manufacturer || 'General Electric',
        model: newAssetData.model || 'V-900',
        serialNumber: newAssetData.serialNumber || \`SN-\${Math.random().toString(36).substring(3, 9).toUpperCase()}\`,
        powerConsumptionKw: newAssetData.powerConsumptionKw || 12.5,
        telemetry: newAssetData.telemetry || {
          tempC: 20,
          vibrationMmS: 1.0,
          pressureBar: 2,
          runtimeHours: 0,
          efficiencyRatio: 100
        },
        qrCodeUrl: \`https://beecarbonat.internal/qr/ast-\${Math.floor(Math.random() * 1000)}\`
      };
      
      await db.insert(assetsTable).values(newAsset as any);
      res.status(201).json(newAsset);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });`
);

server = server.replace(
  /app\.get\('\/api\/workorders', \(req, res\) => \{[\s\S]*?\}\);/m,
  `app.get('/api/workorders', async (req, res) => {
    try {
      const allWos = await db.select().from(workOrdersTable);
      res.json(allWos);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });`
);

server = server.replace(
  /app\.post\('\/api\/workorders', \(req, res\) => \{[\s\S]*?\}\);/m,
  `app.post('/api/workorders', async (req, res) => {
    try {
      const data = req.body;
      const newWo = {
        id: data.id || \`wo-\${Math.floor(Math.random() * 1000 + 100)}\`,
        ticketNumber: data.ticketNumber || \`WO-2026-0\${Math.floor(850 + Math.random() * 100)}\`,
        title: data.title || 'Standard maintenance work order',
        description: data.description || '',
        assetId: data.assetId || 'ast-01',
        assetName: data.assetName || 'Main Centrifugal Chiller Alpha #1',
        buildingId: data.buildingId || 'bld-01',
        buildingName: data.buildingName || 'Spider Cybernetics Tower A',
        floor: data.floor || 'Floor 1',
        priority: data.priority || 'medium',
        status: data.status || 'open',
        category: data.category || 'preventive',
        assignedTechnician: data.assignedTechnician || {
          name: 'Alexandre Mercer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'Senior Mobility Systems Specialist'
        },
        createdAt: data.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
        slaDeadline: data.slaDeadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
        estimatedHours: data.estimatedHours || 3.5,
        actualHours: data.actualHours || null,
        partsUsed: data.partsUsed || []
      };
      await db.insert(workOrdersTable).values(newWo as any);
      res.status(201).json(newWo);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });`
);

server = server.replace(
  /app\.put\('\/api\/workorders\/:id', \(req, res\) => \{[\s\S]*?\}\);/m,
  `app.put('/api/workorders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [existing] = await db.select().from(workOrdersTable).where(eq(workOrdersTable.id, id));
      if (!existing) {
        return res.status(404).json({ error: 'Work order not found' });
      }
      
      const updated = { ...existing, ...req.body };
      await db.update(workOrdersTable).set(updated).where(eq(workOrdersTable.id, id));
      res.json(updated);
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });`
);

fs.writeFileSync('server.ts', server);
console.log('Server patched successfully!');
