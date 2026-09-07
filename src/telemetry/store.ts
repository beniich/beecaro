import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { TrafficMetric, DatabaseMetric, SecurityEvent, NeuralRequest, AuditBlock, ServerNode } from './types';
import { SERVER_FLEET } from './config';

interface TelemetryState {
  // Time series (ring buffer 60 points = 1 minute à 1Hz)
  trafficHistory: TrafficMetric[];
  databaseHistory: DatabaseMetric[];
  
  // Events
  securityEvents: SecurityEvent[]; // 100 derniers
  neuralRequests: NeuralRequest[]; // 50 derniers
  
  // Servers
  servers: Map<string, ServerNode>;
  
  // Audit chain
  auditChain: AuditBlock[];
  
  // Actions (pour circuit breakers, etc.)
  circuitBreakers: Set<string>;
  wafLevel: 'medium' | 'high' | 'under-attack';
  trafficRedirects: Map<string, string>;
  
  // Setters
  addTrafficMetric: (m: TrafficMetric) => void;
  addDatabaseMetric: (m: DatabaseMetric) => void;
  addSecurityEvent: (e: SecurityEvent) => void;
  addNeuralRequest: (r: NeuralRequest) => void;
  addAuditBlock: (b: AuditBlock) => void;
  updateServer: (id: string, updates: Partial<ServerNode>) => void;
  batchUpdateServers: (updates: Map<string, Partial<ServerNode>>) => void;
  setServers: (newServers: Map<string, ServerNode>) => void;
  toggleCircuitBreaker: (serverId: string) => void;
  setWafLevel: (level: 'medium' | 'high' | 'under-attack') => void;
  addTrafficRedirect: (from: string, to: string, ratio: number) => void;
}

const MAX_TRAFFIC_POINTS = 60;
const MAX_DB_POINTS = 60;
const MAX_SECURITY_EVENTS = 100;
const MAX_NEURAL_REQUESTS = 50;
const MAX_AUDIT_BLOCKS = 1000;

// Initial servers
const initialServers = new Map<string, ServerNode>(
  SERVER_FLEET.map(s => [
    s.id,
    {
      ...s,
      coordinates: [0, 0], // Populated properly in a real setup or by config
      status: 'healthy',
      cpu: Math.random() * 30 + 10,
      memory: Math.random() * 30 + 20,
      network: Math.random() * 40 + 10,
      requestsPerSec: Math.floor(Math.random() * 500 + 100),
      p99Latency: Math.floor(Math.random() * 50 + 30),
      uptime: Math.floor(Math.random() * 1000000),
      lastIncident: '2025-01-10T14:30:00Z',
      version: 'v8.2.1',
    } as ServerNode,
  ])
);

export const useTelemetryStore = create<TelemetryState>()(
  subscribeWithSelector((set) => ({
    trafficHistory: [],
    databaseHistory: [],
    securityEvents: [],
    neuralRequests: [],
    servers: initialServers,
    auditChain: [],
    circuitBreakers: new Set(),
    wafLevel: 'high',
    trafficRedirects: new Map(),
    
    addTrafficMetric: (m) => set((state) => ({
      trafficHistory: [...state.trafficHistory, m].slice(-MAX_TRAFFIC_POINTS),
    })),
    
    addDatabaseMetric: (m) => set((state) => ({
      databaseHistory: [...state.databaseHistory, m].slice(-MAX_DB_POINTS),
    })),
    
    addSecurityEvent: (e) => set((state) => ({
      securityEvents: [e, ...state.securityEvents].slice(0, MAX_SECURITY_EVENTS),
    })),
    
    addNeuralRequest: (r) => set((state) => ({
      neuralRequests: [r, ...state.neuralRequests].slice(0, MAX_NEURAL_REQUESTS),
    })),
    
    addAuditBlock: (b) => set((state) => ({
      auditChain: [b, ...state.auditChain].slice(0, MAX_AUDIT_BLOCKS),
    })),
    
    updateServer: (id, updates) => set((state) => {
      const server = state.servers.get(id);
      if (!server) return state;
      const newServers = new Map(state.servers);
      newServers.set(id, { ...server, ...updates });
      return { servers: newServers };
    }),
    
    batchUpdateServers: (updates) => set((state) => {
      const newServers = new Map(state.servers);
      let changed = false;
      updates.forEach((data, id) => {
        const server = newServers.get(id);
        if (server) {
          newServers.set(id, { ...server, ...data });
          changed = true;
        }
      });
      return changed ? { servers: newServers } : state;
    }),

    setServers: (newServers) => set({ servers: newServers }),
    
    toggleCircuitBreaker: (serverId) => set((state) => {
      const newBreakers = new Set(state.circuitBreakers);
      if (newBreakers.has(serverId)) {
        newBreakers.delete(serverId);
      } else {
        newBreakers.add(serverId);
      }
      return { circuitBreakers: newBreakers };
    }),
    
    setWafLevel: (level) => set({ wafLevel: level }),
    
    addTrafficRedirect: (from, to, ratio) => set((state) => {
      const newRedirects = new Map(state.trafficRedirects);
      newRedirects.set(from, `${to}:${ratio}%`);
      return { trafficRedirects: newRedirects };
    }),
  }))
);
