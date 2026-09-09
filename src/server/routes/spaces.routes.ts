import { Router } from 'express';
import { getSpaces } from '../controllers/spaces.controller';

const router = Router();

router.get('/', getSpaces);

export default router;
