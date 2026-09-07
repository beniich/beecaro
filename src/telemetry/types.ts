// ============================================================
// TYPES DE BASE
// ============================================================

export type Region = 'us-east' | 'us-west' | 'eu-west' | 'eu-central' | 'asia-pacific' | 'south-america';
export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'self-hosted' | 'edge';
export type Severity = 'info' | 'warning' | 'critical' | 'emergency';
export type AssetType = 'server' | 'database' | 'cache' | 'cdn' | 'load-balancer' | 'waf' | 'edge' | 'origin';

// ============================================================
// ENTITÉS MÉTIER
// ============================================================

export interface ServerNode {
  id: string;
  hostname: string;
  region: Region;
  coordinates: [number, number]; // [lng, lat]
  provider: CloudProvider;
  type: AssetType;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  cpu: number;        // 0-100
  memory: number;     // 0-100
  network: number;    // 0-100 (bandwidth usage)
  requestsPerSec: number;
  p99Latency: number; // ms
  uptime: number;     // seconds
  lastIncident: string;
  version: string;
}

export interface TrafficMetric {
  timestamp: number;
  requestsPerSec: number;
  bytesIn: number;
  bytesOut: number;
  errors: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: 'ddos' | 'sql-injection' | 'xss' | 'csrf' | 'brute-force' | 'rate-limit' | 'geo-block' | 'bot-detected';
  sourceIp: string;
  sourceCountry: string;
  sourceCoordinates: [number, number];
  targetEndpoint: string;
  severity: Severity;
  blocked: boolean;
  ruleId: string;
  payload?: string;
}

export interface DatabaseMetric {
  timestamp: number;
  activeConnections: number;
  queriesPerSec: number;
  avgQueryTime: number; // ms
  slowQueries: number;
  cacheHitRate: number; // 0-1
  replicationLag: number; // ms
  storageUsed: number; // GB
}

export interface NeuralRequest {
  id: string;
  timestamp: number;
  userId: string;
  model: 'gemini-pro' | 'claude-sonnet' | 'gpt-4' | 'llama-70b';
  pipeline: NeuralNode[];
  totalDuration: number; // ms
  tokensIn: number;
  tokensOut: number;
  cost: number; // USD
  status: 'success' | 'error' | 'timeout';
  cacheHit: boolean;
}

export interface NeuralNode {
  stage: 'intake' | 'auth' | 'rag' | 'llm' | 'post-process' | 'response';
  duration: number;
  status: 'success' | 'error' | 'skipped';
}

export interface AuditBlock {
  index: number;
  timestamp: number;
  action: string;
  actor: string;
  resource: string;
  payload: any;
  prevHash: string;
  hash: string;
  signature: string;
}

// ============================================================
// ÉVÉNEMENTS DU BUS
// ============================================================

export type TelemetryEventMap = {
  'METRIC_UPDATE': TrafficMetric;
  'SERVER_STATUS_CHANGE': { serverId: string; status: ServerNode['status'] };
  'SECURITY_THREAT': SecurityEvent;
  'DATABASE_METRIC': DatabaseMetric;
  'NEURAL_REQUEST': NeuralRequest;
  'AUDIT_BLOCK': AuditBlock;
  'CIRCUIT_BREAKER_TRIPPED': { serverId: string; reason: string };
  'TRAFFIC_REDIRECT': { from: string; to: string; ratio: number };
  'WAF_LEVEL_CHANGED': { level: 'medium' | 'high' | 'under-attack' };
};

export type TelemetryEventType = keyof TelemetryEventMap;

export type TelemetryEvent = {
  [K in TelemetryEventType]: { type: K; payload: TelemetryEventMap[K] }
}[TelemetryEventType];
