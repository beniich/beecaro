import React, { useEffect } from 'react';
import { TelemetryEngine } from './TelemetryEngine';

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    TelemetryEngine.start();
    return () => TelemetryEngine.stop();
  }, []);
  return <>{children}</>;
};
