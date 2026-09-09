import { Request, Response } from 'express';
import { db, isDbConfigured } from '../../db/index';
import { workOrders as workOrdersTable } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { stores } from '../db/memoryStore';

export const getWorkOrders = async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    return res.json(stores.workordersStore);
  }
  try {
    const allWos = await db.select().from(workOrdersTable);
    if (allWos && allWos.length > 0) {
      return res.json(allWos);
    }
    res.json(stores.workordersStore);
  } catch(err: any) {
    console.warn('Neon DB query fallback for workorders:', err.message);
    res.json(stores.workordersStore);
  }
};

export const getWorkOrderById = async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    const memWo = stores.workordersStore.find((w: any) => w.id === req.params.id || w.ticketNumber === req.params.id);
    if (memWo) return res.json(memWo);
    return res.status(404).json({ error: 'Work order not found' });
  }
  try {
    const id = req.params.id as string;
    const rows = await db.select().from(workOrdersTable).where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
    if (rows && rows.length > 0) {
      return res.json(rows[0]);
    }
    const memWo = stores.workordersStore.find((w: any) => w.id === id || w.ticketNumber === id);
    if (memWo) return res.json(memWo);
    return res.status(404).json({ error: 'Work order not found' });
  } catch(err: any) {
    const memWo = stores.workordersStore.find((w: any) => w.id === req.params.id || w.ticketNumber === req.params.id);
    if (memWo) return res.json(memWo);
    res.status(500).json({ error: err.message });
  }
};

export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newWo = {
      id: data.id || `wo-${Math.floor(Math.random() * 1000 + 100)}`,
      ticketNumber: data.ticketNumber || `WO-2026-0${Math.floor(850 + Math.random() * 100)}`,
      title: data.title || 'Standard maintenance work order',
      description: data.description || '',
      assetId: data.assetId || 'ast-01',
      assetName: data.assetName || 'Main Centrifugal Chiller Alpha #1',
      buildingId: data.buildingId || 'bld-01',
      buildingName: data.buildingName || 'Spider Cybernetics Tower A',
      buildingAddress: data.buildingAddress || '',
      buildingCity: data.buildingCity || '',
      buildingContact: data.buildingContact || '',
      buildingPhone: data.buildingPhone || '',
      floor: data.floor || 'Floor 1',
      priority: data.priority || 'medium',
      status: data.status || 'open',
      category: data.category || 'preventive',
      assignedTechnician: data.assignedTechnician || {
        name: 'Alexandre Mercer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Senior Mobility Systems Specialist'
      },
      createdAt: data.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
      slaDeadline: data.slaDeadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
      estimatedHours: data.estimatedHours || 3.5,
      actualHours: data.actualHours || null,
      partsUsed: data.partsUsed || [],
      procedureSteps: data.procedureSteps || [],
      auditLog: data.auditLog || [],
      rootCause: data.rootCause || '',
      resolutionNotes: data.resolutionNotes || ''
    };

    if (isDbConfigured()) {
      try {
        await db.insert(workOrdersTable).values(newWo as any);
      } catch (dbErr: any) {
        console.warn('Neon DB insert fallback to memory:', dbErr.message);
      }
    }

    stores.workordersStore.unshift(newWo as any);
    res.status(201).json(newWo);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWorkOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    let existing: any = null;
    
    if (isDbConfigured()) {
      try {
        const rows = await db.select().from(workOrdersTable).where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
        if (rows && rows.length > 0) existing = rows[0];
      } catch (e: any) {
        console.warn('Neon DB select for PUT fallback to memory:', e.message);
      }
    }

    const memIdx = stores.workordersStore.findIndex((w: any) => w.id === id || w.ticketNumber === id);
    if (!existing && memIdx === -1) {
      const createdNew = { id, ticketNumber: id, ...req.body };
      stores.workordersStore.push(createdNew as any);
      return res.json(createdNew);
    }

    const base = existing || (memIdx !== -1 ? stores.workordersStore[memIdx] : {});
    const updated = { 
      ...base, 
      ...req.body,
      id: base.id || id,
      ticketNumber: base.ticketNumber || req.body.ticketNumber || id
    };

    if (existing && isDbConfigured()) {
      try {
        await db.update(workOrdersTable).set(updated as any).where(eq(workOrdersTable.id, existing.id));
      } catch (dbUpdateErr: any) {
        console.warn('Neon DB update fallback note:', dbUpdateErr.message);
      }
    }

    if (memIdx !== -1) {
      stores.workordersStore[memIdx] = updated as any;
    } else {
      stores.workordersStore.unshift(updated as any);
    }

    res.json(updated);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWorkOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    let existing: any = null;

    if (isDbConfigured()) {
      try {
        const rows = await db.select().from(workOrdersTable).where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
        if (rows && rows.length > 0) existing = rows[0];
      } catch (e: any) {
        console.warn('Neon DB select for status fallback to memory:', e.message);
      }
    }

    const memIdx = stores.workordersStore.findIndex((w: any) => w.id === id || w.ticketNumber === id);
    const base = existing || (memIdx !== -1 ? stores.workordersStore[memIdx] : {});
    const updated = { ...base, status: status || 'completed' };

    if (existing && isDbConfigured()) {
      try {
        await db.update(workOrdersTable).set(updated as any).where(eq(workOrdersTable.id, existing.id));
      } catch (dbUpdateErr: any) {
        console.warn('Neon DB status update fallback note:', dbUpdateErr.message);
      }
    }

    if (memIdx !== -1) {
      stores.workordersStore[memIdx] = updated as any;
    }

    res.json(updated);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteWorkOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (isDbConfigured()) {
      try {
        await db.delete(workOrdersTable).where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
      } catch (e: any) {
        console.warn('Neon DB delete workorder fallback:', e.message);
      }
    }
    const idx = stores.workordersStore.findIndex((w: any) => w.id === id || w.ticketNumber === id);
    if (idx !== -1) {
      stores.workordersStore.splice(idx, 1);
    }
    res.json({ success: true, message: `Work order ${id} deleted` });
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
};
