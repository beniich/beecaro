import { Router } from 'express';
import { getBuildings, getBuildingById, createBuilding, updateBuilding, deleteBuilding } from '../controllers/buildings.controller';

const router = Router();

router.get('/', getBuildings);
router.get('/:id', getBuildingById);
router.post('/', createBuilding);
router.put('/:id', updateBuilding);
router.delete('/:id', deleteBuilding);

export default router;
