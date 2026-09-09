import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Brain,
  Bot,
  BarChart3,
  Mail,
  Mic,
  Calendar,
  Shield,
  CheckCircle2,
  RefreshCw,
  Send,
  Zap,
  ArrowUpRight,
  Sliders,
  Sparkles,
  PieChart as PieChartIcon,
  Clock,
  Check,
  CheckCircle
} from 'lucide-react';
import { BiometricState, UserSession } from '../../types/bizos';
import { mockStandardEmails } from '../../data/bizosData';

interface BizOSDashboardProps {
  biometrics: BiometricState;
  onUpdateBiometrics: (updated: Partial<BiometricState>) => void;
  currentUser?: UserSession | null;
  onNavigate?: (page: any) => void;
  lang?: 'fr' | 'en';
}

export const BizOSDashboard: React.FC<BizOSDashboardProps> = ({
  biometrics,
  onUpdateBiometrics,
  currentUser,
  onNavigate,
  lang = 'fr'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'executive_kpis' | 'inbox' | 'meetings' | 'finance'>('overview');
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'ytd'>('7d');

  // Revenue & Burn telemetry chart data
  const financialData = [
    { period: 'Jan', mrr: 84000, arr: 1008000, burn: 52000, cash: 1240000 },
    { period: 'Fév', mrr: 89500, arr: 1074000, burn: 54000, cash: 1205000 },
    { period: 'Mar', mrr: 95000, arr: 1140000, burn: 53000, cash: 1172000 },
    { period: 'Avr', mrr: 101000, arr: 1212000, burn: 51000, cash: 1151000 },
    { period: 'Mai', mrr: 107200, arr: 1286000, burn: 49000, cash: 1142000 },
    { period: 'Juin', mrr: 112500, arr: 1350000, burn: 48000, cash: 1156000 },
    { period: 'Juil', mrr: 121000, arr: 1452000, burn: 46000, cash: 1184000 },
    { period: 'Août (Live)', mrr: 128400, arr: 1540800, burn: 45000, cash: 1219000 },
  ];

  // Cognitive Energy & Focus hours history
  const energyFlowData = [
    { day: 'Lun', hrv: 58, recovery: 74, deepWorkHrs: 4.5, meetings: 3 },
    { day: 'Mar', hrv: 62, recovery: 81, deepWorkHrs: 5.2, meetings: 2 },
    { day: 'Mer', hrv: 49, recovery: 58, deepWorkHrs: 3.1, meetings: 5 },
    { day: 'Jeu', hrv: 68, recovery: 88, deepWorkHrs: 5.8, meetings: 1 },
    { day: 'Ven', hrv: 54, recovery: 66, deepWorkHrs: 4.0, meetings: 4 },
    { day: 'Sam', hrv: 75, recovery: 94, deepWorkHrs: 1.5, meetings: 0 },
    { day: 'Dim (Auj)', hrv: biometrics.hrvBaseline, recovery: biometrics.recoveryScore, deepWorkHrs: 3.8, meetings: 1 },
  ];

  // Pipeline distribution by stage
  const pipelineData = [
    { name: 'Contrats Signés (ARR)', value: 1540, color: '#10b981' },
    { name: 'Négociation Finale', value: 480, color: '#3b82f6' },
    { name: 'Démos Qualifiées', value: 620, color: '#8b5cf6' },
    { name: 'Lead Inbound IA', value: 310, color: '#f59e0b' },
  ];

  // Quick interactive states
  const [emailTone, setEmailTone] = useState<'concise' | 'warm' | 'firm'>('concise');
  const [selectedEmail, setSelectedEmail] = useState(mockStandardEmails[1]);
  const [sentNotice, setSentNotice] = useState(false);
  const [jiraSynced, setJiraSynced] = useState(false);

  return (
    <div id="bizos-dashboard-view" className="w-full relative space-y-4">
      {/* Top Header / Live Cockpit Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-500 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{lang === 'fr' ? 'DASHBOARD OPÉRATIONNEL & STRATÉGIQUE' : 'EXECUTIVE FOUNDER DASHBOARD'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight mt-0.5">
            {currentUser?.name ? `${currentUser.name}'s Executive Dashboard` : 'BeeCarbonat Executive Cockpit'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {lang === 'fr' 
              ? 'Pilotage en temps réel : Métriques SaaS, État Cognitif VitalAI, Pipeline Commercial et Automatisation IA.'
              : 'Real-time steering: SaaS metrics, VitalAI cognitive state, sales pipeline, and AI automation.'}
          </p>
        </div>

        {/* Live Status & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center gap-0.5 text-xs font-mono">
            {(['today', '7d', '30d', 'ytd'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-medium transition-colors uppercase text-xs ${
                  timeframe === tf
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf === 'today' ? "Today" : tf}
              </button>
            ))}
          </div>

          {/* Biometrics badge */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-mono">
            <span className="text-slate-500 dark:text-zinc-400">
              HRV: <strong className="text-slate-900 dark:text-zinc-100">{biometrics.hrvBaseline}ms</strong>
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span className="text-slate-500 dark:text-zinc-400">
              Score: <strong className="text-emerald-500 dark:text-emerald-400">{biometrics.recoveryScore}%</strong>
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold border border-emerald-500/20">
              {biometrics.cognitiveLoad}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: 'overview', label: lang === 'fr' ? 'Vue Générale & KPIs' : 'Overview & KPIs', icon: BarChart3 },
          { id: 'executive_kpis', label: lang === 'fr' ? 'Graphiques & Télémétrie' : 'Charts & Telemetry', icon: TrendingUp },
          { id: 'inbox', label: lang === 'fr' ? 'InboxAI Triage' : 'InboxAI Triage', icon: Mail },
          { id: 'meetings', label: lang === 'fr' ? 'MeetAI & Actions Jira' : 'MeetAI & Jira Tasks', icon: Mic },
          { id: 'finance', label: lang === 'fr' ? 'Finance & Valuation' : 'Finance & Valuation', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                activeTab === tab.id
                  ? 'bg-[#0051c3] text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {onNavigate && (
          <button
            onClick={() => onNavigate('spaceflow')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors bg-white dark:bg-zinc-900 text-blue-500 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/40 ml-auto"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>SpaceFlow CAFM Hub ↗</span>
          </button>
        )}
      </div>

      {/* KPI Cards Row (Visible on overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* KPI 1: ARR */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-mono">
            <span className="uppercase text-[10px]">Annual Recurring Revenue</span>
            <div className="p-1 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-mono tracking-tight">$1,540,800</div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center text-[11px]">
              +28.4%
            </span>
            <span className="text-slate-400 dark:text-zinc-500 text-[10px]">vs mois précédent</span>
          </div>
        </div>

        {/* KPI 2: Burn & Runway */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-mono">
            <span className="uppercase text-[10px]">Net Burn & Runway</span>
            <div className="p-1 rounded bg-purple-500/10 text-purple-500 dark:text-purple-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-mono tracking-tight">27.1 Mois</div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-emerald-500 dark:text-emerald-400 font-bold text-[11px]">$45k/mois burn</span>
            <span className="text-slate-400 dark:text-zinc-500 text-[10px]">• $1.22M cash</span>
          </div>
        </div>

        {/* KPI 3: Cognitive Flow Score */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-mono">
            <span className="uppercase text-[10px]">Clarté Cognitive (VitalAI)</span>
            <div className="p-1 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Brain className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-500 dark:text-amber-400 font-mono tracking-tight">
            {biometrics.recoveryScore}/100
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-amber-500 dark:text-amber-400 font-bold text-[11px]">{biometrics.hrvBaseline}ms HRV</span>
            <span className="text-slate-400 dark:text-zinc-500 text-[10px]">• Shield Actif</span>
          </div>
        </div>

        {/* KPI 4: Automated AI Hours */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-mono">
            <span className="uppercase text-[10px]">Temps Économisé IA</span>
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-500 dark:text-emerald-400 font-mono tracking-tight">18.5 hrs</div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-emerald-500 dark:text-emerald-400 font-bold text-[11px]">42 emails triés</span>
            <span className="text-slate-400 dark:text-zinc-500 text-[10px]">• 6 transcripts Jira</span>
          </div>
        </div>
      </div>

      {/* VIEW: Overview (Charts & Live Controls) */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left 8 Cols: Financial Telemetry & ARR Growth */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800 gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-500 dark:text-blue-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>COURBE DE CROISSANCE SAAS (ARR & CASH FLOW)</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 mt-0.5">Télémétrie Financière & Expansion</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>MRR ($)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>Burn ($)</span>
                  </div>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#mrrGrad)" name="MRR Mensuel" />
                    <Area type="monotone" dataKey="burn" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#burnGrad)" name="Burn Net" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Multiplicateur M&A</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono">12.4x ARR</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Valorisation Exit</div>
                  <div className="text-sm font-bold text-emerald-500 dark:text-emerald-400 font-mono">$19.1M</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Rule of 40</div>
                  <div className="text-sm font-bold text-blue-500 dark:text-blue-400 font-mono">54.2%</div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Deals Pipeline & Distribution */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                    <PieChartIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span>RÉPARTITION DU PIPELINE ($k)</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    $2.95M TOTAL
                  </span>
                </div>

                <div className="h-40 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-1 text-xs font-mono">
                  {pipelineData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate max-w-[150px]">{item.name}</span>
                      </div>
                      <strong className="text-slate-900 dark:text-zinc-100 font-mono">${item.value}k</strong>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('inbox')}
                className="w-full mt-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Accéder aux Négociations InboxAI</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Biometric Shield & Live Calendar Orchestration */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Strain controller */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Mental Load & HRV Controller (VitalAI)</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Adjust sliders to test automatic schedule protection</p>
                </div>
                <span className="text-[9px] font-mono text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Sensors Active
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">Baseline Heart Rate Variability (HRV)</span>
                    <span className="text-blue-500 dark:text-blue-400 font-bold">{biometrics.hrvBaseline} ms</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={biometrics.hrvBaseline}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateBiometrics({
                        hrvBaseline: val,
                        recoveryScore: Math.round(val * 1.1),
                        cognitiveLoad: val < 40 ? 'Overloaded' : val < 55 ? 'Elevated' : 'Optimal'
                      });
                    }}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">Sleep & Stress Recovery Score</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold">{biometrics.recoveryScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="98"
                    value={biometrics.recoveryScore}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateBiometrics({
                        recoveryScore: val,
                        cognitiveLoad: val < 40 ? 'Overloaded' : val < 60 ? 'Elevated' : 'Optimal'
                      });
                    }}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg"
                  />
                </div>

                {/* Presets */}
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5 font-bold">
                    Quick State Presets
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onUpdateBiometrics({ hrvBaseline: 30, recoveryScore: 28, cognitiveLoad: 'Overloaded' })}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-amber-500 text-center transition-colors"
                    >
                      ⚡ Fatigue (28%)
                    </button>
                    <button
                      onClick={() => onUpdateBiometrics({ hrvBaseline: 48, recoveryScore: 56, cognitiveLoad: 'Elevated' })}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-zinc-100 text-center transition-colors"
                    >
                      ⚖️ Balanced (56%)
                    </button>
                    <button
                      onClick={() => onUpdateBiometrics({ hrvBaseline: 75, recoveryScore: 94, cognitiveLoad: 'Optimal' })}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-emerald-500 text-center transition-colors"
                    >
                      🌟 Flow (94%)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Calendar Shield Display */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                    <span>Google Calendar AI Shield</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {biometrics.recoveryScore < 45 ? (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-500 text-xs">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Focus Shield Triggered</span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-zinc-300">
                        Low recovery ({biometrics.recoveryScore}%). 2 non-priority meetings rescheduled. 90-min recovery block locked.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-500 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>High Energy Window Open</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                        Optimal recovery ({biometrics.recoveryScore}%). Investor calls and high-impact strategic meetings active.
                      </p>
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    <div className="flex justify-between items-center">
                      <span>14:00 - 15:30 :</span>
                      <strong className="text-blue-500 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Deep Work</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>16:00 - 16:30 :</span>
                      <strong className="text-slate-900 dark:text-zinc-200">Sarah (SLA Review)</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>17:00 - 17:45 :</span>
                      <strong className="text-emerald-500 dark:text-emerald-400">Board Sync Q3</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 mt-2 text-[10px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span>Synchronized with Oura Ring & Whoop</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Charts & Executive KPIs */}
      {activeTab === 'executive_kpis' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800 gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Focus Clarity & Workflow History</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Correlation between heart rate variability (HRV) and deep work hours achieved</p>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/20">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyFlowData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="deepWorkHrs" name="Deep Work Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovery" name="Recovery Score (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW: InboxAI Draft Engine */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-mono uppercase tracking-wider">
              Incoming Emails
            </h3>
            {mockStandardEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-2.5 rounded-lg cursor-pointer transition-colors border ${
                  selectedEmail.id === email.id
                    ? 'bg-blue-500/10 border-blue-500/40'
                    : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">{email.sender}</span>
                  <span className="font-mono text-slate-400 dark:text-zinc-500 text-[10px]">{email.time}</span>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">{email.subject}</div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 line-clamp-1 mt-0.5">{email.snippet}</div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-[9px] font-mono text-blue-500 dark:text-blue-400 uppercase font-bold">InboxAI Smart Draft</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{selectedEmail.subject}</h4>
                </div>
                <div className="flex gap-1">
                  {(['concise', 'warm', 'firm'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setEmailTone(tone)}
                      className={`px-2.5 py-0.5 rounded text-xs font-mono font-medium capitalize transition-colors ${
                        emailTone === tone
                          ? 'bg-[#0051c3] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed mt-3">
                {emailTone === 'concise'
                  ? `Hello ${selectedEmail.sender.split(' ')[0]},\n\nI verified the clauses with our legal advisor. Signed agreement attached.\n\nBest regards,\nAlexandre`
                  : emailTone === 'warm'
                  ? `Hello ${selectedEmail.sender.split(' ')[0]},\n\nThank you very much for this constructive feedback! Everything is perfectly clear and compliant. The signed document is attached.\n\nWarmly,\nAlexandre`
                  : `Hello ${selectedEmail.sender.split(' ')[0]},\n\nWe confirm the terms without additional modification. Please proceed with deployment without delay.\n\nAlexandre`}
              </div>
            </div>

            <button
              onClick={() => {
                setSentNotice(true);
                setTimeout(() => setSentNotice(false), 2000);
              }}
              className="w-full py-2 rounded-lg bg-[#0051c3] hover:bg-blue-600 text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sentNotice ? 'Sent successfully!' : 'Approve & Send Draft Response'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: MeetAI & Jira Tasks */}
      {activeTab === 'meetings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Processed Meeting Transcript (MeetAI)</span>
            </h3>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="text-slate-600 dark:text-zinc-400">
                <strong className="text-blue-500 dark:text-blue-400">Sarah Jenkins (2:12 PM) :</strong> "We must finalize the API documentation by Friday to launch phase 1 of the pilot."
              </div>
              <div className="text-slate-600 dark:text-zinc-400">
                <strong className="text-emerald-500 dark:text-emerald-400">Alexandre (2:13 PM) :</strong> "Marcus is on it. I will create a high-priority Jira ticket right now."
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider mb-2">Jira Task Extracted</h3>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-zinc-100">
                  <span>[ENG-492] Write Phase 1 API Doc</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-mono text-[10px]">99.8% Conf.</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Assigned to: <strong>Marcus (Head of Eng)</strong> • Priority: <strong className="text-amber-500">High</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setJiraSynced(true);
                setTimeout(() => setJiraSynced(false), 2500);
              }}
              className="w-full py-2 rounded-lg bg-[#0051c3] hover:bg-blue-600 text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-1.5 mt-3 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{jiraSynced ? 'Created in Jira & Posted on Slack!' : 'Sync to Jira & Slack'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: Finance & Valuation */}
      {activeTab === 'finance' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">Cash Flow Modeling, Runway & M&A Valuation</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Continuous data synchronization from Stripe, Carta, and ExitReady</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold border border-emerald-500/20">
              27.1 Months of Runway
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Annualized ARR</div>
              <div className="text-xl font-bold text-blue-500 dark:text-blue-400 font-mono my-1">$1,540,800</div>
              <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono">+28.4% YoY Growth</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Estimated M&A Valuation</div>
              <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-mono my-1">$19.1M</div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">12.4x ARR Multiple</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Monthly Net Burn</div>
              <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 font-mono my-1">$45,000</div>
              <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-mono">Runway extended to 2028</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
