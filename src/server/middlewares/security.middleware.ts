import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Rate Limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS Configuration
export const corsConfig = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || '*'] // Replace with actual production URL if available, but keep * as fallback in PaaS
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
});

// Helmet Configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: false, // Often disabled or customized for React apps with external resources (maps, APIs)
  crossOriginEmbedderPolicy: false,
});

// Compression
export const compressionConfig = compression();
