import { Router } from 'express';
import { getLeases, createLease } from '../controllers/leases.controller';

const router = Router();

router.get('/', getLeases);
router.post('/', createLease);

export default router;
