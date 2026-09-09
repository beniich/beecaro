import { Request, Response } from 'express';
import { db } from '../../db/index';
import { lightingZones as lightingZonesTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { stores } from '../db/memoryStore';

export const getLightingZones = async (req: Request, res: Response) => {
  try {
    const allZones = await db.select().from(lightingZonesTable);
    if (allZones && allZones.length > 0) {
      return res.json(allZones);
    }
    res.json(stores.lightingZonesStore);
  } catch (err: any) {
    res.json(stores.lightingZonesStore);
  }
};

export const updateLightingZone = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { brightness, colorTemp, circadianMode, powerStatus, status, consumptionKw } = req.body;
  try {
    if (process.env.MY_NEON_DB_URL) {
      await db.update(lightingZonesTable)
        .set({
          ...(brightness !== undefined && { brightness }),
          ...(colorTemp !== undefined && { colorTemp }),
          ...(circadianMode !== undefined && { circadianMode }),
          ...(powerStatus !== undefined && { powerStatus }),
          ...(status !== undefined && { status }),
          ...(consumptionKw !== undefined && { consumptionKw }),
        })
        .where(eq(lightingZonesTable.id, id));
    }
    
    const idx = stores.lightingZonesStore.findIndex((lz: any) => lz.id === id);
    if (idx !== -1) {
      stores.lightingZonesStore[idx] = {
        ...stores.lightingZonesStore[idx],
        ...(brightness !== undefined && { brightness }),
        ...(colorTemp !== undefined && { colorTemp }),
        ...(circadianMode !== undefined && { circadianMode }),
        ...(powerStatus !== undefined && { powerStatus }),
        ...(status !== undefined && { status }),
        ...(consumptionKw !== undefined && { consumptionKw }),
      };
      return res.json({ status: 'success', data: stores.lightingZonesStore[idx] });
    }
    res.status(404).json({ status: 'error', message: 'Zone not found' });
  } catch (err: any) {
    const idx = stores.lightingZonesStore.findIndex((lz: any) => lz.id === id);
    if (idx !== -1) {
      stores.lightingZonesStore[idx] = {
        ...stores.lightingZonesStore[idx],
        ...(brightness !== undefined && { brightness }),
        ...(colorTemp !== undefined && { colorTemp }),
        ...(circadianMode !== undefined && { circadianMode }),
        ...(powerStatus !== undefined && { powerStatus }),
        ...(status !== undefined && { status }),
        ...(consumptionKw !== undefined && { consumptionKw }),
      };
      return res.json({ status: 'success', data: stores.lightingZonesStore[idx] });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};
