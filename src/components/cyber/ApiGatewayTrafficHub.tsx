import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Cell,
} from 'recharts';
import { useTelemetry } from '../../telemetry/hooks';
import { TelemetryEngine } from '../../telemetry/TelemetryEngine';
import { Shield, Zap, Globe, AlertTriangle, Activity, Wifi } from 'lucide-react';
import { CyberCockpitNav } from './CyberCockpitNav';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types/bizos';

interface ApiGatewayTrafficHubProps {
  onNavigate?: (page: NavigationPage) => void;
}

export const ApiGatewayTrafficHub: React.FC<ApiGatewayTrafficHubProps> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Carter');

  const traffic = useTelemetry(s => s.trafficHistory);
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  const wafLevel = useTelemetry(s => s.wafLevel);
  const securityEvents = useTelemetry(s => s.securityEvents);
  
  const current = traffic[traffic.length - 1] || { requestsPerSec: 0, p99Latency: 0, errors: 0, p50Latency: 0, p95Latency: 0 };
  const blockedAttacks = securityEvents.filter(e => e.blocked).length;
  
  const setWaf = (level: 'medium' | 'high' | 'under-attack') => {
    TelemetryEngine.changeWafLevel(level);
  };
  
  return (
    <div className="min-h-screen bg-[#07040f] text-white flex flex-col font-sans selection:bg-orange-500/30">
      
      {/* HEADER */}
      <CyberCockpitNav
        currentCockpit="traffic-hub"
        title="API Gateway Traffic Hub"
        onNavigate={onNavigate}
        adminName={displayName}
      />
      
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-[#ff9a00]" />
              <h1 className="text-3xl font-bold">V8 — Traffic Hub</h1>
            </div>
            <p className="text-slate-400">Real-time global traffic & WAF command center</p>
          </div>
          
          {/* WAF Level Selector */}
          <div className="flex items-center gap-2 bg-slate-900/60 rounded-xl p-1 border border-slate-800">
            {(['medium', 'high', 'under-attack'] as const).map(level => (
              <button
                key={level}
                onClick={() => setWaf(level)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  wafLevel === level
                    ? level === 'under-attack' 
                      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                      : 'bg-orange-500 text-[#07040f] shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {level === 'under-attack' ? "I'm Under Attack" : level}
              </button>
            ))}
          </div>
        </div>
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            icon={<Zap className="w-5 h-5" />}
            label="Requests/sec"
            value={current.requestsPerSec.toLocaleString()}
            trend="up"
            color="orange"
          />
          <KPICard
            icon={<Activity className="w-5 h-5" />}
            label="P99 Latency"
            value={`${current.p99Latency}ms`}
            trend={current.p99Latency > 200 ? 'down' : 'stable'}
            color={current.p99Latency > 200 ? 'red' : 'emerald'}
          />
          <KPICard
            icon={<Shield className="w-5 h-5" />}
            label="Blocked Threats"
            value={blockedAttacks.toString()}
            color="red"
          />
          <KPICard
            icon={<Globe className="w-5 h-5" />}
            label="Active Regions"
            value={new Set(servers.map(s => s.region)).size.toString()}
            color="blue"
          />
        </div>

        {/* TRAFFIC CHART */}
        <div className="bg-[#0b0616] border border-[#ff9a00]/20 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-mono text-slate-400 uppercase mb-4">Live Traffic Stream</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={traffic}>
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(t) => new Date(t).toLocaleTimeString().slice(0, 5)}
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                labelFormatter={(t) => new Date(t as number).toLocaleTimeString()}
              />
              <Area type="monotone" dataKey="requestsPerSec" stroke="#f97316" fill="url(#trafficGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="p99Latency" stroke="#3b82f6" fill="url(#latencyGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* LATENCY BREAKDOWN & SERVER TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* P50/P95/P99 Distribution */}
          <div className="bg-[#0b0616] border border-[#ff9a00]/20 rounded-2xl p-6">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">Latency Distribution (ms)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { percentile: 'P50', value: current.p50Latency || 12 },
                { percentile: 'P95', value: current.p95Latency || 95 },
                { percentile: 'P99', value: current.p99Latency },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="percentile" stroke="#475569" tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Server Latency List */}
          <div className="bg-[#0b0616] border border-[#ff9a00]/20 rounded-2xl p-6">
            <h3 className="text-sm font-mono text-slate-400 uppercase mb-4">Servers by Latency</h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {servers
                .sort((a, b) => b.p99Latency - a.p99Latency)
                .map(server => (
                  <div key={server.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        server.status === 'healthy' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                        server.status === 'degraded' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
                        server.status === 'critical' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'bg-slate-500'
                      }`} />
                      <span className="text-xs font-mono">{server.hostname}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${
                      server.p99Latency > 200 ? 'text-red-400' :
                      server.p99Latency > 100 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {server.p99Latency.toFixed(0)}ms
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* SECURITY LOG */}
        <div className="bg-[#0b0616] border border-[#ff9a00]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono text-slate-400 uppercase">Live Security Log</h2>
            <button
              onClick={() => TelemetryEngine.triggerAttack('edge-dub-01')}
              className="text-xs font-mono px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> 
              Simulate DDoS Attack 
            </button>
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto font-mono text-[11px] pr-2 custom-scrollbar">
            {securityEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-2 rounded border flex items-center justify-between gap-3 ${
                  event.blocked
                    ? 'bg-emerald-950/20 border-emerald-800/30'
                    : event.severity === 'critical' || event.severity === 'emergency'
                    ? 'bg-red-950/20 border-red-800/30'
                    : 'bg-amber-950/20 border-amber-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                    event.blocked 
                      ? 'bg-emerald-900/50 text-emerald-400'
                      : event.severity === 'critical' || event.severity === 'emergency' 
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-amber-900/50 text-amber-400'
                  }`}>
                    {event.blocked ? 'BLOCKED' : 'THREAT'}
                  </span>
                  <span className="text-gray-200">{event.type}</span>
                  <span className="text-slate-500 hidden sm:inline">from {event.sourceIp} ({event.sourceCountry})</span>
                  <span className="text-slate-400">→ {event.targetEndpoint}</span>
                </div>
                <span className="text-slate-500">{event.ruleId}</span>
              </motion.div>
            ))}
            {securityEvents.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                No recent security events detected.
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

const KPICard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  color: 'orange' | 'red' | 'emerald' | 'blue';
}> = ({ icon, label, value, trend, color }) => {
  const colors = {
    orange: 'bg-orange-500/10 border-[#ff9a00]/20 text-[#ff9a00]',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-2xl border ${colors[color]} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-3 opacity-80">
        {icon}
        {trend && (
          <span className="text-xs">
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">{label}</div>
    </motion.div>
  );
};
