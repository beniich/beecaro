import { Request, Response } from 'express';
import { mockEnergyTimeSeries } from '../../data/mockData';

export const getEnergyTimeseries = (req: Request, res: Response) => {
  res.json(mockEnergyTimeSeries);
};

export const getDashboardMetrics = (req: Request, res: Response) => {
  res.json({
    metrics: {
      activeSensors: 148,
      sustainabilityScore: 94.8,
      resolvedTickets: 182,
      activeSlaPercentage: 99.2,
      totalEnergySavedMwh: 124.6,
      co2SavedKg: 48500
    },
    criticalAlerts: [
      {
        id: 'al-01',
        severity: 'high',
        message: 'Critical high temperature on HVAC bilge pump #1',
        timestamp: new Date().toISOString()
      }
    ]
  });
};
