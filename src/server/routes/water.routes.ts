import { Router } from 'express';
import { getWaterSectors, updateWaterSector } from '../controllers/water.controller';

const router = Router();

router.get('/sectors', getWaterSectors);
router.put('/sectors/:id', updateWaterSector);

export default router;
