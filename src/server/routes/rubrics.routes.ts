import { Router } from 'express';
import { getRubricsDiagnostics } from '../controllers/rubrics.controller';

const router = Router();

router.get('/diagnostics', getRubricsDiagnostics);

export default router;
