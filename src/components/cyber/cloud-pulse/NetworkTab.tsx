import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '../../../telemetry/hooks';
import { Network, Globe, ArrowRight } from 'lucide-react';

interface RegionConnection {
  from: string;
  to: string;
  latency: number;
  bandwidth: number; // Mbps
  status: 'optimal' | 'degraded' | 'down';
}

const REGIONS = [
  'us-east', 'us-west', 'eu-west', 'eu-central', 'asia-pacific', 'south-america',
];

export const NetworkTab: React.FC = () => {
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  
  // Calculer les connexions inter-régions
  const connections = useMemo<RegionConnection[]>(() => {
    const conns: RegionConnection[] = [];
    for (let i = 0; i < REGIONS.length; i++) {
      for (let j = i + 1; j < REGIONS.length; j++) {
        const fromRegion = REGIONS[i];
        const toRegion = REGIONS[j];
        
        // Latence basée sur distance géographique (approximation)
        const baseLatency = getLatencyEstimate(fromRegion, toRegion);
        const variance = Math.random() * 20 - 10;
        const latency = Math.max(5, Math.round(baseLatency + variance));
        
        // Bandwidth basé sur le tier
        const bandwidth = Math.round(1000 - latency * 5 + Math.random() * 200);
        
        const status: RegionConnection['status'] = 
          latency > 200 ? 'down' :
          latency > 150 ? 'degraded' :
          'optimal';
        
        conns.push({ from: fromRegion, to: toRegion, latency, bandwidth, status });
      }
    }
    return conns.sort((a, b) => a.latency - b.latency);
  }, [servers]);

  return (
    <div className="space-y-4">
      
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3 flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          Global Network Mesh — Inter-Region Latency
        </h3>
        
        {/* HEATMAP */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-500">FROM \\ TO</th>
                {REGIONS.map(r => (
                  <th key={r} className="p-2 text-slate-500 uppercase font-mono text-[10px]">
                    {r.replace('-', ' ').slice(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REGIONS.map(from => (
                <tr key={from}>
                  <td className="p-2 text-slate-400 font-mono uppercase text-[10px]">{from.replace('-', ' ').slice(0, 4)}</td>
                  {REGIONS.map(to => {
                    if (from === to) {
                      return <td key={to} className="p-2 bg-slate-800/50">—</td>;
                    }
                    const conn = connections.find(c => 
                      (c.from === from && c.to === to) || (c.from === to && c.to === from)
                    );
                    if (!conn) return <td key={to} className="p-2">?</td>;
                    
                    const color = getLatencyColor(conn.latency);
                    return (
                      <td key={to}
                        className="p-2 text-center font-mono font-bold rounded"
                        style={{ backgroundColor: `${color}30`, color }}
                        title={`Latency: ${conn.latency}ms | Bandwidth: ${conn.bandwidth}Mbps`}
                      >
                        {conn.latency}ms
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* TOP CONNECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">⚡ Fastest Routes</h3>
          <div className="space-y-2">
            {connections.slice(0, 8).map((conn, i) => (
              <ConnectionRow key={`fast-${i}`} conn={conn} rank={i + 1} />
            ))}
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">🐢 Slowest Routes</h3>
          <div className="space-y-2">
            {[...connections].reverse().slice(0, 8).map((conn, i) => (
              <ConnectionRow key={`slow-${i}`} conn={conn} rank={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionRow: React.FC<{ conn: RegionConnection; rank: number }> = ({ conn, rank }) => {
  const color = getLatencyColor(conn.latency);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-2 rounded-lg bg-slate-800/40 border border-slate-700 flex items-center gap-3"
    >
      <div className="text-[10px] font-mono text-slate-500 w-4">#{rank}</div>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs font-mono text-slate-300">{conn.from}</span>
        <ArrowRight className="w-3 h-3 text-slate-500" />
        <span className="text-xs font-mono text-slate-300">{conn.to}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono font-bold" style={{ color }}>
          {conn.latency}ms
        </div>
        <div className="text-[10px] text-slate-500">{conn.bandwidth}Mbps</div>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        conn.status === 'optimal' ? 'bg-emerald-400' :
        conn.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'
      }`} />
    </motion.div>
  );
};

function getLatencyEstimate(from: string, to: string): number {
  // Approximation basée sur la distance géographique
  const distances: Record<string, number> = {
    'us-east-us-west': 80,
    'us-east-eu-west': 90,
    'us-east-eu-central': 100,
    'us-east-asia-pacific': 180,
    'us-east-south-america': 130,
    'us-west-eu-west': 140,
    'us-west-asia-pacific': 130,
    'eu-west-eu-central': 20,
    'eu-west-asia-pacific': 200,
    'eu-central-asia-pacific': 180,
    'asia-pacific-south-america': 250,
  };
  
  const key1 = `${from}-${to}`;
  const key2 = `${to}-${from}`;
  return distances[key1] || distances[key2] || 150;
}

function getLatencyColor(latency: number): string {
  if (latency < 50) return '#10b981';
  if (latency < 100) return '#22c55e';
  if (latency < 150) return '#f59e0b';
  if (latency < 200) return '#f97316';
  return '#ef4444';
}
