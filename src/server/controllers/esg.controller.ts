import { Request, Response } from 'express';
import { db } from '../../db/index';
import { esgMetricsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { mockEsgMetrics } from '../../data/mockData';

export const getEsg = async (req: Request, res: Response) => {
  try {
    const [esg] = await db.select().from(esgMetricsTable);
    if (esg) {
      res.json(esg);
    } else {
      res.json(mockEsgMetrics);
    }
  } catch(err: any) {
    res.json(mockEsgMetrics);
  }
};

export const updateEsg = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const [existing] = await db.select().from(esgMetricsTable);
    if (existing) {
      await db.update(esgMetricsTable).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(esgMetricsTable.id, existing.id));
      res.json({ ...existing, ...data });
    } else {
      const newRecord = {
        id: 'esg-main-2026',
        ...data,
        updatedAt: new Date()
      };
      try {
        await db.insert(esgMetricsTable).values(newRecord as any);
      } catch (e: any) {
        console.warn('ESG insert note:', e.message);
      }
      res.json(newRecord);
    }
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};
