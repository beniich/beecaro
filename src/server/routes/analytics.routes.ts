import { Router } from 'express';
import { exportAnalytics, getAuditLogs } from '../controllers/analytics.controller';

const router = Router();

router.get('/export', exportAnalytics);
router.get('/audit-logs', getAuditLogs);

export default router;
