import { Router, Request, Response, NextFunction } from 'express';
import { Requisition, RequisitionStatus } from '../models/Requisition';
import jwt from 'jsonwebtoken';
import { producer } from '../index';

const router = Router();

// Stateless Auth
const protect = (req: Request | any, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET!);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Aliases
router.post('/requests', protect, (req, res, next) => {
    req.url = '/';
    router.handle(req, res, next);
});

router.get('/requests', protect, (req, res, next) => {
    req.url = '/';
    router.handle(req, res, next);
});

/* GET /requisitions (root) */
router.get('/', protect, async (req: Request | any, res: Response) => {
    try {
        const query: any = {};
        // Simple role check
        if (!['admin', 'manager'].includes(req.user.role)) {
            query.requesterId = req.user.id;
        }
        const requisitions = await Requisition.find(query).sort({ createdAt: -1 });
        res.json(requisitions);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

/* POST /requisitions (root) */
router.post('/', protect, async (req: Request | any, res: Response) => {
    try {
        const requisition = await Requisition.create({
            ...req.body,
            requesterId: req.user.id,
            status: RequisitionStatus.DRAFT,
            history: [{
                status: RequisitionStatus.DRAFT,
                action: 'created',
                userId: req.user.id,
                timestamp: new Date()
            }]
        });

        // Kafka Event
        await producer.send({
            topic: 'inventory-events',
            messages: [{
                value: JSON.stringify({
                    type: 'REQUISITION_CREATED',
                    requisitionId: requisition._id,
                    requesterId: req.user.id,
                    timestamp: new Date()
                })
            }]
        });

        res.status(201).json(requisition);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

/* PATCH /requisitions/:id/status */
router.patch('/requisitions/:id/status', protect, async (req: Request | any, res: Response) => {
    try {
        const { status, comment } = req.body;
        const requisition = await Requisition.findById(req.params.id);
        if (!requisition) return res.status(404).json({ message: 'Not found' });

        requisition.status = status;
        requisition.history.push({
            status,
            action: 'status_change',
            userId: req.user.id,
            comment,
            timestamp: new Date()
        });

        await requisition.save();

        // Kafka Event
        await producer.send({
            topic: 'inventory-events',
            messages: [{
                value: JSON.stringify({
                    type: 'REQUISITION_STATUS_UPDATED',
                    requisitionId: requisition._id,
                    status,
                    timestamp: new Date()
                })
            }]
        });

        res.json(requisition);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Approval Endpoints (Remediation)
router.post('/requests/:id/approve', protect, async (req, res, next) => {
    req.body.status = RequisitionStatus.APPROVED;
    req.body.comment = 'Approved via API';
    req.url = `/requisitions/${req.params.id}/status`;
    req.method = 'PATCH';
    router.handle(req, res, next);
});

router.post('/requests/:id/reject', protect, async (req, res, next) => {
    req.body.status = RequisitionStatus.REJECTED;
    req.url = `/requisitions/${req.params.id}/status`;
    req.method = 'PATCH';
    router.handle(req, res, next);
});

export default router;
