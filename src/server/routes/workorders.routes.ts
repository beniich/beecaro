import { Router } from 'express';
import { getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, updateWorkOrderStatus, deleteWorkOrder } from '../controllers/workorders.controller';

const router = Router();

router.get('/', getWorkOrders);
router.get('/:id', getWorkOrderById);
router.post('/', createWorkOrder);
router.put('/:id', updateWorkOrder);
router.put('/:id/status', updateWorkOrderStatus);
router.delete('/:id', deleteWorkOrder);

export default router;
