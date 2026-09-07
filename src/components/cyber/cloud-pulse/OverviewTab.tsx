import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '../../../telemetry/hooks';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Cloud, Server, Activity, Zap } from 'lucide-react';

const PROVIDER_CONFIG = {
  aws: { name: 'AWS', color: '#ff9900', icon: '☁️' },
  gcp: { name: 'GCP', color: '#4285f4', icon: '🌐' },
  azure: { name: 'Azure', color: '#0078d4', icon: '⚡' },
  'self-hosted': { name: 'Self-Hosted', color: '#10b981', icon: '🏢' },
  edge: { name: 'Edge Network', color: '#06b6d4', icon: '🌍' },
};

export const OverviewTab: React.FC = () => {
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  const trafficHistory = useTelemetry(s => s.trafficHistory);
  
  // Distribution par provider
  const providerDistribution = useMemo(() => {
    return Object.entries(PROVIDER_CONFIG).map(([key, config]) => {
      const nodes = servers.filter(s => s.provider === key);
      const rps = nodes.reduce((sum, s) => sum + s.requestsPerSec, 0);
      const cpu = nodes.length > 0 ? nodes.reduce((sum, s) => sum + s.cpu, 0) / nodes.length : 0;
      const latency = nodes.length > 0 ? nodes.reduce((sum, s) => sum + s.p99Latency, 0) / nodes.length : 0;
      return {
        provider: config.name,
        color: config.color,
        icon: config.icon,
        nodes: nodes.length,
        rps,
        cpu,
        latency,
        healthy: nodes.filter(n => n.status === 'healthy').length,
        degraded: nodes.filter(n => n.status === 'degraded').length,
        critical: nodes.filter(n => n.status === 'critical').length,
      };
    }).filter(p => p.nodes > 0);
  }, [servers]);
  
  // Traffic global dans le temps
  const trafficData = trafficHistory.slice(-30).map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString().slice(0, 5),
    rps: d.requestsPerSec,
    p99: d.p99Latency,
  }));

  return (
    <div className="space-y-4">
      
      {/* PROVIDER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providerDistribution.map((p, i) => (
          <motion.div
            key={p.provider}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-slate-900 border-2 rounded-2xl p-5 cursor-pointer transition-all"
            style={{ borderColor: `${p.color}40` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.icon}</span>
                <h3 className="font-bold text-white">{p.provider}</h3>
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">
                {p.nodes} nodes 
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">RPS</div>
                <div className="text-xl font-bold" style={{ color: p.color }}>
                  {p.rps.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">P99 Latency</div>
                <div className="text-xl font-bold text-cyan-400">
                  {p.latency.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Avg CPU</div>
                <div className={`text-xl font-bold ${
                  p.cpu > 80 ? 'text-red-400' : p.cpu > 50 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {p.cpu.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Health</div>
                <div className="text-xl font-bold text-emerald-400">
                  {p.healthy}/{p.nodes}
                </div>
              </div>
            </div>
            
            {/* Mini status bar */}
            <div className="flex items-center gap-1 mt-3 h-2">
              {Array.from({ length: p.nodes }).map((_, idx) => (
                <div key={idx}
                  className={`flex-1 rounded-full ${
                    idx < p.critical ? 'bg-red-500' :
                    idx < p.critical + p.degraded ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Traffic Area Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Global Traffic (last 30s)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="trafficV9Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="latencyV9Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              <Area type="monotone" dataKey="rps" stroke="#0ea5e9" fill="url(#trafficV9Grad)" strokeWidth={2} />
              <Area type="monotone" dataKey="p99" stroke="#a855f7" fill="url(#latencyV9Grad)" strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Provider Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Node Distribution by Provider</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={providerDistribution}
                dataKey="nodes"
                nameKey="provider"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.provider}: ${entry.nodes}`}
              >
                {providerDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* RPS Bar Chart per Provider */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">RPS Distribution by Provider</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={providerDistribution} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" stroke="#475569" fontSize={10} />
            <YAxis dataKey="provider" type="category" stroke="#475569" fontSize={10} width={100} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
            <Bar dataKey="rps" radius={[0, 8, 8, 0]}>
              {providerDistribution.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
