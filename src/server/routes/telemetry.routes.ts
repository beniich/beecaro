import { Router } from 'express';
import { db } from '../../db/index';
import { telemetryNodes as telemetryNodesTable } from '../../db/schema';
import { telemetryStore } from '../stores';

export const telemetryRouter = Router();

telemetryRouter.get('/', async (req, res) => {
  try {
    const allNodes = await db.select().from(telemetryNodesTable);
    if (allNodes && allNodes.length > 0) {
      return res.json(allNodes);
    }
    res.json(telemetryStore);
  } catch (err: any) {
    res.json(telemetryStore);
  }
});
