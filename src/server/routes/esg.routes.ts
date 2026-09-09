import { Router } from 'express';
import { getEsg, updateEsg } from '../controllers/esg.controller';

const router = Router();

router.get('/', getEsg);
router.put('/', updateEsg);

export default router;
