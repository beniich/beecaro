import { Router } from 'express';
import { mockEnergyTimeSeries } from '../../data/mockData';

export const energyRouter = Router();

energyRouter.get('/', (req, res) => {
  res.json(mockEnergyTimeSeries);
});

export default energyRouter;
