import { Router } from 'express';
import { getGrafanaOverview, getGrafanaMetrics, getGrafanaAlerts, getGrafanaLogs, postGrafanaQuery } from '../controllers/grafana.controller';

const router = Router();

router.get('/overview', getGrafanaOverview);
router.get('/metrics', getGrafanaMetrics);
router.get('/alerts', getGrafanaAlerts);
router.get('/logs', getGrafanaLogs);
router.post('/query', postGrafanaQuery);

export default router;
