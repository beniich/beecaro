import { Router } from 'express';
import { db } from '../../db/index';
import { assets as assetsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { assetsStore, setAssetsStore } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const assetsRouter = Router();

// Apply audit middleware on mutations
assetsRouter.use(auditMiddleware('ASSET'));

// GET all assets
assetsRouter.get('/', async (req, res) => {
  try {
    const allAssets = await db.select().from(assetsTable);
    if (allAssets && allAssets.length > 0) {
      return res.json(allAssets);
    }
    res.json(assetsStore);
  } catch (err: any) {
    res.json(assetsStore);
  }
});

// GET asset statistics
assetsRouter.get('/stats', async (req, res) => {
  try {
    let allAssets: any[] = [];
    try {
      allAssets = await db.select().from(assetsTable);
    } catch {
      allAssets = assetsStore;
    }
    if (!allAssets || allAssets.length === 0) {
      allAssets = assetsStore;
    }
    const totalCount = allAssets.length;
    const criticalCount = allAssets.filter(
      (a) => a.status === 'broken' || a.status === 'critical' || (a.healthScore !== null && a.healthScore < 75)
    ).length;
    const maintenanceCount = allAssets.filter((a) => a.status === 'maintenance' || a.status === 'degraded').length;
    const greenCount = allAssets.filter((a) => a.status === 'operational' && a.healthScore !== null && a.healthScore >= 90).length;
    const healthSum = allAssets.reduce((sum, a) => sum + (a.healthScore || 0), 0);

    res.json({
      total: totalCount,
      critical: criticalCount,
      maintenance: maintenanceCount,
      operational: greenCount,
      averageHealth: totalCount > 0 ? +(healthSum / totalCount).toFixed(1) : 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single asset by ID
assetsRouter.get('/:id', async (req, res) => {
  try {
    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, req.params.id));
    if (asset) return res.json(asset);
    const memAsset = assetsStore.find((a) => a.id === req.params.id || a.code === req.params.id);
    if (memAsset) return res.json(memAsset);
    res.status(404).json({ error: 'Asset not found' });
  } catch (err: any) {
    const memAsset = assetsStore.find((a) => a.id === req.params.id || a.code === req.params.id);
    if (memAsset) return res.json(memAsset);
    res.status(500).json({ error: err.message });
  }
});

// CREATE asset
assetsRouter.post('/', async (req, res) => {
  try {
    const newAssetData = req.body;
    const newAsset = {
      id: newAssetData.id || `ast-${Math.floor(Math.random() * 1000 + 100)}`,
      name: newAssetData.name || 'New Asset',
      code: newAssetData.code || 'AST-NEW',
      category: newAssetData.category || 'HVAC',
      buildingId: newAssetData.buildingId || 'bld-01',
      buildingName: newAssetData.buildingName || 'Spider Cybernetics Tower A',
      floor: newAssetData.floor || 'Fl.1',
      zone: newAssetData.zone || 'Zone West',
      status: newAssetData.status || 'operational',
      healthScore: newAssetData.healthScore ?? 100,
      lastInspected: new Date().toISOString().split('T')[0],
      nextService:
        newAssetData.nextService ||
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      installDate: new Date().toISOString().split('T')[0],
      manufacturer: newAssetData.manufacturer || 'General Electric',
      model: newAssetData.model || 'V-900',
      serialNumber:
        newAssetData.serialNumber || `SN-${Math.random().toString(36).substring(3, 9).toUpperCase()}`,
      powerConsumptionKw: newAssetData.powerConsumptionKw || 12.5,
      telemetry: newAssetData.telemetry || {
        tempC: 20,
        vibrationMmS: 1.0,
        pressureBar: 2,
        runtimeHours: 0,
        efficiencyRatio: 100,
      },
      qrCodeUrl: `https://beecarbonat.internal/qr/ast-${Math.floor(Math.random() * 1000)}`,
    };

    try {
      await db.insert(assetsTable).values(newAsset as any);
    } catch (dbErr: any) {
      console.warn('Neon DB insert fallback to memory for asset:', dbErr.message);
    }

    assetsStore.unshift(newAsset as any);
    setAssetsStore(assetsStore);
    res.status(201).json(newAsset);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE asset
assetsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let existing: any = null;

    try {
      const rows = await db.select().from(assetsTable).where(eq(assetsTable.id, id));
      if (rows && rows.length > 0) existing = rows[0];
    } catch (e: any) {
      console.warn('Neon DB select for asset PUT fallback:', e.message);
    }

    const memIdx = assetsStore.findIndex((a) => a.id === id || a.code === id);
    const base = existing || (memIdx !== -1 ? assetsStore[memIdx] : {});
    const updated = { ...base, ...data, id: base.id || id };

    if (existing) {
      try {
        await db.update(assetsTable).set(updated as any).where(eq(assetsTable.id, existing.id));
      } catch (e: any) {
        console.warn('Neon DB update asset fallback note:', e.message);
      }
    }

    if (memIdx !== -1) {
      assetsStore[memIdx] = updated;
    } else {
      assetsStore.unshift(updated);
    }
    setAssetsStore(assetsStore);

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE asset
assetsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await db.delete(assetsTable).where(eq(assetsTable.id, id));
    } catch (e: any) {
      console.warn('Neon DB delete asset fallback:', e.message);
    }
    setAssetsStore(assetsStore.filter((a) => a.id !== id && a.code !== id));
    res.json({ success: true, message: `Asset ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
