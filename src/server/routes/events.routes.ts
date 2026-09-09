import { Router } from 'express';
import { sseConnect } from '../controllers/events.controller';

const router = Router();

router.get('/stream', sseConnect);

export default router;
