import { Router } from 'express';
import { getLightingZones, updateLightingZone } from '../controllers/lighting.controller';

const router = Router();

router.get('/zones', getLightingZones);
router.put('/zones/:id', updateLightingZone);

export default router;
