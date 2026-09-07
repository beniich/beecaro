import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTelemetry } from '../../../telemetry/hooks';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

const PROVIDER_PRICING = {
  aws: { compute: 0.046, storage: 0.023, network: 0.09, name: 'AWS', color: '#ff9900' },
  gcp: { compute: 0.052, storage: 0.020, network: 0.08, name: 'GCP', color: '#4285f4' },
  azure: { compute: 0.048, storage: 0.021, network: 0.087, name: 'Azure', color: '#0078d4' },
  'self-hosted': { compute: 0.025, storage: 0.015, network: 0.04, name: 'Self-Hosted', color: '#10b981' },
  edge: { compute: 0.062, storage: 0.025, network: 0.12, name: 'Edge', color: '#06b6d4' },
};

export const CostTab: React.FC = () => {
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  
  // Calculerer par provider
  const costByProvider = useMemo(() => {
    return Object.entries(PROVIDER_PRICING).map(([key, pricing]) => {
      const nodes = servers.filter(s => s.provider === key);
      if (nodes.length === 0) return null;
      
      // Calcul simplifié : compute basé sur CPU, storage sur memory, network sur RPS
      const computeCost = nodes.reduce((s, n) => s + (n.cpu / 100) * pricing.compute * 24 * 30, 0);
      const storageCost = nodes.reduce((s, n) => s + (n.memory / 100) * pricing.storage * 24 * 30, 0);
      const networkCost = nodes.reduce((s, n) => s + (n.requestsPerSec / 1000) * pricing.network * 24 * 30, 0);
      
      return {
        provider: pricing.name,
        color: pricing.color,
        nodes: nodes.length,
        compute: computeCost,
        storage: storageCost,
        network: networkCost,
        total: computeCost + storageCost + networkCost,
      };
    }).filter(Boolean);
  }, [servers]);
  
  const totalMonthlyCost = costByProvider.reduce((s, c) => s + c!.total, 0);
  const projectedAnnualCost = totalMonthlyCost * 12;
  
  // Évolution sur 12 mois (projection)
  const costEvolution = Array.from({ length: 12 }, (_, i) => {
    const growth = 1 + (i * 0.05); // 5% croissance mensuelle
    return {
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      cost: totalMonthlyCost * growth,
    };
  });

  return (
    <div className="space-y-4">
      
      {/* TOP KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <CostKPI icon={<DollarSign />}
          label="Monthly Cost"
          value={`€${totalMonthlyCost.toFixed(2)}`}
          color="emerald"
        />
        <CostKPI
          icon={<TrendingUp />}
          label="Projected Annual"
          value={`€${projectedAnnualCost.toFixed(0)}`}
          color="amber"
        />
        <CostKPI
          icon={<Sparkles />}
          label="Most Expensive"
          value={[...costByProvider].sort((a, b) => b!.total - a!.total)[0]?.provider || 'N/A'}
          color="red"
        />
        <CostKPI
          icon={<TrendingDown />}
          label="Cheapest"
          value={[...costByProvider].sort((a, b) => a!.total - b!.total)[0]?.provider || 'N/A'}
          color="cyan"
        />
      </div>
      
      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Stacked Bar par service */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Cost Breakdown by Provider</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costByProvider}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="provider" stroke="#475569" fontSize={10} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
              <Legend />
              <Bar dataKey="compute" stackId="a" fill="#06b6d4" name="Compute" />
              <Bar dataKey="storage" stackId="a" fill="#a855f7" name="Storage" />
              <Bar dataKey="network" stackId="a" fill="#10b981" name="Network" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Cost Distribution Pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={costByProvider}
                dataKey="total"
                nameKey="provider"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `€${entry.total.toFixed(0)}`}
              >
                {costByProvider.map((entry, i) => (
                  <Cell key={i} fill={entry!.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* PROJECTION 12 MOIS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">12-Month Projection (5% monthly growth)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={costEvolution}>
            <defs>
              <linearGradient id="costProjGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#475569" fontSize={10} />
            <YAxis stroke="#475569" fontSize={10} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
            <Area type="monotone" dataKey="cost" stroke="#f59e0b" fill="url(#costProjGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* COST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase mb-3">Detailed Cost Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="text-left py-2">Provider</th>
                <th className="text-right py-2">Nodes</th>
                <th className="text-right py-2">Compute</th>
                <th className="text-right py-2">Storage</th>
                <th className="text-right py-2">Network</th>
                <th className="text-right py-2">Total Monthly</th>
                <th className="text-right py-2">€ / Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {costByProvider.map((c, i) => (
                <tr key={c!.provider} className="hover:bg-slate-800/40">
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c!.color }} />
                      <span className="font-mono font-bold">{c!.provider}</span>
                    </span>
                  </td>
                  <td className="text-right font-mono">{c!.nodes}</td>
                  <td className="text-right font-mono text-cyan-400">€{c!.compute.toFixed(2)}</td>
                  <td className="text-right font-mono text-purple-400">€{c!.storage.toFixed(2)}</td>
                  <td className="text-right font-mono text-emerald-400">€{c!.network.toFixed(2)}</td>
                  <td className="text-right font-mono font-bold text-amber-400">€{c!.total.toFixed(2)}</td>
                  <td className="text-right font-mono">€{(c!.total / c!.nodes).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-700 bg-slate-800/40 font-bold">
                <td className="py-3">TOTAL</td>
                <td className="text-right">{servers.length}</td>
                <td className="text-right text-cyan-400">
                  €{costByProvider.reduce((s, c) => s + c!.compute, 0).toFixed(2)}
                </td>
                <td className="text-right text-purple-400">
                  €{costByProvider.reduce((s, c) => s + c!.storage, 0).toFixed(2)}
                </td>
                <td className="text-right text-emerald-400">
                  €{costByProvider.reduce((s, c) => s + c!.network, 0).toFixed(2)}
                </td>
                <td className="text-right text-amber-400">€{totalMonthlyCost.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CostKPI: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'emerald' | 'amber' | 'red' | 'cyan';
}> = ({ icon, label, value, color }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  };
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </motion.div>
  );
};
