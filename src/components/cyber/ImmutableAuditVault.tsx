import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, Hash, Database, Link as LinkIcon, 
  Search, Filter, ExternalLink, CheckCircle2, AlertCircle,
  FileText, History, Clock, Server, Download
} from 'lucide-react';
import { CyberCockpitNav } from './CyberCockpitNav';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types/bizos';

interface Block {
  hash: string;
  previousHash: string;
  timestamp: number;
  nonce: number;
  transactions: string[];
  status: 'confirmed' | 'pending' | 'validating';
}

export const ImmutableAuditVault: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Carter');

  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const initialBlocks: Block[] = Array.from({ length: 8 }, (_, i) => ({
      hash: Math.random().toString(16).substring(2, 66),
      previousHash: Math.random().toString(16).substring(2, 66),
      timestamp: Date.now() - (i * 15000),
      nonce: Math.floor(Math.random() * 100000),
      transactions: [
        `AUTH_LOGIN: user_${Math.floor(Math.random() * 100)}`,
        `CONFIG_CHANGE: threshold_${Math.floor(Math.random() * 5)}`,
        `DATA_EXPORT: report_monthly_${i}`
      ],
      status: 'confirmed'
    }));
    setBlocks(initialBlocks);

    const interval = setInterval(() => {
      setBlocks(prev => {
        const newBlock: Block = {
          hash: Math.random().toString(16).substring(2, 66),
          previousHash: prev[0]?.hash || '0'.repeat(64),
          timestamp: Date.now(),
          nonce: Math.floor(Math.random() * 100000),
          transactions: [
            `TELEMETRY_SYNC: node_${Math.floor(Math.random() * 50)}`,
            `ALERT_RESOLVED: id_${Math.floor(Math.random() * 1000)}`
          ],
          status: 'confirmed'
        };
        return [newBlock, ...prev.slice(0, 19)];
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07040f] text-white flex flex-col font-sans selection:bg-amber-500/30">
      <CyberCockpitNav
        currentCockpit="audit-vault"
        title="Immutable Audit Vault"
        onNavigate={onNavigate}
        adminName={displayName}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* NETWORK STATUS BAR */}
        <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <StatusItem icon={<ShieldCheck className="w-4 h-4" />} label="Chain Status" value="Operational" color="emerald" />
          <StatusItem icon={<Server className="w-4 h-4" />} label="Active Nodes" value="24" color="blue" />
          <StatusItem icon={<Clock className="w-4 h-4" />} label="Block Time" value="15.2s" color="purple" />
          <StatusItem icon={<Lock className="w-4 h-4" />} label="Integrity" value="100%" color="amber" />
          <div className="ml-auto flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search TX hash / Block..." 
              className="bg-transparent border-none outline-none text-xs font-mono w-48 text-white placeholder-slate-600"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* LATEST BLOCKS HORIZONTAL SCROLL */}
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {blocks.slice(0, 5).map((block, idx) => (
            <BlockCard key={block.hash} block={block} isLatest={idx === 0} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RECENT EVENTS TABLE */}
          <div className="lg:col-span-2 bg-[#0b0616] border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4" /> Live Audit Trail
              </h2>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-white/5">
                    <th className="pb-3 font-normal">Block</th>
                    <th className="pb-3 font-normal">Event Type</th>
                    <th className="pb-3 font-normal">Actor</th>
                    <th className="pb-3 font-normal">Transaction Hash</th>
                    <th className="pb-3 font-normal text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {blocks.flatMap((block, bIdx) => 
                    block.transactions.map((tx, tIdx) => (
                      <tr key={`${bIdx}-${tIdx}`} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3 text-slate-500">#{block.hash.substring(0, 8)}</td>
                        <td className="py-3">
                          <span className="text-amber-500 font-bold">{tx.split(':')[0]}</span>
                        </td>
                        <td className="py-3 text-slate-400">{tx.split(':')[1]?.trim() || 'SYSTEM'}</td>
                        <td className="py-3 text-slate-500 truncate max-w-[120px]">
                          {Math.random().toString(16).substring(2, 66)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold">SIGNED</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ).slice(0, 10)}
                </tbody>
              </table>
            </div>
          </div>

          {/* CHAIN STATS */}
          <div className="space-y-6">
            <div className="bg-[#0b0616] border border-amber-500/20 rounded-2xl p-6">
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">Integrity Monitoring</h2>
              <div className="space-y-4">
                <IntegrityStat label="Ledger Consistency" value={100} />
                <IntegrityStat label="Auth-Sync Proof" value={100} />
                <IntegrityStat label="Cold Storage Link" value={99.8} />
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Network Hashrate</div>
                  <div className="text-2xl font-bold text-white">4.2 EH/s</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0616] border border-amber-500/20 rounded-2xl p-6">
              <h2 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-4">Chain Metadata</h2>
              <div className="space-y-3">
                <MetadataRow label="Consensus" value="Proof-of-Authority" />
                <MetadataRow label="Block Height" value="1,245,082" />
                <MetadataRow label="Validator Count" value="12 Nodes" />
                <MetadataRow label="Protocol" value="Bee-Chain V4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusItem: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3 pr-6 border-r border-white/5 last:border-0 last:pr-0">
    <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-xs font-bold font-mono text-white">{value}</div>
    </div>
  </div>
);

const BlockCard: React.FC<{ block: Block; isLatest?: boolean }> = ({ block, isLatest }) => (
  <motion.div
    initial={isLatest ? { x: -50, opacity: 0 } : false}
    animate={{ x: 0, opacity: 1 }}
    className={`min-w-[240px] p-4 rounded-2xl border ${
      isLatest ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'
    } flex flex-col gap-3 relative overflow-hidden group`}
  >
    {isLatest && (
      <div className="absolute top-0 right-0 p-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      </div>
    )}
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Hash className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-mono font-bold">#{block.hash.substring(0, 8)}</span>
      </div>
      <span className="text-[9px] font-mono text-slate-500">{new Date(block.timestamp).toLocaleTimeString()}</span>
    </div>

    <div className="space-y-1">
      <div className="text-[10px] text-slate-500 uppercase">Transactions</div>
      <div className="text-[11px] font-mono text-slate-300">
        {block.transactions.length} record(s) sealed
      </div>
    </div>

    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
      <span className="text-[9px] font-mono text-slate-500">Prev: {block.previousHash.substring(0, 6)}...</span>
      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-500 transition-colors cursor-pointer" />
    </div>
  </motion.div>
);

const IntegrityStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-[10px] font-mono mb-1">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{value}%</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className="h-full bg-emerald-500"
      />
    </div>
  </div>
);

const MetadataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-[11px] font-mono border-b border-white/5 pb-2">
    <span className="text-slate-500">{label}</span>
    <span className="text-slate-200">{value}</span>
  </div>
);
