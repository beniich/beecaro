import { Router } from 'express';
import { mockEnergyTimeSeries } from '../../data/mockData';

export const energyRouter = Router();

energyRouter.get('/energy-timeseries', (req, res) => {
  res.json(mockEnergyTimeSeries);
});
