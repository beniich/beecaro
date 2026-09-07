import { Router, Request, Response } from 'express';

const clients = new Set<Response>();

export const eventsRouter = Router();

// GET /api/events - Flux SSE
eventsRouter.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  clients.add(res);

  // Send initial handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', ts: Date.now() })}\n\n`);

  // Heartbeat every 20s
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (_) {}
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

export const broadcastEvent = (eventType: string, data: any) => {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(payload);
    } catch (_) {
      clients.delete(client);
    }
  });
};
