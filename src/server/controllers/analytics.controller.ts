import { Request, Response } from 'express';

// Simulated Immutable Audit Logs
const auditLogs = [
  { id: 'log-1', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'admin_sys', action: 'CREATE_WORK_ORDER', target: 'HVAC-001', hash: '0xabc123...', signature: 'verified' },
  { id: 'log-2', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'tech_05', action: 'CLOSE_WORK_ORDER', target: 'PUMP-002', hash: '0xdef456...', signature: 'verified' },
  { id: 'log-3', timestamp: new Date(Date.now() - 10800000).toISOString(), actor: 'ai_agent', action: 'PREDICTIVE_ALERT', target: 'CHILLER-01', hash: '0xghi789...', signature: 'verified' },
];

export const exportAnalytics = (req: Request, res: Response) => {
  // Generate a mock CSV export
  const csvData = `Date,Metric,Value\n2026-09-01,Energy(kWh),4500\n2026-09-02,Energy(kWh),4200\n2026-09-03,Energy(kWh),4350`;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="analytics_export.csv"');
  res.status(200).send(csvData);
};

export const getAuditLogs = (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: auditLogs,
    integrity: 'valid' // Indicates logs haven't been tampered with
  });
};
