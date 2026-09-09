import { Router } from 'express';
import { assetsStore, workordersStore, buildingsStore, mroStore } from '../stores';

export const exportRouter = Router();

// Helper to convert array of objects to CSV string
function convertToCSV(data: any[], fields: string[]): string {
  if (!data || data.length === 0) return '';
  const header = fields.join(';');
  const rows = data.map((item) =>
    fields
      .map((field) => {
        const val = item[field];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';')
  );
  return [header, ...rows].join('\r\n');
}

// Export Assets CSV / JSON
exportRouter.get('/assets', (req, res) => {
  const format = (req.query.format as string) || 'csv';
  if (format === 'json') {
    res.setHeader('Content-Disposition', 'attachment; filename="beecarbonat-assets.json"');
    return res.json(assetsStore);
  }

  const fields = [
    'id',
    'code',
    'name',
    'category',
    'buildingName',
    'floor',
    'zone',
    'status',
    'healthScore',
    'powerConsumptionKw',
    'lastInspected',
    'nextService',
    'manufacturer',
    'model',
  ];
  const csv = convertToCSV(assetsStore, fields);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="beecarbonat-assets.csv"');
  res.send('\uFEFF' + csv); // Include UTF-8 BOM for Excel compatibility
});

// Export Work Orders CSV / JSON
exportRouter.get('/workorders', (req, res) => {
  const format = (req.query.format as string) || 'csv';
  if (format === 'json') {
    res.setHeader('Content-Disposition', 'attachment; filename="beecarbonat-workorders.json"');
    return res.json(workordersStore);
  }

  const fields = [
    'id',
    'ticketNumber',
    'title',
    'category',
    'priority',
    'status',
    'buildingName',
    'assetName',
    'estimatedHours',
    'actualHours',
    'createdAt',
    'slaDeadline',
  ];
  const csv = convertToCSV(workordersStore, fields);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="beecarbonat-workorders.csv"');
  res.send('\uFEFF' + csv);
});

// Export MRO Inventory CSV
exportRouter.get('/mro', (req, res) => {
  const fields = [
    'id',
    'reference',
    'name',
    'category',
    'currentStock',
    'minThreshold',
    'unitPriceEur',
    'supplier',
    'location',
    'status',
    'lastRestocked',
  ];
  const csv = convertToCSV(mroStore, fields);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="beecarbonat-mro-inventory.csv"');
  res.send('\uFEFF' + csv);
});

export default exportRouter;

