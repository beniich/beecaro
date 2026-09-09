import { Router } from 'express';
import { getFieldOperators, createFieldOperator, updateFieldOperator, deleteFieldOperator } from '../controllers/field-operators.controller';

const router = Router();

router.get('/', getFieldOperators);
router.post('/', createFieldOperator);
router.put('/:id', updateFieldOperator);
router.delete('/:id', deleteFieldOperator);

export default router;
