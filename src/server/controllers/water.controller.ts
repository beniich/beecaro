import { Request, Response } from 'express';
import { db } from '../../db/index';
import { waterSectors as waterSectorsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { stores } from '../db/memoryStore';

export const getWaterSectors = async (req: Request, res: Response) => {
  try {
    const allSectors = await db.select().from(waterSectorsTable);
    if (allSectors && allSectors.length > 0) {
      return res.json(allSectors);
    }
    res.json(stores.waterSectorsStore);
  } catch (err: any) {
    res.json(stores.waterSectorsStore);
  }
};

export const updateWaterSector = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status, pressure, flow, temp, valveOpen, leakMitigated } = req.body;
  try {
    if (process.env.MY_NEON_DB_URL) {
      await db.update(waterSectorsTable)
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
    const idx = stores.waterSectorsStore.findIndex((ws: any) => ws.id === id);
    if (idx !== -1) {
      stores.waterSectorsStore[idx] = {
        ...stores.waterSectorsStore[idx],
        ...(status !== undefined && { status }),
        ...(pressure !== undefined && { pressure }),
        ...(flow !== undefined && { flow }),
        ...(temp !== undefined && { temp }),
        ...(valveOpen !== undefined && { valveOpen }),
        ...(leakMitigated !== undefined && { leakMitigated }),
      };
      return res.json({ status: 'success', data: stores.waterSectorsStore[idx] });
    }
    res.status(404).json({ status: 'error', message: 'Sector not found' });
  } catch (err: any) {
    const idx = stores.waterSectorsStore.findIndex((ws: any) => ws.id === id);
    if (idx !== -1) {
      stores.waterSectorsStore[idx] = {
        ...stores.waterSectorsStore[idx],
        ...(status !== undefined && { status }),
        ...(pressure !== undefined && { pressure }),
        ...(flow !== undefined && { flow }),
        ...(temp !== undefined && { temp }),
        ...(valveOpen !== undefined && { valveOpen }),
        ...(leakMitigated !== undefined && { leakMitigated }),
      };
      return res.json({ status: 'success', data: stores.waterSectorsStore[idx] });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};
