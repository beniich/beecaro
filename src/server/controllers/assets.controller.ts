import { Request, Response } from 'express';
import { db } from '../../db/index';
import { assets as assetsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { stores } from '../db/memoryStore';

export const getAssets = async (req: Request, res: Response) => {
  try {
    const allAssets = await db.select().from(assetsTable);
    if (allAssets && allAssets.length > 0) {
      return res.json(allAssets);
    }
    res.json(stores.assetsStore);
  } catch(err: any) {
    res.json(stores.assetsStore);
  }
};

export const getAssetsStats = async (req: Request, res: Response) => {
  try {
    let allAssets: any[] = [];
    try {
      allAssets = await db.select().from(assetsTable);
    } catch {
      allAssets = stores.assetsStore;
    }
    if (!allAssets || allAssets.length === 0) {
      allAssets = stores.assetsStore;
    }
    const totalCount = allAssets.length;
    const criticalCount = allAssets.filter(a => a.status === 'broken' || a.status === 'critical' || (a.healthScore !== null && a.healthScore < 75)).length;
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
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, req.params.id as string));
    if (asset) return res.json(asset);
    const memAsset = stores.assetsStore.find((a: any) => a.id === req.params.id as string || a.code === req.params.id as string);
    if (memAsset) return res.json(memAsset);
    res.status(404).json({ error: 'Asset not found' });
  } catch(err: any) {
    const memAsset = stores.assetsStore.find((a: any) => a.id === req.params.id as string || a.code === req.params.id as string);
    if (memAsset) return res.json(memAsset);
    res.status(500).json({ error: err.message });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const newAssetData = req.body;
    const newAsset = {
      id: `ast-${Math.floor(Math.random() * 1000 + 100)}`,
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
      serialNumber: newAssetData.serialNumber || `SN-${Math.random().toString(36).substring(3, 9).toUpperCase()}`,
      powerConsumptionKw: newAssetData.powerConsumptionKw || 12.5,
      telemetry: newAssetData.telemetry || {
        tempC: 20,
        vibrationMmS: 1.0,
        pressureBar: 2,
        runtimeHours: 0,
        efficiencyRatio: 100
      },
      qrCodeUrl: `https://beecarbonat.internal/qr/ast-${Math.floor(Math.random() * 1000)}`
    };
    
    try {
      await db.insert(assetsTable).values(newAsset as any);
    } catch(dbErr) {
      console.warn('DB Insert failed, using memory store for asset creation', dbErr);
    }
    stores.assetsStore.unshift(newAsset as any);
    res.json(newAsset);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};
