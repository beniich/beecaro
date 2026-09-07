import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { useTelemetry } from '../../telemetry/hooks';
import { 
  Brain, Cpu, Zap, Activity, Clock, Layers, 
  Coins, Database, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { CyberCockpitNav } from './CyberCockpitNav';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types/bizos';

export const NeuralEngineArchitect: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Carter');

  const neuralRequests = useTelemetry(s => s.neuralRequests);
  
  const latestRequest = neuralRequests[0];
  const stats = React.useMemo(() => {
    if (neuralRequests.length === 0) return { avgDuration: 0, totalTokens: 0, avgCost: 0, successRate: 0 };
    const success = neuralRequests.filter(r => r.status === 'success').length;
    const totalDuration = neuralRequests.reduce((sum, r) => sum + r.totalDuration, 0);
    const totalTokens = neuralRequests.reduce((sum, r) => sum + r.tokensIn + r.tokensOut, 0);
    const totalCost = neuralRequests.reduce((sum, r) => sum + r.cost, 0);
    
    return {
      avgDuration: totalDuration / neuralRequests.length,
      totalTokens,
      avgCost: totalCost / neuralRequests.length,
      successRate: (success / neuralRequests.length) * 100
    };
  }, [neuralRequests]);

  const modelDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    neuralRequests.forEach(r => {
      counts[r.model] = (counts[r.model] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [neuralRequests]);

  return (
    <div className="min-h-screen bg-[#07040f] text-white flex flex-col font-sans selection:bg-purple-500/30">
      <CyberCockpitNav
        currentCockpit="neural-engine"
        title="Neural Engine Architect"
        onNavigate={onNavigate}
        adminName={displayName}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* TOP KPI BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard 
            icon={<Clock className="w-5 h-5" />} 
            label="Avg Latency" 
            value={`${stats.avgDuration.toFixed(0)}ms`}
            color="purple"
          />
          <KPICard 
            icon={<Coins className="w-5 h-5" />} 
            label="Avg Cost / Req" 
            value={`$${stats.avgCost.toFixed(4)}`}
            color="amber"
          />
          <KPICard 
            icon={<Zap className="w-5 h-5" />} 
            label="Total Tokens" 
            value={stats.totalTokens.toLocaleString()}
            color="cyan"
          />
          <KPICard 
            icon={<Activity className="w-5 h-5" />} 
            label="Success Rate" 
            value={`${stats.successRate.toFixed(1)}%`}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LATEST PIPELINE FLOW */}
          <div className="lg:col-span-2 bg-[#0b0616] border border-purple-500/20 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Live Pipeline Execution
              </h2>
              {latestRequest && (
                <span className="text-[10px] font-mono text-purple-400">ID: {latestRequest.id}</span>
              )}
            </div>

            {latestRequest ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between relative px-4">
                  {/* Connection Line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/10 via-purple-500/40 to-purple-500/10 -translate-y-1/2 -z-0" />
                  
                  {latestRequest.pipeline.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                          step.status === 'success' 
                            ? 'bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        <StepIcon stage={step.stage} />
                      </motion.div>
                      <div className="text-center">
                        <div className="text-[10px] font-mono text-white font-bold uppercase">{step.stage}</div>
                        <div className="text-[9px] font-mono text-slate-500">{step.duration}ms</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Model</div>
                    <div className="text-sm font-mono font-bold text-white">{latestRequest.model}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Tokens (In/Out)</div>
                    <div className="text-sm font-mono font-bold text-white">{latestRequest.tokensIn} / {latestRequest.tokensOut}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Execution Status</div>
                    <div className={`text-sm font-mono font-bold flex items-center gap-1 ${
                      latestRequest.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {latestRequest.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {latestRequest.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
                Waiting for neural stream...
              </div>
            )}
          </div>

          {/* MODEL DISTRIBUTION */}
          <div className="bg-[#0b0616] border border-purple-500/20 rounded-2xl p-6">
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-6">Model Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={modelDistribution} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {modelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#a855f7', '#06b6d4', '#f59e0b', '#10b981'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="bg-[#0b0616] border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">Neural Traffic Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  <th className="pb-3 font-normal">Timestamp</th>
                  <th className="pb-3 font-normal">Request ID</th>
                  <th className="pb-3 font-normal">Model</th>
                  <th className="pb-3 font-normal">Latency</th>
                  <th className="pb-3 font-normal">Tokens</th>
                  <th className="pb-3 font-normal">Cost</th>
                  <th className="pb-3 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {neuralRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 text-slate-500">{new Date(req.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 text-purple-400">{req.id.split('-').pop()}</td>
                    <td className="py-3 font-bold text-slate-200">{req.model}</td>
                    <td className="py-3 text-slate-400">{req.totalDuration}ms</td>
                    <td className="py-3 text-slate-400">{req.tokensIn + req.tokensOut}</td>
                    <td className="py-3 text-amber-500/80">${req.cost.toFixed(5)}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        req.status === 'success' ? 'bg-emerald-950/30 text-emerald-400' : 'bg-red-950/30 text-red-400'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  color: 'purple' | 'amber' | 'cyan' | 'emerald';
}> = ({ icon, label, value, color }) => {
  const colors = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
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

const StepIcon: React.FC<{ stage: string }> = ({ stage }) => {
  switch (stage) {
    case 'intake': return <Zap className="w-5 h-5" />;
    case 'auth': return <Shield className="w-5 h-5" />;
    case 'rag': return <Database className="w-5 h-5" />;
    case 'llm': return <Brain className="w-5 h-5" />;
    case 'post-process': return <Cpu className="w-5 h-5" />;
    case 'response': return <ChevronRight className="w-5 h-5" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

const Shield = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
);
