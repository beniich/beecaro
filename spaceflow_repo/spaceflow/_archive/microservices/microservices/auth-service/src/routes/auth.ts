import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { producer } from '../index'; // Import Kafka producer

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const protect = async (req: Request | any, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET!);
            req.user = await User.findById((decoded as any).id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/* POST /register */
router.post(
    '/register',
    [
        body('email').isEmail(),
        body('password').isLength({ min: 6 })
    ],
    validate,
    async (req: Request, res: Response) => {
        try {
            const { email, password, role } = req.body;
            const exists = await User.findOne({ email });
            if (exists) return res.status(409).json({ message: 'Email déjà utilisé' });

            const user = await User.create({ email, password, role });
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '7d' }
            );

            // Kafka Event
            await producer.send({
                topic: 'auth-events',
                messages: [{
                    value: JSON.stringify({
                        type: 'USER_REGISTERED',
                        userId: user._id,
                        email: user.email,
                        role: user.role,
                        timestamp: new Date()
                    })
                }]
            });

            res.status(201).json({ token, user: { id: user._id, email, role: user.role } });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
);

/* POST /login */
router.post(
    '/login',
    [
        body('email').isEmail(),
        body('password').exists()
    ],
    validate,
    async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Identifiants invalides' });
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '7d' }
            );

            // Kafka Event
            await producer.send({
                topic: 'auth-events',
                messages: [{
                    value: JSON.stringify({
                        type: 'USER_LOGIN',
                        userId: user._id,
                        email: user.email,
                        role: user.role,
                        timestamp: new Date()
                    })
                }]
            });

            res.json({ token, user: { id: user._id, email, role: user.role } });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    }
);

/* GET /me */
router.get('/me', protect, async (req: Request | any, res: Response) => {
    const user = req.user;
    if (user) {
        res.json({ id: user._id, email: user.email, role: user.role, name: user.name });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

export default router;
