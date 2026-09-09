import { Router } from 'express';
import { getDashboardMetrics, getEnergyTimeseries } from '../controllers/dashboard.controller';

const router = Router();

router.get('/dashboard', getDashboardMetrics);
router.get('/energy-timeseries', getEnergyTimeseries);

export default router;
