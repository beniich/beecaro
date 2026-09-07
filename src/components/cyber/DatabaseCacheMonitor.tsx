import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { useTelemetry } from '../../telemetry/hooks';
import { 
  Database, HardDrive, Zap, AlertTriangle, Activity, 
  Clock, GitBranch, Server, TrendingUp, Search, Filter, Download
} from 'lucide-react';
import { CyberCockpitNav } from './CyberCockpitNav';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types/bizos';

export const DatabaseCacheMonitor: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Carter');

  const dbHistory = useTelemetry(s => s.databaseHistory);
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  
  const dbServers = servers.filter(s => s.type === 'database');
  const cacheServers = servers.filter(s => s.type === 'cache');
  
  const current = dbHistory[dbHistory.length - 1] || {
    timestamp: Date.now(),
    activeConnections: 145,
    queriesPerSec: 3200,
    avgQueryTime: 8,
    slowQueries: 3,
    cacheHitRate: 0.94,
    replicationLag: 15,
    storageUsed: 847,
  };

  const chartData = dbHistory.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString().slice(0, 8),
    qps: d.queriesPerSec,
    latency: d.avgQueryTime,
    hitRate: d.cacheHitRate * 100
  }));

  return (
    <div className="min-h-screen bg-[#07040f] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      <CyberCockpitNav
        currentCockpit="database-monitor"
        title="Database & Cache Monitor"
        onNavigate={onNavigate}
        adminName={displayName}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* KPI ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            icon={<Database className="w-5 h-5" />} 
            label="Active Connections" 
            value={current.activeConnections.toString()}
            color="purple"
          />
          <KPICard 
            icon={<Activity className="w-5 h-5" />} 
            label="Queries / Sec" 
            value={current.queriesPerSec.toLocaleString()}
            color="cyan"
          />
          <KPICard 
            icon={<TrendingUp className="w-5 h-5" />} 
            label="Cache Hit Rate" 
            value={`${(current.cacheHitRate * 100).toFixed(1)}%`}
            color="emerald"
          />
          <KPICard 
            icon={<AlertTriangle className="w-5 h-5" />} 
            label="Slow Queries" 
            value={current.slowQueries.toString()}
            color={current.slowQueries > 5 ? 'red' : 'amber'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TRAFFIC CHART */}
          <div className="bg-[#0b0616] border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-6">Database Traffic (QPS)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="qpsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="qps" stroke="#10b981" fill="url(#qpsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* LATENCY CHART */}
          <div className="bg-[#0b0616] border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-6">Query Latency (MS)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="latency" stroke="#06b6d4" fill="url(#latGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REPLICATION TOPOLOGY */}
        <div className="bg-[#0b0616] border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> Replication Topology
            </h2>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Lag: {current.replicationLag}ms
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-4">
            {/* PRIMARY */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-emerald-500/50 flex flex-col items-center justify-center bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <Database className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold">PRIMARY</span>
                <span className="text-xs font-mono text-slate-400">db-master-01</span>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
              >
                <Zap className="w-3 h-3 text-black" />
              </motion.div>
            </div>

            {/* FLOW INDICATOR */}
            <div className="flex flex-col items-center gap-2">
              <motion.div 
                animate={{ x: [0, 40, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-12 h-1 bg-gradient-to-r from-emerald-500/20 to-emerald-500"
              />
              <span className="text-[10px] font-mono text-slate-500">SYNC STREAMING</span>
            </div>

            {/* REPLICA */}
            <div className="w-40 h-40 rounded-full border-4 border-cyan-500/30 flex flex-col items-center justify-center bg-cyan-500/5">
              <HardDrive className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-[10px] font-mono text-cyan-400 font-bold">REPLICA</span>
              <span className="text-xs font-mono text-slate-400">db-slave-01</span>
            </div>
          </div>
        </div>

        {/* NODE LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0b0616] border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">DB Engine Logs</h2>
            <div className="space-y-3">
              {[
                { time: '14:32:01', level: 'INFO', msg: 'Checkpoint starting' },
                { time: '14:31:55', level: 'WARN', msg: 'High load detected on replica' },
                { time: '14:30:22', level: 'INFO', msg: 'Auto-vacuum completed on assets' },
                { time: '14:28:10', level: 'INFO', msg: 'Replication slot master_01 active' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px] font-mono border-b border-white/5 pb-2">
                  <span className="text-slate-500">{log.time}</span>
                  <span className={log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'}>{log.level}</span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0b0616] border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">Storage Usage</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400">PostgreSQL (Primary)</span>
                  <span className="text-white">847GB / 1TB</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '84.7%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400">Redis Cache</span>
                  <span className="text-white">1.2GB / 4GB</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
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
  color: 'purple' | 'cyan' | 'emerald' | 'amber' | 'red';
}> = ({ icon, label, value, color }) => {
  const colors = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    red: 'bg-red-500/10 border-red-500/20 text-red-500',
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-2xl border ${colors[color]} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-3 opacity-80">
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">{label}</div>
    </motion.div>
  );
};
