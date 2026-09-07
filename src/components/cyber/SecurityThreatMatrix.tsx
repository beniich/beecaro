import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Globe, 
  Terminal as TerminalIcon, 
  Filter, 
  AlertTriangle, 
  Zap, 
  Flame, 
  Radio, 
  Lock, 
  Play, 
  Pause, 
  RefreshCw,
  Search,
  Maximize2,
  CheckCircle2,
  ChevronRight,
  User,
  Download
} from 'lucide-react';
import { NavigationPage } from '../../types/bizos';
import { useAuth } from '../../contexts/AuthContext';
import { BeeLogo } from '../BeeLogo';
import { ThreatMap } from './ThreatMap';
import { useTelemetry } from '../../telemetry/hooks';

export interface ThreatProfile {
  id: string;
  name: string;
  code: string;
  type: string;
  severity: 'CRITICAL' | 'SEVERE' | 'HIGH' | 'ELEVATED';
  description: string;
  impact: string;
  activeCount: number;
  origin: string;
  target: string;
  status: string;
}

const mockThreatProfiles: ThreatProfile[] = [
  {
    id: 'tp-1',
    name: 'ADVANCED PERSISTENT THREAT',
    code: 'APT-29',
    type: 'Nation State Cyber Espionage',
    severity: 'CRITICAL',
    description: 'Impact. Ransomware Impact on distribution and extraction of sensitive credentials and network disruption.',
    impact: 'Infrastructure data exfiltration attempt across HVAC chiller controllers.',
    activeCount: 42,
    origin: 'Eastern Europe / RU',
    target: 'Spider Cybernetics Tower A',
    status: 'MITIGATING'
  },
  {
    id: 'tp-2',
    name: 'RANSOMWARE',
    code: 'LOCKBIT 3.0',
    type: 'Encrypted Payload Delivery',
    severity: 'CRITICAL',
    description: 'Impact. Demons and destructive encryption of sensitive operational environments and critical file systems.',
    impact: 'Zero-day crypto locker attempting to encipher SCADA telemetry archives.',
    activeCount: 18,
    origin: 'Asia-Pacific / CN',
    target: 'Sub-station Power Subsystem #3',
    status: 'BLOCKED'
  },
  {
    id: 'tp-3',
    name: 'ZERO-DAY EXPLOIT',
    code: 'CVE-2023-1234',
    type: 'Memory Buffer Overflow',
    severity: 'CRITICAL',
    description: 'Impact. Unauthenticated remote access resulting in potential system compromise and lateral network movement.',
    impact: 'Unauthenticated firmware modification attempts on RTU modules.',
    activeCount: 156,
    origin: 'South America / BR',
    target: 'Edge AI Gateway Cluster',
    status: 'ISOLATED'
  }
];

const initialLogs = [
  { time: '10:45:23', tag: '[AI ERT]', color: 'text-red-400 font-black', msg: 'Blocked SQL Injection from 192.168.1.101' },
  { time: '10:45:25', tag: '[INFO]', color: 'text-gray-300', msg: 'Signature Matched: Exploit-Kit-A' },
  { time: '10:45:25', tag: '[INFO]', color: 'text-gray-300', msg: 'Signature Matched: Exploit-Kit-B' },
  { time: '10:45:26', tag: '[WARN]', color: 'text-amber-400 font-bold', msg: 'Traffic Anomaly Detected: Port 443' },
  { time: '10:45:32', tag: '[CRIT]', color: 'text-red-500 font-black animate-pulse', msg: 'Botnet Traffic Identified from Region: SE-ASIA' },
  { time: '10:45:35', tag: '[SYSTEM]', color: 'text-emerald-400 font-mono', msg: 'Auto-Mitigation Initiated: Protocol 78' },
  { time: '10:45:38', tag: '[INFO]', color: 'text-gray-300', msg: 'Signature Matched: Exploit-Kit-A' },
  { time: '10:45:41', tag: '[INFO]', color: 'text-gray-300', msg: 'Signature Matched: Exploit-Kit-C' },
  { time: '10:45:44', tag: '[WARN]', color: 'text-amber-400 font-bold', msg: 'Traffic Anomaly Detected: Port 443' },
  { time: '10:45:48', tag: '[SYSTEM]', color: 'text-emerald-400 font-mono', msg: 'Auto-Mitigation Initiated: Protocol 78' },
];

export const SecurityThreatMatrix: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const securityEvents = useTelemetry(s => s.securityEvents);
  
  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Carter');
  const roleDisplay = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Admin';

  const [selectedProfile, setSelectedProfile] = useState<ThreatProfile>(mockThreatProfiles[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'observability' | 'ai-ops' | 'threats' | 'settings'>('dashboard');
  
  const [isStreaming, setIsStreaming] = useState(true);
  const [terminalInput, setTerminalInput] = useState('');
  
  const [terminalLogs, setTerminalLogs] = useState<{time: string, tag: string, color: string, msg: string}[]>([]);
  const [threatLevel, setThreatLevel] = useState<'CRITICAL' | 'HIGH' | 'ELEVATED'>('CRITICAL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'BLOCKED'>('ALL');
  
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  const logs = React.useMemo(() => [
    ...securityEvents.slice(-15).map(e => ({
      time: new Date(e.timestamp).toLocaleTimeString(),
      tag: e.blocked ? '[BLOCKED]' : '[ALERT]',
      color: e.blocked ? 'text-emerald-400' : 'text-red-400 font-bold',
      msg: `${e.type} from ${e.sourceCountry} (${e.sourceIp}) targeting ${e.targetEndpoint}`
    })),
    ...terminalLogs
  ].sort((a, b) => a.time.localeCompare(b.time)).slice(-20), [securityEvents, terminalLogs]);

  const activeAttacksCount = React.useMemo(() => 
    securityEvents.length * 12 + Math.floor(Math.random() * 100),
  [securityEvents]);
  
  const mitigationRate = React.useMemo(() => 
    (securityEvents.filter(e => e.blocked).length / (securityEvents.length || 1) * 100).toFixed(1),
  [securityEvents]);

  // Scroll to bottom when logs update
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim().toLowerCase();
    const now = new Date().toLocaleTimeString();

    let reply = `Command executed: ${cmd}`;
    let tag = '[SYSTEM]';
    let color = 'text-cyan-400 font-mono';

    if (cmd.includes('mitigate') || cmd.includes('protocol')) {
      reply = 'Protocol 78 triggered: 412 botnet IPs isolated across ingress gateways.';
      tag = '[AI ERT]';
      color = 'text-emerald-400 font-bold';
    } else if (cmd.includes('isolate') || cmd.includes('block')) {
      reply = 'Node isolated from CAFM telemetry loop. Re-routing through Secure Proxy #02.';
      tag = '[SEC-LOCK]';
      color = 'text-amber-400 font-bold';
    } else if (cmd.includes('status')) {
      reply = `Global Threat: ${threatLevel} | Active: ${activeAttacksCount} | Mitigated: ${mitigationRate}%`;
      tag = '[STATUS]';
    } else if (cmd.includes('help')) {
      reply = 'Available commands: mitigate protocol 78, isolate <node>, scan origin, clear, status';
      tag = '[HELP]';
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    }

    setTerminalLogs(prev => [
      ...prev.slice(-10), 
      { time: now, tag: `> ${terminalInput}`, color: 'text-white', msg: '' },
      { time: now, tag, color, msg: reply }
    ]);
    setTerminalInput('');
  };

  const threatSourceData = [
    { label: '1', count: 1100 },
    { label: '2', count: 920 },
    { label: '3', count: 680 },
    { label: '4', count: 740 },
    { label: '5', count: 850 },
    { label: '6', count: 480 },
    { label: '7', count: 910 },
    { label: '8', count: 520 },
    { label: '9', count: 630 },
    { label: '10', count: 710 },
    { label: '11', count: 440 },
    { label: '12', count: 590 },
  ];

  return (
    <div className="min-h-screen bg-[#090412] text-gray-100 flex flex-col font-sans selection:bg-[#ff9d2b] selection:text-black">
      
      {/* Custom Top Navigation matching Image */}
      <div className="bg-[#090412] border-b border-[#ff9d2b]/30 flex flex-col">
        {/* Main Header Row */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate?.('spaceflow')}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
            >
              <BeeLogo size="sm" showText={false} />
              <span className="font-mono text-xl sm:text-2xl text-[#ff9d2b] tracking-tight">
                BeeCarbonat
              </span>
            </button>
            <div className="w-px h-6 bg-gray-700/50 mx-2 hidden sm:block"></div>
            <span className="text-sm sm:text-lg text-gray-200 hidden sm:block">
              Security Threat Matrix
            </span>
          </div>

          {/* Center Nav Links (from image) */}
          <div className="hidden lg:flex items-center gap-8">
            <button className="text-gray-400 hover:text-white transition-colors">Dashboard</button>
            <button className="text-gray-400 hover:text-white transition-colors">Observability</button>
            <button className="text-gray-400 hover:text-white transition-colors">AI Ops</button>
            <button className="text-[#ff9d2b] border-b-2 border-[#ff9d2b] pb-4 translate-y-[9px] font-medium">Threats</button>
            <button className="text-gray-400 hover:text-white transition-colors">Settings</button>
          </div>

          {/* Admin / Profile Display */}
          <div className="flex items-center gap-3 bg-[#ff9d2b]/10 rounded-full pl-1 pr-3 py-1 border border-[#ff9d2b]/20">
            <div className="w-6 h-6 rounded-full bg-[#ff9d2b] flex items-center justify-center text-black">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[11px] sm:text-xs text-[#ff9d2b] whitespace-nowrap">
              {roleDisplay}: {displayName}
            </span>
          </div>
        </div>

        {/* Sub Navigation Bar (Matching Image exact tags) */}
        <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1 rounded-full text-xs transition-all ${
              activeTab === 'dashboard' 
                ? 'border border-[#ff9d2b] text-white bg-[#ff9d2b]/10' 
                : 'border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('observability')}
            className={`px-4 py-1 rounded-full text-xs transition-all ${
              activeTab === 'observability' 
                ? 'border border-[#ff9d2b] text-white bg-[#ff9d2b]/10' 
                : 'border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Observability
          </button>
          <button 
            onClick={() => setActiveTab('threats')}
            className={`px-4 py-1 rounded-full text-xs transition-all ${
              activeTab === 'threats' 
                ? 'border border-[#ff9d2b] text-white bg-[#ff9d2b]/10' 
                : 'border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            Threats
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Threat Profiles + Top Threat Sources (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Threat Profiles Card */}
          <div className="bg-[#120a20]/90 rounded-xl border border-[#ff9d2b]/30 p-4 flex flex-col flex-1 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ff9d2b]/20">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#ff9d2b]" />
                <h3 className="font-mono font-black text-xs sm:text-sm text-[#ffb04f] tracking-wider uppercase">
                  Threat Profiles
                </h3>
              </div>
              <span className="text-xs text-slate-500">•••</span>
            </div>

            <div className="mt-3 flex flex-col gap-2.5 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin">
              {mockThreatProfiles.map((tp) => {
                const isSelected = selectedProfile.id === tp.id;
                return (
                  <div
                    key={tp.id}
                    onClick={() => setSelectedProfile(tp)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#1e1035] border-[#ff9d2b] shadow-[0_0_15px_rgba(255,157,43,0.25)]'
                        : 'bg-[#150c26]/60 border-white/5 hover:border-[#ff9d2b]/40 hover:bg-[#1a0f30]'
                    }`}
                  >
                    {/* Glowing Accent Indicator */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#ff9d2b]" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded bg-[#0a1220] border border-cyan-500/50 flex flex-col items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                        <User className="w-6 h-6 text-cyan-400" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-mono font-bold text-gray-200 leading-tight">
                            {tp.name}
                            <div className="text-[10px] text-cyan-400 font-normal mt-0.5">({tp.code})</div>
                          </div>
                          
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border tracking-wider mt-0.5 ${
                            tp.severity === 'CRITICAL' 
                              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                              : tp.severity === 'SEVERE'
                              ? 'bg-orange-500/10 text-orange-400 border-[#ff9a00]/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {tp.severity}
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
                          {tp.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Threat Sources Card (Bar Chart from Screenshot 1) */}
          <div className="bg-[#120a20]/90 rounded-xl border border-[#ff9d2b]/30 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#ff9d2b]/20">
              <span className="font-mono font-black text-xs text-[#ffb04f] tracking-wider uppercase">
                Top Threat Sources
              </span>
              <span className="text-xs text-slate-500">•••</span>
            </div>

            <div className="mt-3 flex items-end justify-between h-28 gap-1 pt-2 px-1">
              {threatSourceData.map((d, i) => {
                const heightPct = (d.count / 1200) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div 
                      className="w-full rounded-t bg-gradient-to-t from-[#ff5e00] to-[#ff9d2b] transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${heightPct}%` }}
                      title={`Sector ${d.label}: ${d.count} vectors`}
                    />
                    <span className="text-[9px] font-mono text-slate-500 group-hover:text-[#ffd166]">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Global Threat Vector Canvas Map (6 Cols) */}
        <div className="lg:col-span-6 bg-[#120a20]/90 rounded-xl border border-[#ff9d2b]/30 p-4 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
          
          {/* Top Canvas Header Banner */}
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#ff9d2b] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Geospatial Attack Trajectory Vector</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                Real-time orbital tracking of DDoS & malware telemetry injection
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setThreatLevel(l => l === 'CRITICAL' ? 'HIGH' : 'CRITICAL')}
                className="px-2.5 py-1 rounded bg-[#201138] border border-[#ff9d2b]/40 text-[10px] font-mono text-[#ffd166] hover:bg-[#ff9d2b] hover:text-black transition-all"
              >
                Toggle Threat State
              </button>
              <button 
                onClick={() => setIsStreaming(!isStreaming)}
                className="p-1.5 rounded bg-[#201138] border border-[#ff9d2b]/40 text-[#ff9d2b] hover:text-white"
                title={isStreaming ? 'Pause Feed' : 'Resume Feed'}
              >
                {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Interactive World Vector Canvas */}
          <div className="flex-1 w-full min-h-[380px] mt-3 relative rounded-lg border border-[#ff9d2b]/15 bg-[#0a0515]/90 overflow-hidden flex items-center justify-center">
            <ThreatMap selectedProfile={selectedProfile} />
            
            {/* Global Threat Info Badge */}
            <div className="absolute top-4 left-4 bg-transparent border border-red-500/50 p-2.5 rounded-md text-[10px] font-mono z-10 shadow-lg">
              <div className="flex items-center gap-1.5 text-gray-300">
                <span>GLOBAL THREAT LEVEL:</span>
                <span className="text-red-500 font-bold tracking-wider">{threatLevel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300 mt-1">
                <span>ACTIVE ATTACKS:</span>
                <span className="text-[#ffb04f] font-bold">{activeAttacksCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300 mt-1">
                <span>MITIGATION RATE:</span>
                <span className="text-[#ffb04f] font-bold">{mitigationRate}%</span>
              </div>
            </div>
          </div>

          {/* Footer Copyright Notice Matching Image 1 */}
          <div className="text-center text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
            © 2026 BeeCarbonat | Next-Gen Observability & AI Ops Suite | Privacy Policy
          </div>
        </div>

        {/* Right Column: Attack Signatures Live Terminal (3 Cols) */}
        <div className="lg:col-span-3 bg-[#120a20]/90 rounded-xl border border-[#ff9d2b]/30 p-4 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#ff9d2b]/20">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-[#ff9d2b]" />
              <h3 className="font-mono font-black text-xs sm:text-sm text-[#ffb04f] tracking-wider uppercase">
                Attack Signatures
              </h3>
            </div>
            <span className="text-xs text-slate-500">•••</span>
          </div>

          {/* Live Log Stream Container */}
          <div ref={logsContainerRef} className="flex-1 mt-3 bg-[#080312] p-3 rounded-lg border border-[#ff9d2b]/20 font-mono text-[11px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#ff9d2b] scrollbar-track-transparent flex flex-col gap-1.5 h-[400px]">
            {logs.map((item, idx) => (
              <div key={idx} className="leading-snug flex items-start gap-1.5 hover:bg-white/5 p-0.5 rounded transition-colors">
                <span className="text-slate-600 select-none text-[10px]">{item.time}</span>
                <span className={`${item.color} select-none shrink-0`}>{item.tag}</span>
                <span className="text-gray-300 break-all">{item.msg}</span>
              </div>
            ))}
          </div>

          {/* Interactive Command Line Prompt */}
          <form onSubmit={handleCommand} className="mt-3 flex items-center gap-2 bg-[#0d061c] border border-[#ff9d2b]/40 rounded-lg p-1.5 focus-within:border-[#ff9d2b] transition-all">
            <span className="text-[#ff9d2b] font-mono text-xs pl-1 font-bold">{'>'}</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="mitigate protocol 78..."
              className="flex-1 bg-transparent text-xs font-mono text-gray-100 placeholder-gray-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-[#ff9d2b] hover:bg-[#ffb04f] text-black font-mono font-bold text-[10px] rounded transition-all"
            >
              EXEC
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
