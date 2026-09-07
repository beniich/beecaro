import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetry } from '../../telemetry/hooks';
import {
  Cloud, DollarSign, Activity, Server, Shield, GitBranch,
} from 'lucide-react';
import { OverviewTab } from './cloud-pulse/OverviewTab';
import { ProviderBreakdownTab } from './cloud-pulse/ProviderBreakdownTab';
import { NetworkTab } from './cloud-pulse/NetworkTab';
import { FailoverTab } from './cloud-pulse/FailoverTab';
import { ComplianceTab } from './cloud-pulse/ComplianceTab';
import { CostTab } from './cloud-pulse/CostTab';
import { CyberCockpitNav } from './CyberCockpitNav';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types/bizos';

type Tab = 'overview' | 'providers' | 'network' | 'failover' | 'compliance' | 'cost';

export const MultiCloudInfrastructure: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  const circuitBreakers = useTelemetry(s => s.circuitBreakers);
  const { profile, user } = useAuth();
  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Carter');
  
  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'providers', label: 'Providers', icon: <Cloud className="w-4 h-4" /> },
    { id: 'network', label: 'Network', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'failover', label: 'Failover', icon: <Shield className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" /> },
    { id: 'cost', label: 'Cost Analytics', icon: <DollarSign className="w-4 h-4" /> },
  ];

  // Stats globales multi-cloud
  const stats = useMemo(() => {
    const providers = {
      aws: servers.filter(s => s.provider === 'aws'),
      gcp: servers.filter(s => s.provider === 'gcp'),
      azure: servers.filter(s => s.provider === 'azure'),
      'self-hosted': servers.filter(s => s.provider === 'self-hosted'),
      edge: servers.filter(s => s.provider === 'edge'),
    };
    
    // Coût simulé par provider (en €/h)
    const costPerHour = {
      aws: 145.30,
      gcp: 89.50,
      azure: 72.20,
      'self-hosted': 34.80,
      edge: 198.40,
    };
    
    const totalCostPerHour = Object.entries(providers).reduce(
      (sum, [p, list]) => sum + (costPerHour[p as keyof typeof costPerHour] || 0) * (list.length > 0 ? 1 : 0),
      0
    );
    
    const totalRps = servers.reduce((s, srv) => s + srv.requestsPerSec, 0);
    const onlineNodes = servers.filter(s => s.status !== 'offline').length;
    
    return { providers, costPerHour, totalCostPerHour, totalRps, onlineNodes, totalNodes: servers.length };
  }, [servers]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-sky-500/30">
      <CyberCockpitNav
        currentCockpit="cloud-pulse"
        title="Cloud Pulse"
        onNavigate={onNavigate}
        adminName={displayName}
      />
      
      {/* HEADER */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30">
              <Cloud className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">V9 — Cloud Pulse</h1>
              <p className="text-sm text-slate-400">
                Multi-cloud orchestration • {stats.onlineNodes}/{stats.totalNodes} nodes online • {Object.values(stats.providers).filter(p => p.length > 0).length} providers
              </p>
            </div>
          </div>
          
          {/* TAB NAV */}
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800 overflow-x-auto custom-scrollbar">
            {tabs.map(tab => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* TOP KPIS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPICard icon={<Cloud />}
            label="Active Providers"
            value={Object.values(stats.providers).filter(p => p.length > 0).length.toString()}
            color="sky"
          />
          <KPICard
            icon={<Server />}
            label="Total Nodes"
            value={stats.totalNodes.toString()}
            color="cyan"
          />
          <KPICard
            icon={<Activity />}
            label="Total RPS"
            value={stats.totalRps.toLocaleString()}
            color="emerald"
          />
          <KPICard
            icon={<DollarSign />}
            label="Hourly Cost"
            value={`€${stats.totalCostPerHour.toFixed(2)}`}
            color="amber"
          />
          <KPICard
            icon={<Shield />}
            label="Failovers"
            value={circuitBreakers.size.toString()}
            color={circuitBreakers.size > 0 ? 'red' : 'slate'}
          />
        </div>
      </div>
      
      {/* CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'providers' && <ProviderBreakdownTab />}
            {activeTab === 'network' && <NetworkTab />}
            {activeTab === 'failover' && <FailoverTab />}
            {activeTab === 'compliance' && <ComplianceTab />}
            {activeTab === 'cost' && <CostTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const KPICard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'sky' | 'cyan' | 'emerald' | 'amber' | 'red' | 'slate';
}> = ({ icon, label, value, color }) => {
  const colors = {
    sky: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    slate: 'bg-slate-800 border-slate-700 text-slate-400',
  };
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </motion.div>
  );
};
