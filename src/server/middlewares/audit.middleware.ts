import { Request, Response, NextFunction } from 'express';
import { addAuditLog } from '../stores';
import { pool, dbConnectionString } from '../config/database';

export const auditMiddleware = (entity: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Intercept only mutating methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      let logged = false;

      const performLog = (data: any) => {
        if (logged) return;
        logged = true;

        let entityId: string | null = req.params.id || null;

        if (!entityId && data) {
          try {
            if (typeof data === 'object' && data.id) {
              entityId = String(data.id);
            } else if (typeof data === 'string') {
              const parsed = JSON.parse(data);
              if (parsed && parsed.id) entityId = String(parsed.id);
            }
          } catch {
            // Keep default
          }
        }

        const action = `${req.method}_${entity}`.toUpperCase();
        const userId = (req as any).user?.userId || (req as any).user?.id || 'anonymous';
        const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

        // Add to in-memory audit store
        const auditEntry = addAuditLog({
          userId,
          action,
          entity,
          entityId,
          ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
          details: {
            method: req.method,
            path: req.originalUrl,
            payload: req.body
          }
        });

        // Write to PostgreSQL in background if connected
        if (dbConnectionString) {
          pool.query(
            `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, ip_address, details)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
            [auditEntry.id, userId, action, entity, entityId, auditEntry.ipAddress, JSON.stringify(auditEntry.details)]
          ).catch(err => console.warn('[Audit DB Sync Notice]:', err.message));
        }
      };

      res.json = function (body: any) {
        performLog(body);
        return originalJson(body);
      };

      res.send = function (body: any) {
        performLog(body);
        return originalSend(body);
      };
    }
    next();
  };
};
