import { Router } from 'express';
import { db } from '../../db/index';
import { waterSectors as waterSectorsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { waterSectorsStore, setWaterSectorsStore } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const waterRouter = Router();

waterRouter.use(auditMiddleware('WATER_SECTOR'));

// GET all water sectors
waterRouter.get('/sectors', async (req, res) => {
  try {
    const allSectors = await db.select().from(waterSectorsTable);
    if (allSectors && allSectors.length > 0) {
      return res.json(allSectors);
    }
    res.json(waterSectorsStore);
  } catch (err: any) {
    res.json(waterSectorsStore);
  }
});

// UPDATE water sector
waterRouter.put('/sectors/:id', async (req, res) => {
  const { id } = req.params;
  const { status, pressure, flow, temp, valveOpen, leakMitigated } = req.body;
  try {
    if (process.env.MY_NEON_DB_URL) {
      await db
        .update(waterSectorsTable)
        .set({
          ...(status !== undefined && { status }),
          ...(pressure !== undefined && { pressure }),
          ...(flow !== undefined && { flow }),
          ...(temp !== undefined && { temp }),
          ...(valveOpen !== undefined && { valveOpen }),
          ...(leakMitigated !== undefined && { leakMitigated }),
        })
        .where(eq(waterSectorsTable.id, id));
    }

    const idx = waterSectorsStore.findIndex((ws) => ws.id === id);
    if (idx !== -1) {
      waterSectorsStore[idx] = {
        ...waterSectorsStore[idx],
        ...(status !== undefined && { status }),
        ...(pressure !== undefined && { pressure }),
        ...(flow !== undefined && { flow }),
        ...(temp !== undefined && { temp }),
        ...(valveOpen !== undefined && { valveOpen }),
        ...(leakMitigated !== undefined && { leakMitigated }),
      };
      setWaterSectorsStore(waterSectorsStore);
      return res.json({ status: 'success', data: waterSectorsStore[idx] });
    }
    res.status(404).json({ status: 'error', message: 'Sector not found' });
  } catch (err: any) {
    const idx = waterSectorsStore.findIndex((ws) => ws.id === id);
    if (idx !== -1) {
      waterSectorsStore[idx] = {
        ...waterSectorsStore[idx],
        ...(status !== undefined && { status }),
        ...(pressure !== undefined && { pressure }),
        ...(flow !== undefined && { flow }),
        ...(temp !== undefined && { temp }),
        ...(valveOpen !== undefined && { valveOpen }),
        ...(leakMitigated !== undefined && { leakMitigated }),
      };
      setWaterSectorsStore(waterSectorsStore);
      return res.json({ status: 'success', data: waterSectorsStore[idx] });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
});
