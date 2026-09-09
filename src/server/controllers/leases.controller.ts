import { Request, Response } from 'express';
import { db } from '../../db/index';
import { leases as leasesTable } from '../../db/schema';
import { stores } from '../db/memoryStore';

export const getLeases = async (req: Request, res: Response) => {
  try {
    const allLeases = await db.select().from(leasesTable);
    if (allLeases && allLeases.length > 0) {
      const mapped = allLeases.map(l => ({
        ...l,
        esgClauseCompliant: l.esgClauseCompliant === 'true'
      }));
      return res.json(mapped);
    }
    res.json(stores.leasesStore);
  } catch(err: any) {
    res.json(stores.leasesStore);
  }
};

export const createLease = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newLease = {
      id: data.id || `lse-${Math.floor(Math.random() * 1000 + 100)}`,
      tenantName: data.tenantName || 'New Enterprise Tenant',
      tenantIndustry: data.tenantIndustry || 'Technology & Innovation',
      contactPerson: data.contactPerson || 'Account Director',
      contactEmail: data.contactEmail || 'contact@tenant.corp',
      buildingName: data.buildingName || 'Spider Cybernetics Tower A',
      unitCode: data.unitCode || 'Suite 100',
      areaSqM: Number(data.areaSqM) || 500,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      monthlyRentUsd: Number(data.monthlyRentUsd) || 25000,
      depositUsd: Number(data.depositUsd) || 75000,
      status: data.status || 'active',
      esgClauseCompliant: data.esgClauseCompliant ? 'true' : 'false',
      paymentStatus: data.paymentStatus || 'paid'
    };
    
    try {
      await db.insert(leasesTable).values(newLease as any);
    } catch (dbErr: any) {
      console.warn('Neon DB insert fallback for lease:', dbErr.message);
    }

    stores.leasesStore.unshift({
      ...newLease,
      esgClauseCompliant: newLease.esgClauseCompliant === 'true'
    } as any);

    res.status(201).json({
      ...newLease,
      esgClauseCompliant: newLease.esgClauseCompliant === 'true'
    });
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};
