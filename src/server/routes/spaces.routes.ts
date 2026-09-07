import { Router } from 'express';
import { db } from '../../db/index';
import { spaces as spacesTable } from '../../db/schema';

export const spacesRouter = Router();

const defaultSpaces = [
  { id: 'sp-1', floor: 'Floor 1', desksTotal: 120, occupied: 112, occupancyRate: 93, tempC: 21.8, department: 'Engineering' },
  { id: 'sp-2', floor: 'Floor 2', desksTotal: 100, occupied: 85, occupancyRate: 85, tempC: 22.1, department: 'Operations' },
  { id: 'sp-3', floor: 'Floor 3', desksTotal: 80, occupied: 76, occupancyRate: 95, tempC: 21.5, department: 'Executive' }
];

spacesRouter.get('/', async (req, res) => {
  try {
    const allSpaces = await db.select().from(spacesTable);
    if (allSpaces && allSpaces.length > 0) {
      return res.json(allSpaces);
    }
    res.json(defaultSpaces);
  } catch (err: any) {
    res.json(defaultSpaces);
  }
});
