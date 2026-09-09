import { Request, Response } from 'express';

export const getHealthStatus = (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    branding: 'beecarbonat-spider-cafm',
    modularized: true // Proof of modularization
  });
};

import { pool } from '../../db/index';

export const getDbStatus = async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    res.json({
      status: 'connected',
      provider: 'NeonDB Serverless PostgreSQL',
      version: result.rows[0].version
    });
  } catch (err: any) {
    res.json({
      status: 'in-memory-fallback',
      provider: 'BeeCarbonat In-Memory Store',
      message: err.message
    });
  }
};
