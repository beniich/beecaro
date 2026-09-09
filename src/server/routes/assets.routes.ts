import { Router } from 'express';
import { getAssets, getAssetsStats, getAssetById, createAsset } from '../controllers/assets.controller';

const router = Router();

router.get('/', getAssets);
router.get('/stats', getAssetsStats);
router.get('/:id', getAssetById);
router.post('/', createAsset);

export default router;
