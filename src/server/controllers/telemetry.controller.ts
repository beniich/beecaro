import { Request, Response } from 'express';
import { db } from '../../db/index';
import { telemetryNodes as telemetryNodesTable } from '../../db/schema';
import { stores } from '../db/memoryStore';

export const getTelemetry = async (req: Request, res: Response) => {
  try {
    const allNodes = await db.select().from(telemetryNodesTable);
    if (allNodes && allNodes.length > 0) {
      return res.json(allNodes);
    }
    res.json(stores.telemetryStore);
  } catch(err: any) {
    res.json(stores.telemetryStore);
  }
};
