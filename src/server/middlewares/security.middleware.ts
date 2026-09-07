import { Request, Response, NextFunction } from 'express';

// ============== SANITIZATION XSS ==============
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === 'object') {
      const cleaned: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = sanitize(value);
      }
      return cleaned;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      (req.query as any)[key] = sanitize(req.query[key]);
    }
  }
  if (req.params && typeof req.params === 'object') {
    for (const key of Object.keys(req.params)) {
      (req.params as any)[key] = sanitize(req.params[key]);
    }
  }

  next();
};

// ============== HEADERS DE SÉCURITÉ ==============
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};
