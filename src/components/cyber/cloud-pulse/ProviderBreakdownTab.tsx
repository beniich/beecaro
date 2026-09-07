import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '../../../telemetry/hooks';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Server, Cloud, Cpu, Database, Zap, Globe, Shield } from 'lucide-react';

const PROVIDERS = [
  { key: 'aws', name: 'AWS', color: '#ff9900', icon: '☁️', regions: 4 },
  { key: 'gcp', name: 'GCP', color: '#4285f4', icon: '🌐', regions: 3 },
  { key: 'azure', name: 'Azure', color: '#0078d4', icon: '⚡', regions: 3 },
  { key: 'self-hosted', name: 'Self-Hosted', color: '#10b981', icon: '🏢', regions: 2 },
  { key: 'edge', name: 'Edge Network', color: '#06b6d4', icon: '🌍', regions: 6 },
];

export const ProviderBreakdownTab: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('aws');
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  const trafficHistory = useTelemetry(s => s.trafficHistory);
  
  const providerServers = servers.filter(s => s.provider === selectedProvider);
  const config = PROVIDERS.find(p => p.key === selectedProvider)!;
  
  // Performance radar
  const radarData = [
    { metric: 'CPU Eff.', value: 100 - (providerServers.reduce((s, x) => s + x.cpu, 0) / (providerServers.length || 1) || 0) },
    { metric: 'Memory', value: 100 - (providerServers.reduce((s, x) => s + x.memory, 0) / (providerServers.length || 1) || 0) },
    { metric: 'Network', value: 100 - (providerServers.reduce((s, x) => s + x.network, 0) / (providerServers.length || 1) || 0) },
    { metric: 'Latency', value: Math.max(0, 100 - (providerServers.reduce((s, x) => s + x.p99Latency, 0) / (providerServers.length || 1) || 0)) },
    { metric: 'Uptime', value: 98 },
    { metric: 'Health', value: (providerServers.filter(s => s.status === 'healthy').length / (providerServers.length || 1) || 0) * 100 },
  ];

  // Historique trafic pour ce provider
  const providerTraffic = trafficHistory.slice(-30).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString().slice(0, 5),
    rps: d.requestsPerSec * (providerServers.length / (servers.length || 1)),
  }));
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      {/* PROVIDER SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Select Provider</h3>
        <div className="space-y-2">
          {PROVIDERS.map(p => {
            const count = servers.filter(s => s.provider === p.key).length;
            const isActive = selectedProvider === p.key;
            return (
              <motion.button key={p.key}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedProvider(p.key)}
                className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all ${
                  isActive ? 'border-current' : 'border-slate-700'
                }`}
                style={isActive ? { color: p.color, backgroundColor: `${p.color}15` } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="text-left">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-slate-500">{count} nodes</div>
                  </div>
                </div>
                {count > 0 && (
                  <span className="text-[10px] font-mono text-emerald-400">● ONLINE</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* DETAILS */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* HEADER */}
        <div className="bg-slate-900 border-2 rounded-2xl p-5"
          style={{ borderColor: `${config.color}40` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{config.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{config.name}</h2>
                <p className="text-xs text-slate-400 font-mono">{config.regions} regions • {providerServers.length} active nodes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: config.color }}>
                {providerServers.reduce((s, x) => s + x.requestsPerSec, 0).toLocaleString()}
              </div>
              <div className="text-[10px] uppercase text-slate-500 font-mono">Total RPS</div>
            </div>
          </div>
          
          {/* PERFORMANCE RADAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase mb-2">Performance Matrix</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis stroke="#475569" fontSize={9} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="value" stroke={config.color} fill={config.color} fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase mb-2">Traffic History</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={providerTraffic}>
                  <defs>
                    <linearGradient id="lineGradV9" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={config.color} />
                      <stop offset="100%" stopColor="#fff" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                  <Line type="monotone" dataKey="rps" stroke="url(#lineGradV9)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* NODES LIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Active Nodes ({providerServers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {providerServers.map(server => (
              <div key={server.id}
                className={`p-3 rounded-xl border ${
                  server.status === 'critical' ? 'border-red-500/40 bg-red-500/5' :
                  server.status === 'degraded' ? 'border-amber-500/40 bg-amber-500/5' :
                  'border-slate-700 bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs font-mono text-white">{server.hostname}</code>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    server.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                    server.status === 'degraded' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {server.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <div className="text-slate-500 uppercase">CPU</div>
                    <div className="font-mono font-bold">{server.cpu.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase">P99</div>
                    <div className="font-mono font-bold text-cyan-400">{server.p99Latency.toFixed(0)}ms</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase">RPS</div>
                    <div className="font-mono font-bold text-purple-400">{server.requestsPerSec}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
