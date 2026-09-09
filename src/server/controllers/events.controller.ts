import { Request, Response } from 'express';

// Store all active SSE clients
let clients: { id: string; res: Response }[] = [];

// Route handler for SSE connection
export const sseConnect = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now().toString();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
};

// Dispatch event to all clients
export const broadcastEvent = (eventType: string, data: any) => {
  clients.forEach(client => {
    client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  });
};

// Example telemetry emitter simulator
export const startTelemetrySimulation = () => {
  setInterval(() => {
    broadcastEvent('telemetry_update', {
      timestamp: new Date().toISOString(),
      cpu: +(35 + Math.random() * 5).toFixed(1),
      power: +(140 + Math.random() * 25).toFixed(1)
    });
  }, 5000);
};
