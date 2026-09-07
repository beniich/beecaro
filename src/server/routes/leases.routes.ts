import { Router } from 'express';
import { db } from '../../db/index';
import { leases as leasesTable } from '../../db/schema';
import { leasesStore, setLeasesStore } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const leasesRouter = Router();

leasesRouter.use(auditMiddleware('LEASE'));

// GET all leases
leasesRouter.get('/', async (req, res) => {
  try {
    const allLeases = await db.select().from(leasesTable);
    if (allLeases && allLeases.length > 0) {
      const mapped = allLeases.map((l) => ({
        ...l,
        esgClauseCompliant: l.esgClauseCompliant === 'true' || (l.esgClauseCompliant as any) === true,
      }));
      return res.json(mapped);
    }
    res.json(leasesStore);
  } catch (err: any) {
    res.json(leasesStore);
  }
});

// CREATE lease
leasesRouter.post('/', async (req, res) => {
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
      paymentStatus: data.paymentStatus || 'paid',
    };

    try {
      await db.insert(leasesTable).values(newLease as any);
    } catch (dbErr: any) {
      console.warn('Neon DB insert fallback for lease:', dbErr.message);
    }

    leasesStore.unshift({
      ...newLease,
      esgClauseCompliant: newLease.esgClauseCompliant === 'true',
    } as any);
    setLeasesStore(leasesStore);

    res.status(201).json({
      ...newLease,
      esgClauseCompliant: newLease.esgClauseCompliant === 'true',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
