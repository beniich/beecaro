import { Router, Request, Response } from 'express';
import { db } from '../../db/index';
import { fieldOperators as fieldOperatorsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { fieldOperatorsStore, setFieldOperatorsStore } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const operatorsRouter = Router();

operatorsRouter.use(auditMiddleware('OPERATOR'));

// Handlers
const getFieldOperatorsHandler = async (req: Request, res: Response) => {
  try {
    const allOps = await db.select().from(fieldOperatorsTable);
    if (allOps && allOps.length > 0) {
      allOps.sort((a, b) => a.id - b.id);
      return res.json(allOps);
    }
    res.json(fieldOperatorsStore);
  } catch (err: any) {
    res.json(fieldOperatorsStore);
  }
};

const createFieldOperatorHandler = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const nextId =
      fieldOperatorsStore.length > 0
        ? Math.max(...fieldOperatorsStore.map((o) => Number(o.id) || 0)) + 1
        : 1;
    const newOp = {
      id: data.id ? Number(data.id) : nextId,
      name: data.name || 'Nouvel Intervenant',
      company: data.company || 'BeeCarbonat Maintenance',
      type: data.type || 'internal',
      email: data.email || 'tech@beecarbonat.com',
      role: data.role || 'Technicien Multi-technique',
      specialties: data.specialties || ['HVAC', 'Électricité'],
      status: data.status || 'On Call',
      task: data.task || 'Disponible',
      load: Number(data.load) || 0,
      phone: data.phone || '+33 6 00 00 00 00',
      hourlyRateEur: Number(data.hourlyRateEur) || 65,
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    try {
      await db.insert(fieldOperatorsTable).values(newOp as any);
    } catch (dbErr: any) {
      console.warn('Neon DB insert field operator fallback to memory:', dbErr.message);
    }

    fieldOperatorsStore.push(newOp);
    setFieldOperatorsStore(fieldOperatorsStore);
    res.status(201).json(newOp);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const updateFieldOperatorHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const data = req.body;
  try {
    if (process.env.MY_NEON_DB_URL) {
      await db
        .update(fieldOperatorsTable)
        .set({
          ...(data.status !== undefined && { status: data.status }),
          ...(data.task !== undefined && { task: data.task }),
          ...(data.load !== undefined && { load: Number(data.load) }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.role !== undefined && { role: data.role }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.company !== undefined && { company: data.company }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.specialties !== undefined && { specialties: data.specialties }),
          ...(data.hourlyRateEur !== undefined && { hourlyRateEur: Number(data.hourlyRateEur) }),
          ...(data.avatar !== undefined && { avatar: data.avatar }),
        })
        .where(eq(fieldOperatorsTable.id, id));
    }

    const idx = fieldOperatorsStore.findIndex((fo) => fo.id === id);
    if (idx !== -1) {
      fieldOperatorsStore[idx] = {
        ...fieldOperatorsStore[idx],
        ...data,
        id,
      };
      setFieldOperatorsStore(fieldOperatorsStore);
      return res.json({ status: 'success', data: fieldOperatorsStore[idx] });
    }
    res.status(404).json({ status: 'error', message: 'Operator/Intervenant not found' });
  } catch (err: any) {
    const idx = fieldOperatorsStore.findIndex((fo) => fo.id === id);
    if (idx !== -1) {
      fieldOperatorsStore[idx] = {
        ...fieldOperatorsStore[idx],
        ...data,
        id,
      };
      setFieldOperatorsStore(fieldOperatorsStore);
      return res.json({ status: 'success', data: fieldOperatorsStore[idx] });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const deleteFieldOperatorHandler = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  try {
    try {
      await db.delete(fieldOperatorsTable).where(eq(fieldOperatorsTable.id, id));
    } catch (e: any) {
      console.warn('Neon DB delete field operator fallback:', e.message);
    }
    setFieldOperatorsStore(fieldOperatorsStore.filter((fo) => fo.id !== id));
    res.json({ success: true, message: `Operator/Intervenant ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

operatorsRouter.get('/', getFieldOperatorsHandler);
operatorsRouter.post('/', createFieldOperatorHandler);
operatorsRouter.put('/:id', updateFieldOperatorHandler);
operatorsRouter.delete('/:id', deleteFieldOperatorHandler);
