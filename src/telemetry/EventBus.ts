import mitt from 'mitt';
import type { TelemetryEventMap } from './types';

// Singleton pattern
class EventBusClass {
  private emitter = mitt<TelemetryEventMap>();
  
  emit<K extends keyof TelemetryEventMap>(type: K, payload: TelemetryEventMap[K]) {
    this.emitter.emit(type, payload);
  }
  
  on<K extends keyof TelemetryEventMap>(type: K, handler: (payload: TelemetryEventMap[K]) => void) {
    this.emitter.on(type, handler);
    return () => this.emitter.off(type, handler);
  }
  
  off<K extends keyof TelemetryEventMap>(type: K, handler: (payload: TelemetryEventMap[K]) => void) {
    this.emitter.off(type, handler);
  }
  
  clear() {
    this.emitter.all.clear();
  }
}

export const EventBus = new EventBusClass();
