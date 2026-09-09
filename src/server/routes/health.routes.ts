import { Router } from 'express';
import { getHealthStatus, getDbStatus } from '../controllers/health.controller';

const router = Router();

router.get('/', getHealthStatus);
router.get('/db-status', getDbStatus);

export default router;
