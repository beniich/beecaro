import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '../../../telemetry/hooks';
import { useTelemetryStore } from '../../../telemetry/store';
import { Shield, GitBranch, Power, RotateCw, Activity, AlertTriangle } from 'lucide-react';

interface FailoverEvent {
  id: string;
  timestamp: number;
  fromProvider: string;
  toProvider: string;
  reason: string;
  status: 'active' | 'pending' | 'failed';
  duration: number;
}

const SAMPLE_FAILOVERS: FailoverEvent[] = [
  {
    id: 'fo-001',
    timestamp: Date.now() - 1800000,
    fromProvider: 'AWS US-East-1',
    toProvider: 'GCP US-Central1',
    reason: 'Network latency threshold exceeded',
    status: 'active',
    duration: 45,
  },
  {
    id: 'fo-002',
    timestamp: Date.now() - 3600000,
    fromProvider: 'Azure EU-West',
    toProvider: 'Self-Hosted Frankfurt',
    reason: 'Cost optimization (peak hours)',
    status: 'active',
    duration: 120,
  },
  {
    id: 'fo-003',
    timestamp: Date.now() - 7200000,
    fromProvider: 'AWS US-West-2',
    toProvider: 'Edge Network',
    reason: 'Regional DDoS attack detected',
    status: 'failed',
    duration: 0,
  },
];

export const FailoverTab: React.FC = () => {
  const circuitBreakers = useTelemetry(s => s.circuitBreakers);
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  const toggleCircuitBreaker = useTelemetryStore(s => s.toggleCircuitBreaker);
  const [failovers] = useState<FailoverEvent[]>(SAMPLE_FAILOVERS);
  
  const trippedBreakers = Array.from(circuitBreakers);

  return (
    <div className="space-y-4">
      
      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          icon={<Shield />}
          label="Active Failovers"
          value={failovers.filter(f => f.status === 'active').length.toString()}
          color="emerald"
        />
        <StatusCard
          icon={<Power />}
          label="Circuit Breakers"
          value={trippedBreakers.length.toString()}
          color={trippedBreakers.length > 0 ? 'red' : 'slate'}
        />
        <StatusCard
          icon={<Activity />}
          label="Redundancy Level"
          value="N+2"
          color="cyan"
        />
      </div>
      
      {/* CIRCUIT BREAKERS */}
      {trippedBreakers.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-red-400 uppercase mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Active Circuit Breakers
          </h3>
          <div className="space-y-2">
            {trippedBreakers.map(id => {
              const server = servers.find(s => s.id === id);
              if (!server) return null;
              return (
                <div key={id}
                  className="p-3 bg-slate-900/50 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <code className="text-sm font-mono text-white">{server.hostname}</code>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {server.provider} • {server.region}
                    </div>
                  </div>
                  <button onClick={() => toggleCircuitBreaker(id)}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-mono hover:bg-emerald-500/30"
                  >
                    CLOSE BREAKER 
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* FAILOVER TIMELINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-sky-400" />
          Failover History
        </h3>
        <div className="space-y-3">
          {failovers.map((fo, i) => (
            <motion.div
              key={fo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-xl border ${
                  fo.status === 'active' ? 'bg-emerald-500/5 border-emerald-500/40' :
                  fo.status === 'pending' ? 'bg-amber-500/5 border-amber-500/40' :
                  'bg-red-500/5 border-red-500/40'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RotateCw className={`w-4 h-4 ${
                    fo.status === 'active' ? 'text-emerald-400' :
                    fo.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                  }`} />
                  <code className="text-xs font-mono text-slate-300">{fo.id}</code>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    fo.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    fo.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {fo.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(fo.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="text-slate-300">{fo.fromProvider}</span>
                <span className="text-slate-500">→</span>
                <span className="text-sky-400 font-bold">{fo.toProvider}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Reason: {fo.reason} • Duration: {fo.duration}s
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatusCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'emerald' | 'red' | 'cyan' | 'slate';
}> = ({ icon, label, value, color }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    red: 'bg-red-500/10 border-red-500/40 text-red-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    slate: 'bg-slate-800 border-slate-700 text-slate-400',
  };
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </motion.div>
  );
};
