import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { Complaint, STATUS_TRANSITIONS } from '../models/Complaint';
import jwt from 'jsonwebtoken';
import { producer } from '../index';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

// ─── Rate Limiter ────────────────────────────────────────────────────────────
// Anti-spam pour la création de réclamations
const createComplaintLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite à 5 réclamations par IP  
    message: { message: "Trop de réclamations créées depuis cette IP. Veuillez réessayer plus tard." }
});

// ─── Multer (Storage config) ─────────────────────────────────────────────────
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const router = Router();

// ─────────────────────────────────────────────
//  Auth & RBAC Middleware
// ─────────────────────────────────────────────
const protect = (req: Request | any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            // @ts-ignore
            req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            return next();
        } catch {
            return res.status(401).json({ message: 'Token invalide ou expiré.' });
        }
    }
    return res.status(401).json({ message: 'Authentification requise.' });
};

// Vérifie si le rôle de l'utilisateur fait partie des rôles autorisés
const authorize = (...roles: string[]) => {
    return (req: Request | any, res: Response, next: NextFunction) => {
        const userRoles: string[] = req.user?.roles || (req.user?.role ? [req.user.role] : []);
        // Si aucun des rôles de l'utilisateur n'est dans le tableau des rôles requis
        const hasRole = userRoles.some(role => roles.includes(role));
        
        if (!hasRole && !userRoles.includes('admin')) { // Admin a tous les droits
            return res.status(403).json({ 
                message: `Accès refusé. Les rôles requis sont : ${roles.join(', ')}` 
            });
        }
        next();
    };
};

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// ─────────────────────────────────────────────
//  Kafka helper (fire & forget — never crash the request)
// ─────────────────────────────────────────────
async function emitEvent(type: string, payload: object) {
    try {
        await producer.send({
            topic: 'complaint-events',
            messages: [{ value: JSON.stringify({ type, ...payload, timestamp: new Date() }) }],
        });
    } catch (err) {
        console.error(`[Kafka] Failed to emit ${type}:`, err);
    }
}

// ─────────────────────────────────────────────
//  POST /upload — Upload photo/document (Supabase/S3 placeholder)
// ─────────────────────────────────────────────
router.post('/upload', protect, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });
        
        // 🚀 ICI : Remplacer par du vrai code Supabase/S3 en production
        // const { data, error } = await supabase.storage.from('complaints').upload(fileName, req.file.buffer)
        
        // Placeholder : on simule l'upload
        const mockUrl = `https://storage.reclamtrack.local/complaints/${Date.now()}-${req.file.originalname}`;
        
        res.status(201).json({ url: mockUrl });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
//  POST / — Create complaint
// ─────────────────────────────────────────────
router.post(
    '/',
    createComplaintLimiter,
    [
        body('title').notEmpty().withMessage('Le titre est requis.'),
        body('description').notEmpty().withMessage('La description est requise.'),
        body('category').notEmpty().withMessage('La catégorie est requise.'),
        body('subcategory').notEmpty().withMessage('La sous-catégorie est requise.'),
        body('address').notEmpty().withMessage("L'adresse est requise."),
        body('city').notEmpty().withMessage('La ville est requise.'),
        body('district').notEmpty().withMessage('Le quartier est requis.'),
        body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    ],
    validate,
    async (req: Request, res: Response) => {
        try {
            const complaint = await Complaint.create(req.body);
            await emitEvent('COMPLAINT_CREATED', {
                complaintId: complaint._id,
                number: complaint.number,
                category: complaint.category,
                priority: complaint.priority,
                status: complaint.status,
                slaDueDate: complaint.slaDueDate,
                email: complaint.email,
            });
            res.status(201).json(complaint);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
);

// ─────────────────────────────────────────────
//  GET / — List complaints with filters + pagination
// ─────────────────────────────────────────────
router.get(
    '/',
    protect,
    [
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('status').optional().isString(),
        query('category').optional().isString(),
        query('priority').optional().isString(),
        query('search').optional().isString(),
        query('dateFrom').optional().isISO8601(),
        query('dateTo').optional().isISO8601(),
        query('sortBy').optional().isString(),
        query('sortOrder').optional().isIn(['asc', 'desc']),
    ],
    validate,
    async (req: Request, res: Response) => {
        try {
            const page = (req.query.page as any) || 1;
            const limit = (req.query.limit as any) || 20;
            const skip = (page - 1) * limit;

            const filter: any = {};

            if (req.query.status) {
                const statuses = (req.query.status as string).split(',');
                filter.status = { $in: statuses };
            }
            if (req.query.category) {
                const cats = (req.query.category as string).split(',');
                filter.category = { $in: cats };
            }
            if (req.query.priority) {
                const priorities = (req.query.priority as string).split(',');
                filter.priority = { $in: priorities };
            }
            if (req.query.search) {
                const s = req.query.search as string;
                filter.$or = [
                    { title: { $regex: s, $options: 'i' } },
                    { description: { $regex: s, $options: 'i' } },
                    { number: { $regex: s, $options: 'i' } },
                    { firstName: { $regex: s, $options: 'i' } },
                    { lastName: { $regex: s, $options: 'i' } },
                ];
            }
            if (req.query.dateFrom || req.query.dateTo) {
                filter.createdAt = {};
                if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom as string);
                if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo as string);
            }

            const sortField = (req.query.sortBy as string) || 'createdAt';
            const sortDir = req.query.sortOrder === 'asc' ? 1 : -1;
            const sort: any = { [sortField]: sortDir };

            const [complaints, total] = await Promise.all([
                Complaint.find(filter).sort(sort).skip(skip).limit(limit).lean(),
                Complaint.countDocuments(filter),
            ]);

            // Compute SLA breach flag per ticket
            const now = Date.now();
            const enriched = complaints.map((c: any) => ({
                ...c,
                slaBreached: c.slaDueDate && c.status !== 'résolue' && c.status !== 'fermée'
                    ? new Date(c.slaDueDate).getTime() < now
                    : false,
            }));

            res.json({
                data: enriched,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
);

// ─────────────────────────────────────────────
//  GET /stats — Summary counts per status
// ─────────────────────────────────────────────
router.get('/stats', protect, async (_req: Request, res: Response) => {
    try {
        const stats = await Complaint.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const result: Record<string, number> = {};
        stats.forEach((s) => { result[s._id] = s.count; });
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
//  GET /:id — Complaint detail (populated)
// ─────────────────────────────────────────────
router.get('/:id', protect, async (req: Request, res: Response) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('assignedTeamId', 'name status')
            .populate('technicianId', 'name email');
        if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable.' });

        const now = Date.now();
        const c = complaint.toObject() as any;
        c.slaBreached =
            c.slaDueDate &&
            c.status !== 'résolue' &&
            c.status !== 'fermée'
                ? new Date(c.slaDueDate).getTime() < now
                : false;

        res.json(c);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
//  PUT /:id — Update complaint fields
// ─────────────────────────────────────────────
router.put(
    '/:id',
    protect,
    authorize('admin', 'dispatcher', 'manager'),
    [
        body('title').optional().notEmpty(),
        body('description').optional().notEmpty(),
        body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    ],
    validate,
    async (req: Request | any, res: Response) => {
        try {
            const complaint = await Complaint.findById(req.params.id);
            if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable.' });

            const allowedFields = [
                'title', 'description', 'category', 'subcategory',
                'address', 'city', 'district', 'postalCode', 'location',
                'photos', 'documents', 'audioNote',
                'firstName', 'lastName', 'email', 'phone',
            ];

            let changed = false;
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    (complaint as any)[field] = req.body[field];
                    changed = true;
                }
            }

            // Priority change → recompute SLA
            if (req.body.priority && req.body.priority !== complaint.priority) {
                const old = complaint.priority;
                complaint.priority = req.body.priority;
                const delay = (await import('../models/Complaint')).SLA_DELAYS[complaint.priority];
                complaint.slaDueDate = new Date(Date.now() + delay);
                complaint.timeline.push({
                    eventType: 'priority_changed',
                    message: `Priorité modifiée de "${old}" à "${complaint.priority}".`,
                    actorName: req.user?.name || 'Agent',
                    oldValue: old,
                    newValue: complaint.priority,
                    createdAt: new Date(),
                });
                changed = true;
            }

            if (changed) await complaint.save();
            res.json(complaint);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
);

// ─────────────────────────────────────────────
//  PATCH /:id/status — Change status (validated transition)
// ─────────────────────────────────────────────
router.patch('/:id/status', protect, authorize('admin', 'dispatcher'), async (req: Request | any, res: Response) => {
    try {
        const { status, reason } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable.' });

        const allowed = STATUS_TRANSITIONS[complaint.status];
        if (!allowed.includes(status)) {
            return res.status(400).json({
                message: `Transition invalide : "${complaint.status}" → "${status}". Transitions autorisées : ${allowed.join(', ') || 'aucune'}.`,
            });
        }

        const oldStatus = complaint.status;
        complaint.status = status;

        // Lifecycle timestamps
        if (status === 'résolue') {
            complaint.resolvedAt = new Date();
            complaint.resolutionTimeMs = Date.now() - new Date(complaint.createdAt).getTime();
        }
        if (status === 'fermée') complaint.closedAt = new Date();
        if (status === 'rejetée') complaint.rejectedAt = new Date();

        complaint.timeline.push({
            eventType: 'status_changed',
            message: reason || `Statut mis à jour : "${oldStatus}" → "${status}".`,
            actorName: req.user?.name || 'Agent',
            oldValue: oldStatus,
            newValue: status,
            createdAt: new Date(),
        });

        await complaint.save();

        await emitEvent('COMPLAINT_STATUS_UPDATED', {
            complaintId: complaint._id,
            number: complaint.number,
            oldStatus,
            newStatus: status,
            email: complaint.email,
            reason,
        });

        res.json(complaint);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
//  POST /:id/assign — Assign team + technician
// ─────────────────────────────────────────────
router.post('/:id/assign', protect, authorize('admin', 'dispatcher'), async (req: Request | any, res: Response) => {
    try {
        const { teamId, technicianId, teamName, technicianName } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable.' });

        complaint.assignedTeamId = teamId;
        complaint.technicianId = technicianId;
        complaint.assignedAt = new Date();

        // Auto-transition to "en cours" if still "nouvelle"
        if (complaint.status === 'nouvelle') {
            complaint.status = 'en cours';
            complaint.timeline.push({
                eventType: 'status_changed',
                message: 'Statut automatiquement mis à "en cours" suite à l\'assignation.',
                actorName: req.user?.name || 'Système',
                oldValue: 'nouvelle',
                newValue: 'en cours',
                createdAt: new Date(),
            });
        }

        complaint.timeline.push({
            eventType: 'assigned',
            message: `Assignée à l'équipe "${teamName || teamId}"${technicianName ? ` — technicien : ${technicianName}` : ''}.`,
            actorName: req.user?.name || 'Agent',
            newValue: teamName || teamId,
            createdAt: new Date(),
        });

        await complaint.save();

        await emitEvent('COMPLAINT_ASSIGNED', {
            complaintId: complaint._id,
            number: complaint.number,
            teamId,
            technicianId,
            teamName,
            technicianName,
        });

        res.json(complaint);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
//  POST /:id/comments — Add a comment
// ─────────────────────────────────────────────
router.post(
    '/:id/comments',
    protect,
    [body('content').notEmpty().withMessage('Le contenu du commentaire est requis.')],
    validate,
    async (req: Request | any, res: Response) => {
        try {
            const { content, isInternal } = req.body;
            const complaint = await Complaint.findById(req.params.id);
            if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable.' });

            const authorName = req.user?.name || 'Agent';

            complaint.comments.push({
                content,
                authorId: req.user?.id,
                authorName,
                isInternal: Boolean(isInternal),
                createdAt: new Date(),
            });

            complaint.timeline.push({
                eventType: 'commented',
                message: isInternal
                    ? `Note interne ajoutée par ${authorName}.`
                    : `Commentaire ajouté par ${authorName}.`,
                actorName: authorName,
                createdAt: new Date(),
            });

            await complaint.save();
            res.status(201).json(complaint.comments[complaint.comments.length - 1]);
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
);

// ─────────────────────────────────────────────
//  GET /:id/timeline — Full timeline
// ─────────────────────────────────────────────
router.get('/:id/timeline', protect, async (req: Request, res: Response) => {
    try {
        const complaint = await Complaint.findById(req.params.id).select('timeline number');
        if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable.' });
        res.json(complaint.timeline);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
//  DELETE /:id — Soft delete (status = 'fermée')
// ─────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req: Request | any, res: Response) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Réclamation introuvable.' });

        complaint.status = 'fermée';
        complaint.closedAt = new Date();
        complaint.timeline.push({
            eventType: 'closed',
            message: 'Réclamation fermée et archivée.',
            actorName: req.user?.name || 'Agent',
            createdAt: new Date(),
        });

        await complaint.save();
        res.json({ message: 'Réclamation archivée avec succès.', id: complaint._id });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
