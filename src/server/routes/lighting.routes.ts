import { Router } from 'express';
import { db } from '../../db/index';
import { lightingZones as lightingZonesTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { lightingZonesStore, setLightingZonesStore } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const lightingRouter = Router();

lightingRouter.use(auditMiddleware('LIGHTING_ZONE'));

// GET all lighting zones
lightingRouter.get('/zones', async (req, res) => {
  try {
    const allZones = await db.select().from(lightingZonesTable);
    if (allZones && allZones.length > 0) {
      return res.json(allZones);
    }
    res.json(lightingZonesStore);
  } catch (err: any) {
    res.json(lightingZonesStore);
  }
});

// UPDATE lighting zone
lightingRouter.put('/zones/:id', async (req, res) => {
  const { id } = req.params;
  const { brightness, colorTemp, circadianMode, powerStatus, status, consumptionKw } = req.body;
  try {
    if (process.env.MY_NEON_DB_URL) {
      await db
        .update(lightingZonesTable)
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

    const idx = lightingZonesStore.findIndex((lz) => lz.id === id);
    if (idx !== -1) {
      lightingZonesStore[idx] = {
        ...lightingZonesStore[idx],
        ...(brightness !== undefined && { brightness }),
        ...(colorTemp !== undefined && { colorTemp }),
        ...(circadianMode !== undefined && { circadianMode }),
        ...(powerStatus !== undefined && { powerStatus }),
        ...(status !== undefined && { status }),
        ...(consumptionKw !== undefined && { consumptionKw }),
      };
      setLightingZonesStore(lightingZonesStore);
      return res.json({ status: 'success', data: lightingZonesStore[idx] });
    }
    res.status(404).json({ status: 'error', message: 'Zone not found' });
  } catch (err: any) {
    const idx = lightingZonesStore.findIndex((lz) => lz.id === id);
    if (idx !== -1) {
      lightingZonesStore[idx] = {
        ...lightingZonesStore[idx],
        ...(brightness !== undefined && { brightness }),
        ...(colorTemp !== undefined && { colorTemp }),
        ...(circadianMode !== undefined && { circadianMode }),
        ...(powerStatus !== undefined && { powerStatus }),
        ...(status !== undefined && { status }),
        ...(consumptionKw !== undefined && { consumptionKw }),
      };
      setLightingZonesStore(lightingZonesStore);
      return res.json({ status: 'success', data: lightingZonesStore[idx] });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
});
