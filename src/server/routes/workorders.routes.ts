import { Router } from 'express';
import { db } from '../../db/index';
import { workOrders as workOrdersTable } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { workordersStore, setWorkordersStore } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const workordersRouter = Router();

// Zod schema for work orders
const workOrderSchema = z.object({
  id: z.string().optional(),
  ticketNumber: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  buildingId: z.string().optional(),
  buildingName: z.string().optional(),
  buildingAddress: z.string().optional(),
  buildingCity: z.string().optional(),
  buildingContact: z.string().optional(),
  buildingPhone: z.string().optional(),
  floor: z.string().optional(),
  assetId: z.string().optional(),
  assetName: z.string().optional(),
  assignedTechnician: z.any().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().nullable().optional(),
}).passthrough();

// Intercept modifying requests with audit
workordersRouter.use(auditMiddleware('WORKORDER'));

// GET all work orders
workordersRouter.get('/', async (req, res) => {
  try {
    const allWos = await db.select().from(workOrdersTable);
    if (allWos && allWos.length > 0) {
      return res.json(allWos);
    }
    res.json(workordersStore);
  } catch (err: any) {
    console.warn('Neon DB query fallback for workorders:', err.message);
    res.json(workordersStore);
  }
});

// GET work order by ID or Ticket Number
workordersRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db
      .select()
      .from(workOrdersTable)
      .where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
    if (rows && rows.length > 0) {
      return res.json(rows[0]);
    }
    const memWo = workordersStore.find((w) => w.id === id || w.ticketNumber === id);
    if (memWo) return res.json(memWo);
    return res.status(404).json({ error: 'Work order not found' });
  } catch (err: any) {
    const memWo = workordersStore.find((w) => w.id === req.params.id || w.ticketNumber === req.params.id);
    if (memWo) return res.json(memWo);
    res.status(500).json({ error: err.message });
  }
});

// CREATE work order
workordersRouter.post('/', async (req, res) => {
  try {
    const validatedData = workOrderSchema.parse(req.body);
    const data = validatedData;
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
        role: 'Senior Mobility Systems Specialist',
      },
      createdAt: (data as any).createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
      slaDeadline:
        (data as any).slaDeadline ||
        new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
      estimatedHours: data.estimatedHours || 3.5,
      actualHours: data.actualHours || null,
      partsUsed: (data as any).partsUsed || [],
      procedureSteps: (data as any).procedureSteps || [],
      auditLog: (data as any).auditLog || [],
      rootCause: (data as any).rootCause || '',
      resolutionNotes: (data as any).resolutionNotes || '',
    };

    try {
      await db.insert(workOrdersTable).values(newWo as any);
    } catch (dbErr: any) {
      console.warn('Neon DB insert fallback to memory:', dbErr.message);
    }

    workordersStore.unshift(newWo as any);
    setWorkordersStore(workordersStore);
    res.status(201).json(newWo);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE work order
workordersRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let existing: any = null;

    try {
      const rows = await db
        .select()
        .from(workOrdersTable)
        .where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
      if (rows && rows.length > 0) existing = rows[0];
    } catch (e: any) {
      console.warn('Neon DB select for PUT fallback to memory:', e.message);
    }

    const memIdx = workordersStore.findIndex((w) => w.id === id || w.ticketNumber === id);
    if (!existing && memIdx === -1) {
      const createdNew = { id, ticketNumber: id, ...req.body };
      workordersStore.push(createdNew as any);
      setWorkordersStore(workordersStore);
      return res.json(createdNew);
    }

    const base = existing || (memIdx !== -1 ? workordersStore[memIdx] : {});
    const updated = {
      ...base,
      ...req.body,
      id: base.id || id,
      ticketNumber: base.ticketNumber || req.body.ticketNumber || id,
    };

    if (existing) {
      try {
        await db.update(workOrdersTable).set(updated as any).where(eq(workOrdersTable.id, existing.id));
      } catch (dbUpdateErr: any) {
        console.warn('Neon DB update fallback note:', dbUpdateErr.message);
      }
    }

    if (memIdx !== -1) {
      workordersStore[memIdx] = updated as any;
    } else {
      workordersStore.unshift(updated as any);
    }
    setWorkordersStore(workordersStore);

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE work order status
workordersRouter.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let existing: any = null;

    try {
      const rows = await db
        .select()
        .from(workOrdersTable)
        .where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
      if (rows && rows.length > 0) existing = rows[0];
    } catch (e: any) {
      console.warn('Neon DB select for status fallback to memory:', e.message);
    }

    const memIdx = workordersStore.findIndex((w) => w.id === id || w.ticketNumber === id);
    const base = existing || (memIdx !== -1 ? workordersStore[memIdx] : {});
    const updated = { ...base, status: status || 'completed' };

    if (existing) {
      try {
        await db.update(workOrdersTable).set(updated as any).where(eq(workOrdersTable.id, existing.id));
      } catch (dbUpdateErr: any) {
        console.warn('Neon DB status update fallback note:', dbUpdateErr.message);
      }
    }

    if (memIdx !== -1) {
      workordersStore[memIdx] = updated as any;
      setWorkordersStore(workordersStore);
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE work order
workordersRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await db
        .delete(workOrdersTable)
        .where(or(eq(workOrdersTable.id, id), eq(workOrdersTable.ticketNumber, id)));
    } catch (e: any) {
      console.warn('Neon DB delete workorder fallback:', e.message);
    }
    setWorkordersStore(workordersStore.filter((w) => w.id !== id && w.ticketNumber !== id));
    res.json({ success: true, message: `Work order ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
