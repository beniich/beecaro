import { Request, Response } from 'express';

const spareParts = [
  { id: 'part-01', sku: 'FLTR-HEPA-09', name: 'Filtre HEPA H13', category: 'HVAC', stock: 12, minStock: 5, unitPrice: 45.00 },
  { id: 'part-02', sku: 'PMP-VLV-44', name: 'Vanne Papillon Motorisée', category: 'Plumbing', stock: 3, minStock: 5, unitPrice: 320.00 },
  { id: 'part-03', sku: 'SENS-TEMP-02', name: 'Sonde PT100', category: 'Sensors', stock: 45, minStock: 20, unitPrice: 18.50 },
];

export const getSpareParts = (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: spareParts
  });
};

export const requestPart = (req: Request, res: Response) => {
  const { sku, quantity, workOrderId } = req.body;
  
  if (!sku || !quantity) {
    return res.status(400).json({ error: 'SKU and quantity are required' });
  }

  res.json({
    status: 'success',
    message: `Part ${sku} (x${quantity}) successfully allocated to Work Order ${workOrderId || 'N/A'}`
  });
};
