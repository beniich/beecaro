import { useTelemetryStore } from './store';
import { EventBus } from './EventBus';
import { generateTrafficMetric, generateSecurityEvent, generateDatabaseMetric, generateNeuralRequest, generateAuditBlock } from './generators';
import { CoherenceResolver } from './CoherenceResolver';

class TelemetryEngineClass {
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🚀 TelemetryEngine started');
    
    // Métriques réseau : 1 par seconde
    this.intervals.push(setInterval(() => {
      const metric = generateTrafficMetric();
      useTelemetryStore.getState().addTrafficMetric(metric);
      EventBus.emit('METRIC_UPDATE', metric);
    }, 1000));
    
    // Métriques DB : 1 toutes les 2 secondes
    this.intervals.push(setInterval(() => {
      const metric = generateDatabaseMetric();
      useTelemetryStore.getState().addDatabaseMetric(metric);
      EventBus.emit('DATABASE_METRIC', metric);
    }, 2000));
    
    // Événements sécurité : 1-3 par seconde (variable)
    this.intervals.push(setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const event = generateSecurityEvent();
        useTelemetryStore.getState().addSecurityEvent(event);
        EventBus.emit('SECURITY_THREAT', event);
      }
    }, 1000));
    
    // Requêtes IA : 1-2 par seconde
    this.intervals.push(setInterval(() => {
      const request = generateNeuralRequest();
      useTelemetryStore.getState().addNeuralRequest(request);
      EventBus.emit('NEURAL_REQUEST', request);
    }, 1500));
    
    // Audit blocks : 1 toutes les 5 secondes
    this.intervals.push(setInterval(() => {
      const store = useTelemetryStore.getState();
      const lastBlock = store.auditChain[0] || null;
      const newBlock = generateAuditBlock(
        lastBlock,
        ['SERVER_HEALTH_CHECK', 'WAF_RULE_UPDATED', 'USER_AUTHENTICATED', 'CONFIG_CHANGED'][Math.floor(Math.random() * 4)],
        'system',
        `server-${Math.floor(Math.random() * 10)}`,
        { timestamp: Date.now() }
      );
      store.addAuditBlock(newBlock);
      EventBus.emit('AUDIT_BLOCK', newBlock);
    }, 5000));
    
    // Mise à jour serveurs : fluctuations réalistes
    this.intervals.push(setInterval(() => {
      const store = useTelemetryStore.getState();
      const updates = new Map<string, any>();
      
      store.servers.forEach(server => {
        if (store.circuitBreakers.has(server.id)) return; // Skip si breaker ouvert
        
        updates.set(server.id, {
          cpu: Math.max(0, Math.min(100, server.cpu + (Math.random() - 0.5) * 8)),
          memory: Math.max(0, Math.min(100, server.memory + (Math.random() - 0.5) * 5)),
          network: Math.max(0, Math.min(100, server.network + (Math.random() - 0.5) * 10)),
          p99Latency: Math.max(20, Math.min(500, server.p99Latency + (Math.random() - 0.5) * 15)),
        });
      });
      
      if (updates.size > 0) {
        store.batchUpdateServers(updates);
      }
    }, 3000));
    
    // Événements aléatoires (aléatoire pour simuler la réalité)
    this.intervals.push(setInterval(() => {
      if (Math.random() > 0.95) { // 5% de chance par check
        const store = useTelemetryStore.getState();
        const serverIds = Array.from(store.servers.keys());
        const randomServerId = serverIds[Math.floor(Math.random() * serverIds.length)];
        const eventType = Math.random() > 0.5 ? 'degraded' : 'critical';
        store.updateServer(randomServerId, { status: eventType });
        CoherenceResolver.onServerStatusChange(randomServerId, eventType);
      }
    }, 10000));
  }
  
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    console.log('⏸ TelemetryEngine stopped');
  }
  
  // Actions utilisateur
  tripCircuitBreaker(serverId: string) {
    useTelemetryStore.getState().toggleCircuitBreaker(serverId);
    CoherenceResolver.onCircuitBreakerTripped(serverId);
    EventBus.emit('CIRCUIT_BREAKER_TRIPPED', { serverId, reason: 'manual' });
    
    // Audit
    const lastBlock = useTelemetryStore.getState().auditChain[0] || null;
    const newBlock = generateAuditBlock(
      lastBlock,
      'CIRCUIT_BREAKER_TRIPPED',
      'admin',
      serverId,
      { reason: 'manual', timestamp: Date.now() }
    );
    useTelemetryStore.getState().addAuditBlock(newBlock);
  }
  
  changeWafLevel(level: 'medium' | 'high' | 'under-attack') {
    CoherenceResolver.onWafLevelChange(level);
    EventBus.emit('WAF_LEVEL_CHANGED', { level });
  }
  
  triggerAttack(serverId: string) {
    CoherenceResolver.triggerDdosAttack(serverId, 100);
  }
}

export const TelemetryEngine = new TelemetryEngineClass();
