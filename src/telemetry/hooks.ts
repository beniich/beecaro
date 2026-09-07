import { useEffect } from 'react';
import { useTelemetryStore } from './store';
import { EventBus } from './EventBus';
import type { TelemetryEventMap } from './types';

import { useShallow } from 'zustand/react/shallow';

// Hook pour écouter les événements du bus
export function useTelemetryEvent<K extends keyof TelemetryEventMap>(
  type: K,
  handler: (payload: TelemetryEventMap[K]) => void
) {
  useEffect(() => {
    return EventBus.on(type, handler);
  }, [type, handler]);
}

// Hook pour accéder au store avec comparaison shallow par défaut pour éviter les re-renders inutiles
// et l'erreur "The result of getSnapshot should be cached"
export function useTelemetry<T>(selector: (state: ReturnType<typeof useTelemetryStore.getState>) => T): T {
  return useTelemetryStore(useShallow(selector));
}
