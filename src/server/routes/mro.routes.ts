import { Router } from 'express';
import { mroStore, setMroStore, MroItem } from '../stores';
import { auditMiddleware } from '../middlewares/audit.middleware';

export const mroRouter = Router();

mroRouter.use(auditMiddleware('MRO_ITEM'));

// GET all MRO spare parts inventory
mroRouter.get('/inventory', (req, res) => {
  const categoryFilter = req.query.category as string;
  const statusFilter = req.query.status as string;

  let results = [...mroStore];
  if (categoryFilter) {
    results = results.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase());
  }
  if (statusFilter) {
    results = results.filter((item) => item.status.toLowerCase() === statusFilter.toLowerCase());
  }

  res.json({
    totalCount: results.length,
    criticalShortageCount: results.filter((i) => i.status === 'critical_shortage').length,
    lowStockCount: results.filter((i) => i.status === 'low_stock').length,
    items: results,
  });
});

// GET stock shortage alerts
mroRouter.get('/alerts', (req, res) => {
  const alerts = mroStore.filter((item) => item.currentStock <= item.minThreshold);
  res.json({
    activeAlertsCount: alerts.length,
    alerts: alerts.map((item) => ({
      id: item.id,
      reference: item.reference,
      name: item.name,
      currentStock: item.currentStock,
      minThreshold: item.minThreshold,
      deficit: item.minThreshold - item.currentStock,
      status: item.status,
      supplier: item.supplier,
      urgency: item.currentStock === 0 ? 'CRITICAL' : 'HIGH',
    })),
  });
});

// GET single item
mroRouter.get('/item/:id', (req, res) => {
  const item = mroStore.find((i) => i.id === req.params.id || i.reference === req.params.id);
  if (!item) return res.status(404).json({ error: 'Pièce MRO introuvable' });
  res.json(item);
});

// CREATE MRO item
mroRouter.post('/item', (req, res) => {
  const data = req.body;
  const stock = Number(data.currentStock) || 0;
  const threshold = Number(data.minThreshold) || 1;

  let status: 'optimal' | 'low_stock' | 'critical_shortage' = 'optimal';
  if (stock <= 0) status = 'critical_shortage';
  else if (stock <= threshold) status = 'low_stock';

  const newItem: MroItem = {
    id: data.id || `mro-${Date.now().toString().slice(-4)}`,
    reference: data.reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    name: data.name || 'Nouvelle Pièce Détachée',
    category: data.category || 'Autre',
    currentStock: stock,
    minThreshold: threshold,
    unitPriceEur: Number(data.unitPriceEur) || 0,
    supplier: data.supplier || 'Fournisseur Agréé',
    location: data.location || 'Magasin Central',
    compatibleAssets: data.compatibleAssets || [],
    status,
    lastRestocked: new Date().toISOString().split('T')[0],
  };

  mroStore.unshift(newItem);
  setMroStore(mroStore);
  res.status(201).json(newItem);
});

// RESTOCK item
mroRouter.put('/item/:id/restock', (req, res) => {
  const { id } = req.params;
  const quantity = Number(req.body.quantity) || 1;

  const idx = mroStore.findIndex((i) => i.id === id || i.reference === id);
  if (idx === -1) return res.status(404).json({ error: 'Pièce MRO introuvable' });

  const current = mroStore[idx];
  const newStock = current.currentStock + quantity;
  let status: 'optimal' | 'low_stock' | 'critical_shortage' = 'optimal';
  if (newStock <= 0) status = 'critical_shortage';
  else if (newStock <= current.minThreshold) status = 'low_stock';

  mroStore[idx] = {
    ...current,
    currentStock: newStock,
    status,
    lastRestocked: new Date().toISOString().split('T')[0],
  };
  setMroStore(mroStore);

  res.json({
    success: true,
    message: `Réapprovisionnement réussi (+${quantity})`,
    item: mroStore[idx],
  });
});

// UPDATE MRO item
mroRouter.put('/item/:id', (req, res) => {
  const { id } = req.params;
  const idx = mroStore.findIndex((i) => i.id === id || i.reference === id);
  if (idx === -1) return res.status(404).json({ error: 'Pièce MRO introuvable' });

  const updated: MroItem = {
    ...mroStore[idx],
    ...req.body,
    id: mroStore[idx].id,
  };
  mroStore[idx] = updated;
  setMroStore(mroStore);

  res.json(updated);
});

// DELETE MRO item
mroRouter.delete('/item/:id', (req, res) => {
  const { id } = req.params;
  setMroStore(mroStore.filter((i) => i.id !== id && i.reference !== id));
  res.json({ success: true, message: `Pièce ${id} supprimée` });
});
