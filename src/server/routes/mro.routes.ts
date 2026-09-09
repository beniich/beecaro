import { Router } from 'express';
import { getSpareParts, requestPart } from '../controllers/mro.controller';

const router = Router();

router.get('/parts', getSpareParts);
router.post('/parts/request', requestPart);

export default router;
