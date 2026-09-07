import { Router, Request, Response } from 'express';
import { db } from '../../db/index';
import { buildings as buildingsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { buildingsStore, setBuildingsStore } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const buildingsRouter = Router();

buildingsRouter.use(auditMiddleware('BUILDING'));

// Handlers
const getBuildingsHandler = async (req: Request, res: Response) => {
  try {
    const allBuildings = await db.select().from(buildingsTable);
    if (allBuildings && allBuildings.length > 0) {
      return res.json(allBuildings);
    }
    res.json(buildingsStore);
  } catch (err: any) {
    res.json(buildingsStore);
  }
};

const getBuildingByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [found] = await db.select().from(buildingsTable).where(eq(buildingsTable.id, id));
    if (found) return res.json(found);
    const mem = buildingsStore.find((b) => b.id === id || b.code === id);
    if (mem) return res.json(mem);
    res.status(404).json({ error: 'Building/Site not found' });
  } catch (err: any) {
    const mem = buildingsStore.find((b) => b.id === id || b.code === id);
    if (mem) return res.json(mem);
    res.status(500).json({ error: err.message });
  }
};

const createBuildingHandler = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newBuilding = {
      id: data.id || `bld-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Nouveau Bâtiment / Site',
      code: data.code || `STE-${Math.floor(100 + Math.random() * 900)}`,
      floors: Number(data.floors) || 5,
      areaSqM: Number(data.areaSqM) || 4500,
      occupancyRate: Number(data.occupancyRate) || 85,
      energyRating: data.energyRating || 'A',
      carbonIntensity: Number(data.carbonIntensity) || 12.0,
      healthScore: Number(data.healthScore) || 92,
      address: data.address || '',
      city: data.city || 'Paris',
      postalCode: data.postalCode || '75001',
      country: data.country || 'France',
      contactPerson: data.contactPerson || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      accessInstructions: data.accessInstructions || '',
      status: data.status || 'optimal',
    };

    try {
      await db.insert(buildingsTable).values(newBuilding as any);
    } catch (dbErr: any) {
      console.warn('Neon DB insert building fallback to memory:', dbErr.message);
    }

    buildingsStore.unshift(newBuilding);
    setBuildingsStore(buildingsStore);
    res.status(201).json(newBuilding);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const updateBuildingHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let existing: any = null;

    try {
      const rows = await db.select().from(buildingsTable).where(eq(buildingsTable.id, id));
      if (rows && rows.length > 0) existing = rows[0];
    } catch (e: any) {
      console.warn('Neon DB select for building PUT fallback to memory:', e.message);
    }

    const memIdx = buildingsStore.findIndex((b) => b.id === id || b.code === id);
    const base = existing || (memIdx !== -1 ? buildingsStore[memIdx] : {});
    const updated = {
      ...base,
      ...data,
      id: base.id || id,
    };

    if (existing) {
      try {
        await db.update(buildingsTable).set(updated as any).where(eq(buildingsTable.id, existing.id));
      } catch (dbUpdateErr: any) {
        console.warn('Neon DB building update fallback note:', dbUpdateErr.message);
      }
    }

    if (memIdx !== -1) {
      buildingsStore[memIdx] = updated;
    } else {
      buildingsStore.unshift(updated);
    }
    setBuildingsStore(buildingsStore);

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBuildingHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    try {
      await db.delete(buildingsTable).where(eq(buildingsTable.id, id));
    } catch (e: any) {
      console.warn('Neon DB delete building fallback:', e.message);
    }
    setBuildingsStore(buildingsStore.filter((b) => b.id !== id && b.code !== id));
    res.json({ success: true, message: `Building ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

buildingsRouter.get('/', getBuildingsHandler);
buildingsRouter.get('/:id', getBuildingByIdHandler);
buildingsRouter.post('/', createBuildingHandler);
buildingsRouter.put('/:id', updateBuildingHandler);
buildingsRouter.delete('/:id', deleteBuildingHandler);
