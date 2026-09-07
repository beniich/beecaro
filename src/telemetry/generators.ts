import { TrafficMetric, SecurityEvent, DatabaseMetric, NeuralRequest, NeuralNode, AuditBlock, ServerNode } from './types';
import { SERVER_FLEET, REGIONS } from './config';

// ============================================================
// HELPERS MATHÉMATIQUES
// ============================================================

class NoiseGenerator {
  // Bruit de Perlin simplifié pour des variations réalistes
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  // Marche aléatoire bornée
  boundedWalk(current: number, min: number, max: number, volatility: number = 0.05): number {
    const delta = (Math.random() - 0.5) * (max - min) * volatility;
    return Math.max(min, Math.min(max, current + delta));
  }

  // Distribution gaussienne
  gaussian(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Saisonnalité (sinus avec bruit)
  seasonal(baseValue: number, period: number, amplitude: number, phase: number = 0): number {
    return baseValue + amplitude * Math.sin((Date.now() / 1000 / period) * 2 * Math.PI + phase);
  }

  // Spike occasionnel (incidents, pics de trafic)
  maybeSpike(probability: number = 0.01, multiplier: number = 3): number {
    return Math.random() < probability ? multiplier : 1;
  }
}

// ============================================================
// GÉNÉRATEURS DE MÉTRIQUES
// ============================================================

const noise = new NoiseGenerator();

export function generateTrafficMetric(prev?: TrafficMetric): TrafficMetric {
  const baseRps = 12500;
  const seasonal = noise.seasonal(0, 300, 3000); // cycle de 5min
  const spike = noise.maybeSpike(0.02, 2.5);
  const requestsPerSec = Math.round(baseRps + seasonal + noise.gaussian(0, 800) * spike);
  
  const baseLatency = 45;
  const latencySpike = requestsPerSec > 15000 ? noise.gaussian(120, 40) : noise.gaussian(baseLatency, 8);
  
  return {
    timestamp: Date.now(),
    requestsPerSec,
    bytesIn: Math.round(requestsPerSec * noise.gaussian(2.3, 0.4) * 1024), // KB
    bytesOut: Math.round(requestsPerSec * noise.gaussian(8.7, 1.2) * 1024),
    errors: Math.max(0, Math.round(requestsPerSec * 0.002 * Math.random())),
    p50Latency: Math.round(noise.boundedWalk(prev?.p50Latency || 12, 5, 30, 0.1)),
    p95Latency: Math.round(noise.boundedWalk(prev?.p95Latency || latencySpike * 2.5, 20, 200, 0.15)),
    p99Latency: Math.round(noise.boundedWalk(prev?.p99Latency || latencySpike * 4, 50, 500, 0.2)),
  };
}

export function generateSecurityEvent(): SecurityEvent {
  const attackTypes = ['ddos', 'sql-injection', 'xss', 'csrf', 'brute-force', 'rate-limit', 'bot-detected'] as const;
  const countries = [
    { code: 'CN', name: 'China', coords: [104.2, 35.8] as [number, number] },
    { code: 'RU', name: 'Russia', coords: [105.3, 61.5] as [number, number] },
    { code: 'US', name: 'USA', coords: [-97.0, 38.0] as [number, number] },
    { code: 'BR', name: 'Brazil', coords: [-51.9, -14.2] as [number, number] },
    { code: 'IN', name: 'India', coords: [78.9, 20.6] as [number, number] },
    { code: 'NG', name: 'Nigeria', coords: [8.6, 9.1] as [number, number] },
    { code: 'KP', name: 'North Korea', coords: [127.5, 40.3] as [number, number] },
    { code: 'IR', name: 'Iran', coords: [53.7, 32.4] as [number, number] },
  ];

  const type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  const source = countries[Math.floor(Math.random() * countries.length)];
  const ip = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  const blocked = Math.random() > 0.05; // 95% bloqués

  const severities: SecurityEvent['severity'][] = ['info', 'warning', 'critical', 'emergency'];
  const severity = blocked ? severities[Math.floor(Math.random() * 2)] // info ou warning si bloqué
    : severities[2 + Math.floor(Math.random() * 2)]; // critical/emergency si passé

  return {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    type,
    sourceIp: ip,
    sourceCountry: source.code,
    sourceCoordinates: source.coords,
    targetEndpoint: ['/api/auth/login', '/api/tickets', '/api/workorders', '/api/users'][Math.floor(Math.random() * 4)],
    severity,
    blocked,
    ruleId: `CF-${Math.floor(Math.random() * 9999)}`,
    payload: type === 'sql-injection' ? "' OR 1=1--" : undefined,
  };
}

export function generateDatabaseMetric(prev?: DatabaseMetric): DatabaseMetric {
  return {
    timestamp: Date.now(),
    activeConnections: Math.round(noise.boundedWalk(prev?.activeConnections || 145, 50, 500, 0.1)),
    queriesPerSec: Math.round(noise.boundedWalk(prev?.queriesPerSec || 3200, 1000, 8000, 0.08)),
    avgQueryTime: Math.round(noise.boundedWalk(prev?.avgQueryTime || 8, 1, 50, 0.2) * 10) / 10,
    slowQueries: Math.max(0, Math.round(noise.boundedWalk(prev?.slowQueries || 3, 0, 30, 0.3))),
    cacheHitRate: Math.min(0.99, Math.max(0.7, noise.boundedWalk(prev?.cacheHitRate || 0.94, 0.5, 0.99, 0.02))),
    replicationLag: Math.round(noise.boundedWalk(prev?.replicationLag || 15, 0, 200, 0.2)),
    storageUsed: Math.round(noise.boundedWalk(prev?.storageUsed || 847, 100, 2000, 0.005)),
  };
}

export function generateNeuralRequest(): NeuralRequest {
  const models: NeuralRequest['model'][] = ['gemini-pro', 'claude-sonnet', 'gpt-4', 'llama-70b'];
  const model = models[Math.floor(Math.random() * models.length)];
  
  const stages: NeuralNode['stage'][] = ['intake', 'auth', 'rag', 'llm', 'post-process', 'response'];
  const pipeline: NeuralNode[] = stages.map(stage => ({
    stage,
    duration: Math.round(noise.gaussian(
      stage === 'llm' ? 850 : 25,
      stage === 'llm' ? 200 : 8
    )),
    status: Math.random() > 0.98 ? 'error' : (Math.random() > 0.92 ? 'skipped' : 'success'),
  }));
  const totalDuration = pipeline.reduce((sum, n) => sum + n.duration, 0);
  const tokensIn = Math.floor(noise.gaussian(800, 200));
  const tokensOut = Math.floor(noise.gaussian(400, 100));
  
  const costPerKToken = { 'gemini-pro': 0.00025, 'claude-sonnet': 0.003, 'gpt-4': 0.03, 'llama-70b': 0.0008 };
  const cost = ((tokensIn + tokensOut) / 1000) * costPerKToken[model];
  
  return {
    id: `nl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    userId: `user-${Math.floor(Math.random() * 9999)}`,
    model,
    pipeline,
    totalDuration,
    tokensIn,
    tokensOut,
    cost,
    status: pipeline.some(n => n.status === 'error') ? 'error' : 'success',
    cacheHit: Math.random() > 0.7,
  };
}

// ============================================================
// BLOCKCHAIN AUDIT (chainage de hashes)
// ============================================================

export function generateAuditBlock(prev: AuditBlock | null, action: string, actor: string, resource: string, payload: any): AuditBlock {
  const index = prev ? prev.index + 1 : 0;
  const timestamp = Date.now();
  const prevHash = prev?.hash || '0'.repeat(64);
  // Hash simple mais déterministe (en prod, utiliser crypto.subtle)
  const blockData = `${index}|${timestamp}|${action}|${actor}|${resource}|${JSON.stringify(payload)}|${prevHash}`;
  const hash = simpleHash(blockData);
  
  return {
    index,
    timestamp,
    action,
    actor,
    resource,
    payload,
    prevHash,
    hash,
    signature: `sig-${hash.slice(0, 16)}`,
  };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convertir en hex de 64 chars (style SHA-256)
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex + hex + hex + hex + hex).slice(0, 64);
}
