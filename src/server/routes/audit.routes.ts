import { Router } from 'express';
import { auditLogsStore } from '../stores';
import { pool, dbConnectionString } from '../config/database';

export const auditRouter = Router();

// GET all audit logs with optional filters
auditRouter.get('/audit-logs', async (req, res) => {
  const entityFilter = req.query.entity as string;
  const actionFilter = req.query.action as string;
  const limit = Math.min(Number(req.query.limit) || 100, 500);

  // Try fetching from PostgreSQL if available
  if (dbConnectionString) {
    try {
      const client = await pool.connect();
      let query = 'SELECT * FROM audit_logs';
      const conditions: string[] = [];
      const values: any[] = [];

      if (entityFilter) {
        values.push(entityFilter.toUpperCase());
        conditions.push(`entity = $${values.length}`);
      }
      if (actionFilter) {
        values.push(actionFilter.toUpperCase());
        conditions.push(`action = $${values.length}`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
      values.push(limit);

      const result = await client.query(query, values);
      client.release();

      if (result.rows && result.rows.length > 0) {
        return res.json({
          source: 'postgresql_audit_logs',
          totalCount: result.rowCount,
          logs: result.rows,
        });
      }
    } catch (e: any) {
      console.warn('[Audit Log PG Query notice]:', e.message);
    }
  }

  // Fallback to in-memory store
  let filtered = [...auditLogsStore];
  if (entityFilter) {
    filtered = filtered.filter((l) => l.entity.toUpperCase() === entityFilter.toUpperCase());
  }
  if (actionFilter) {
    filtered = filtered.filter((l) => l.action.toUpperCase() === actionFilter.toUpperCase());
  }

  res.json({
    source: 'in_memory_audit_logs',
    totalCount: filtered.length,
    logs: filtered.slice(0, limit),
  });
});

export default auditRouter;
