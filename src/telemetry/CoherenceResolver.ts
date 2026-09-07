import { useTelemetryStore } from './store';
import { EventBus } from './EventBus';
import { generateSecurityEvent, generateTrafficMetric } from './generators';

/**
 * Résolveur de cohérence : quand une action se produit (ex: circuit breaker),
 * propage les effets aux autres dashboards.
 */
export class CoherenceResolver {
  
  // Circuit breaker → impact sur latence des serveurs dépendants
  static onCircuitBreakerTripped(serverId: string) {
    const store = useTelemetryStore.getState();
    const server = store.servers.get(serverId);
    
    if (!server) return;
    
    // Si on coupe un edge server, le trafic se reporte sur les autres
    // → augmentation CPU + latence sur les voisins
    const isEdge = server.type === 'edge';
    
    if (isEdge) {
      store.servers.forEach((s, id) => {
        if (id !== serverId && s.type === 'edge' && s.region === server.region) {
          store.updateServer(id, {
            cpu: Math.min(100, s.cpu + Math.random() * 20),
            network: Math.min(100, s.network + Math.random() * 15),
            requestsPerSec: s.requestsPerSec + Math.floor(server.requestsPerSec / 2),
            p99Latency: s.p99Latency + Math.floor(Math.random() * 50),
          });
        }
      });
    }
    
    // Si on coupe une DB → impact sur tous les serveurs
    if (server.type === 'database') {
      store.servers.forEach((s, id) => {
        if (id !== serverId) {
          store.updateServer(id, {
            p99Latency: s.p99Latency + Math.floor(Math.random() * 100 + 50),
          });
        }
      });
    }
  }
  
  // Attaque massive → déclenchée aléatoirement ou via UI
  static triggerDdosAttack(targetServerId: string, intensity: number = 1000) {
    const store = useTelemetryStore.getState();
    const target = store.servers.get(targetServerId);
    
    if (!target) return;
    
    // Générer une rafale d'événements de sécurité
    for (let i = 0; i < intensity; i++) {
      setTimeout(() => {
        const event = generateSecurityEvent();
        event.targetEndpoint = '/api/' + (['auth', 'tickets', 'workorders'][Math.floor(Math.random() * 3)]);
        store.addSecurityEvent(event);
      }, i * 10);
    }
    
    // Impact sur le serveur cible
    store.updateServer(targetServerId, {
      cpu: Math.min(100, target.cpu + 40),
      network: Math.min(100, target.network + 60),
      status: 'critical',
      p99Latency: target.p99Latency + 500,
    });
  }
  
  // WAF level change → impact sur le taux de blocage
  static onWafLevelChange(level: 'medium' | 'high' | 'under-attack') {
    const store = useTelemetryStore.getState();
    store.setWafLevel(level);
    
    if (level === 'under-attack') {
      // Mode "I'm under attack" : bloque le trafic malveillant, latence légèrement plus haute
      store.servers.forEach(s => {
        if (s.type === 'edge') {
          store.updateServer(s.id, {
            cpu: Math.min(100, s.cpu + 30),
          });
        }
      });
    }
  }
  
  // Server degradation cascade
  static onServerStatusChange(serverId: string, newStatus: 'healthy' | 'degraded' | 'critical' | 'offline') {
    const store = useTelemetryStore.getState();
    const server = store.servers.get(serverId);
    
    if (!server) return;
    
    // Si un edge tombe → rediriger trafic
    if (newStatus === 'offline' && server.type === 'edge') {
      store.servers.forEach(s => {
        if (s.type === 'edge' && s.region === server.region && s.id !== serverId) {
          store.addTrafficRedirect(serverId, s.id, 100);
          store.updateServer(s.id, {
            requestsPerSec: s.requestsPerSec + server.requestsPerSec,
            status: s.status === 'healthy' ? 'degraded' : s.status,
          });
        }
      });
    }
  }
}
