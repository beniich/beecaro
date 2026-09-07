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
    { period: 'Mai', mrr: 1072000 / 10, arr: 1286000, burn: 49000, cash: 1142000 },
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
    { name: 'Contrats Signés (ARR)', value: 1540, color: '#34d399' },
    { name: 'Négociation Finale', value: 480, color: '#ffb2bb' },
    { name: 'Démos Qualifiées', value: 620, color: '#ecd7ff' },
    { name: 'Lead Inbound IA', value: 310, color: '#ff9d2b' },
  ];

  // Quick interactive states
  const [emailTone, setEmailTone] = useState<'concise' | 'warm' | 'firm'>('concise');
  const [selectedEmail, setSelectedEmail] = useState(mockStandardEmails[1]);
  const [sentNotice, setSentNotice] = useState(false);
  const [jiraSynced, setJiraSynced] = useState(false);

  return (
    <div id="bizos-dashboard-view" className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Ambient background light */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-tr from-[#ecd7ff]/15 via-[#ff9d2b]/10 to-transparent rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Header / Live Cockpit Status */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[#373147] mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-500">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] animate-pulse"></span>
            <span>{lang === 'fr' ? 'DASHBOARD OPÉRATIONNEL & STRATÉGIQUE FONDATION' : 'EXECUTIVE FOUNDER DASHBOARD'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            {currentUser?.name ? `${currentUser.name}'s Executive Dashboard` : 'BizOS Executive Cockpit'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {lang === 'fr' 
              ? 'Pilotage en temps réel : Métriques SaaS, État Cognitif VitalAI, Pipeline Commercial et Automatisation IA.'
              : 'Real-time steering: SaaS metrics, VitalAI cognitive state, sales pipeline, and AI automation.'}
          </p>
        </div>

        {/* Live Status & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="bg-white dark:bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs font-mono">
            {(['today', '7d', '30d', 'ytd'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all uppercase ${
                  timeframe === tf
                    ? 'bg-[#ff9d2b] text-[#1e1633] shadow-[0_0_12px_rgba(255,157,43,0.4)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:text-white'
                }`}
              >
                {tf === 'today' ? "Today" : tf}
              </button>
            ))}
          </div>

          {/* Biometrics badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-50 dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-[#ffb2bb]/30">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              HRV: <strong className="text-slate-900 dark:text-slate-200">{biometrics.hrvBaseline}ms</strong>
            </span>
            <span className="text-[#4a454f]">|</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Récupération: <strong className="text-orange-500">{biometrics.recoveryScore}%</strong>
            </span>
            <span className="text-[#4a454f]">|</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#34d399]/20 text-[#34d399] font-bold">
              {biometrics.cognitiveLoad}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {[
          { id: 'overview', label: lang === 'fr' ? 'Vue Générale & KPIs' : 'Overview & Main KPIs', icon: 'dashboard' },
          { id: 'executive_kpis', label: lang === 'fr' ? 'Graphiques & Télémétrie' : 'Charts & Telemetry', icon: 'analytics' },
          { id: 'inbox', label: lang === 'fr' ? 'InboxAI Triage & Réponses' : 'InboxAI Triage', icon: 'mail' },
          { id: 'meetings', label: lang === 'fr' ? 'MeetAI & Actions Jira' : 'MeetAI & Jira Tasks', icon: 'record_voice_over' },
          { id: 'finance', label: lang === 'fr' ? 'Finance & Modélisation Exit' : 'Finance & Valuation', icon: 'account_balance' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_20px_rgba(216,180,254,0.3)]'
                : 'bg-white dark:bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:text-black dark:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        {onNavigate && (
          <button
            onClick={() => onNavigate('spaceflow')}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold font-mono flex items-center gap-2 transition-all bg-gradient-to-r from-[#38bdf8]/20 to-[#34d399]/20 text-[#38bdf8] border border-[#38bdf8]/40 hover:border-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.2)] ml-auto"
          >
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse"></span>
            <span>SpaceFlow CAFM Hub ↗</span>
          </button>
        )}
      </div>

      {/* KPI Cards Row (Visible on overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        {/* KPI 1: ARR */}
        <div className="bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl hover:border-[#ff9d2b]/60 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-mono mb-2">
            <span>ANNUAL RECURRING REVENUE (ARR)</span>
            <span className="p-1.5 rounded-xl bg-[#ff9d2b]/20 text-[#ffc06e] material-symbols-outlined text-[18px]">
              trending_up
            </span>
          </div>
          <div className="text-3xl font-black text-[#e8defb] font-mono tracking-tight">$1,540,800</div>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono">
            <span className="text-[#34d399] font-bold flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +28.4%
            </span>
            <span className="text-[#968e9a]">vs mois précédent</span>
          </div>
        </div>

        {/* KPI 2: Burn & Runway */}
        <div className="bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl hover:border-[#ecd7ff]/60 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-mono mb-2">
            <span>NET BURN & RUNWAY</span>
            <span className="p-1.5 rounded-xl bg-[#ecd7ff]/20 text-slate-900 dark:text-slate-200 material-symbols-outlined text-[18px]">
              savings
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-slate-200 font-mono tracking-tight">27.1 Mois</div>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono">
            <span className="text-[#34d399] font-bold">$45k/mois burn</span>
            <span className="text-[#968e9a]">• $1.22M en trésorerie</span>
          </div>
        </div>

        {/* KPI 3: Cognitive Flow Score */}
        <div className="bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl hover:border-[#ffb2bb]/60 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-mono mb-2">
            <span>INDICE DE CLARTÉ COGNITIVE</span>
            <span className="p-1.5 rounded-xl bg-[#ffb2bb]/20 text-orange-500 material-symbols-outlined text-[18px]">
              psychology
            </span>
          </div>
          <div className="text-3xl font-black text-orange-500 font-mono tracking-tight">
            {biometrics.recoveryScore}/100
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono">
            <span className="text-[#ffc06e] font-bold">{biometrics.hrvBaseline}ms HRV</span>
            <span className="text-[#968e9a]">• Shield Calendrier Actif</span>
          </div>
        </div>

        {/* KPI 4: Automated AI Hours */}
        <div className="bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl hover:border-[#34d399]/60 transition-all">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-mono mb-2">
            <span>TEMPS ÉCONOMISÉ PAR L'IA</span>
            <span className="p-1.5 rounded-xl bg-[#34d399]/20 text-[#34d399] material-symbols-outlined text-[18px]">
              smart_toy
            </span>
          </div>
          <div className="text-3xl font-black text-[#34d399] font-mono tracking-tight">18.5 hrs</div>
          <div className="flex items-center gap-2 mt-2 text-xs font-mono">
            <span className="text-[#34d399] font-bold">42 emails triés</span>
            <span className="text-[#968e9a]">• 6 transcripts Jira</span>
          </div>
        </div>
      </div>

      {/* VIEW: Overview (Charts & Live Controls) */}
      {activeTab === 'overview' && (
        <div className="space-y-8 relative z-10">
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Financial Telemetry & ARR Growth */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#373147] gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff9d2b]">
                    <span className="material-symbols-outlined text-[18px]">show_chart</span>
                    <span>COURBE DE CROISSANCE SAAS (ARR & CASH FLOW)</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#e8defb] mt-0.5">Télémétrie Financière & Expansion</h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[#ffc06e]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff9d2b]"></span>
                    <span>MRR ($)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffb2bb]"></span>
                    <span>Burn ($)</span>
                  </div>
                </div>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9d2b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ff9d2b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffb2bb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ffb2bb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#373147" vertical={false} />
                    <XAxis dataKey="period" stroke="#968e9a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#968e9a" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151024', borderColor: '#ff9d2b', borderRadius: '16px', color: '#fff', fontSize: '12px' }} 
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#ff9d2b" strokeWidth={3} fillOpacity={1} fill="url(#mrrGrad)" name="MRR Mensuel" />
                    <Area type="monotone" dataKey="burn" stroke="#ffb2bb" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#burnGrad)" name="Burn Net" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#373147] text-center">
                <div className="p-2.5 rounded-2xl bg-[#221c31]">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">Multiplicateur M&A Estimé</div>
                  <div className="text-base font-black text-[#ffc06e] font-mono">12.4x ARR</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#221c31]">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">Valorisation Exit Estimée</div>
                  <div className="text-base font-black text-[#34d399] font-mono">$19.1M</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#221c31]">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">Efficacité du Capital (Rule of 40)</div>
                  <div className="text-base font-black text-slate-900 dark:text-slate-200 font-mono">54.2%</div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Deals Pipeline & Distribution */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-200">
                    <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                    <span>RÉPARTITION DU PIPELINE ($k)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#34d399] font-bold bg-[#34d399]/20 px-2 py-0.5 rounded">
                    $2.95M TOTAL
                  </span>
                </div>

                <div className="h-[180px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#151024', borderColor: '#ecd7ff', borderRadius: '12px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5 mt-3 text-xs font-mono">
                  {pipelineData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate max-w-[170px]">{item.name}</span>
                      </div>
                      <strong className="text-black dark:text-white">${item.value}k</strong>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('inbox')}
                className="w-full mt-6 py-2.5 rounded-2xl bg-[#281f40] hover:bg-[#ff9d2b]/20 hover:border-[#ff9d2b] border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-[#ffc06e] transition-all flex items-center justify-center gap-2"
              >
                <span>Accéder aux Négociations InboxAI</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Biometric Shield & Live Calendar Orchestration */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Strain controller */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#373147]">
                <div>
                  <h3 className="text-lg font-bold text-[#e8defb]">Mental Load & HRV Controller (VitalAI)</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Adjust the sliders to observe automatic schedule adaptation</p>
                </div>
                <span className="text-xs font-mono text-[#34d399] font-bold bg-[#34d399]/20 px-2.5 py-1 rounded-full">
                  Active Sensors
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-mono">
                    <span className="font-semibold text-[#e8defb]">Baseline Heart Rate Variability (HRV)</span>
                    <span className="text-slate-900 dark:text-slate-200 font-bold">{biometrics.hrvBaseline} ms</span>
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
                    className="w-full accent-[#ff9d2b] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-mono">
                    <span className="font-semibold text-[#e8defb]">Sleep & Stress Recovery Score</span>
                    <span className="text-orange-500 font-bold">{biometrics.recoveryScore}%</span>
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
                    className="w-full accent-[#ffb2bb] cursor-pointer"
                  />
                </div>

                {/* Presets */}
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-[#968e9a] uppercase tracking-wider block mb-2 font-bold">
                    Quick State Presets
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onUpdateBiometrics({ hrvBaseline: 30, recoveryScore: 28, cognitiveLoad: 'Overloaded' })}
                      className="p-2 rounded-xl bg-[#221c31] hover:bg-[#2c273c] border border-[#ffb4ab]/30 text-xs font-mono text-[#ffb4ab] text-center transition-colors"
                    >
                      ⚡ Critical Fatigue (28%)
                    </button>
                    <button
                      onClick={() => onUpdateBiometrics({ hrvBaseline: 48, recoveryScore: 56, cognitiveLoad: 'Elevated' })}
                      className="p-2 rounded-xl bg-[#221c31] hover:bg-[#2c273c] border border-[#ecd7ff]/30 text-xs font-mono text-slate-900 dark:text-slate-200 text-center transition-colors"
                    >
                      ⚖️ Balanced (56%)
                    </button>
                    <button
                      onClick={() => onUpdateBiometrics({ hrvBaseline: 75, recoveryScore: 94, cognitiveLoad: 'Optimal' })}
                      className="p-2 rounded-xl bg-[#221c31] hover:bg-[#2c273c] border border-[#34d399]/30 text-xs font-mono text-[#34d399] text-center transition-colors"
                    >
                      🌟 Peak Flow (94%)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Calendar Shield Display */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-200">
                    <span className="material-symbols-outlined text-[20px] text-[#ff9d2b]">calendar_month</span>
                    <span>Google Calendar AI Shield</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#34d399]/20 text-[#34d399] font-bold">
                    AUTOMATION ACTIVE
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {biometrics.recoveryScore < 45 ? (
                    <div className="p-4 rounded-2xl bg-[#2c273c] border border-[#ffb2bb]/40 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-orange-500">
                        <span className="material-symbols-outlined text-[18px]">shield</span>
                        <span>Focus Shield Triggered</span>
                      </div>
                      <p className="text-xs text-[#e8defb]">
                        Low recovery ({biometrics.recoveryScore}%). 2 non-priority meetings automatically rescheduled. 90-min recovery block locked.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#221c31] border border-[#34d399]/30 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-[#34d399]">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>High Energy Window Open</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Optimal recovery ({biometrics.recoveryScore}%). Investor calls and high-impact strategic meetings scheduled for today.
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-[#151024]/60 border border-[#373147] space-y-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between items-center">
                      <span>14:00 - 15:30 :</span>
                      <strong className="text-[#ffc06e] bg-[#ff9d2b]/15 px-2 py-0.5 rounded">Protected Deep Work</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>16:00 - 16:30 :</span>
                      <strong className="text-[#e8defb]">Sarah Negotiation (SLA Review)</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>17:00 - 17:45 :</span>
                      <strong className="text-[#34d399]">Board Sync Q3</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#373147] mt-4 text-[11px] text-[#968e9a] font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-[#34d399]">sync</span>
                <span>Synchronized in real-time with Oura Ring & Whoop</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Charts & Executive KPIs */}
      {activeTab === 'executive_kpis' && (
        <div className="bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#373147] gap-3">
            <div>
              <h3 className="text-xl font-bold text-[#e8defb]">Focus Clarity & Workflow History</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Correlation between heart rate variability (HRV) and deep work hours achieved</p>
            </div>
            <span className="text-xs font-mono bg-[#ff9d2b]/20 text-[#ffc06e] px-3 py-1 rounded-full font-bold">
              Last 7 Days
            </span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={energyFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#373147" vertical={false} />
                <XAxis dataKey="day" stroke="#968e9a" fontSize={11} tickLine={false} />
                <YAxis stroke="#968e9a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#151024', borderColor: '#ff9d2b', borderRadius: '16px', fontSize: '12px' }} />
                <Bar dataKey="deepWorkHrs" name="Deep Work Hours" fill="#ff9d2b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="recovery" name="Recovery Score (%)" fill="#ecd7ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW: InboxAI Draft Engine */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-5 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#e8defb] mb-2 font-mono uppercase tracking-wider">
              Select Incoming Email
            </h3>
            {mockStandardEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selectedEmail.id === email.id
                    ? 'bg-[#2c273c] border-[#ff9d2b] shadow-lg'
                    : 'bg-[#221c31] border-transparent hover:border-[#ecd7ff]/30'
                }`}
              >
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-[#e8defb]">{email.sender}</span>
                  <span className="font-mono text-[#968e9a] text-[10px]">{email.time}</span>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{email.subject}</div>
                <div className="text-[11px] text-[#968e9a] line-clamp-1 mt-1">{email.snippet}</div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#373147]">
              <div>
                <span className="text-[10px] font-mono text-[#ff9d2b] uppercase font-bold">InboxAI Smart Draft</span>
                <h4 className="text-base font-bold text-[#e8defb]">{selectedEmail.subject}</h4>
              </div>
              <div className="flex gap-1.5">
                {(['concise', 'warm', 'firm'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setEmailTone(tone)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold capitalize transition-all ${
                      emailTone === tone
                        ? 'bg-[#ff9d2b] text-[#1e1633]'
                        : 'bg-[#221c31] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#151024] border border-[#373147] text-xs font-mono text-slate-900 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {emailTone === 'concise'
                ? `Hello ${selectedEmail.sender.split(' ')[0]},\n\nI verified the clauses with our legal advisor. Signed agreement attached.\n\nBest regards,\nAlexandre`
                : emailTone === 'warm'
                ? `Hello ${selectedEmail.sender.split(' ')[0]},\n\nThank you very much for this constructive feedback! Everything is perfectly clear and compliant. The signed document is attached.\n\nWarmly,\nAlexandre`
                : `Hello ${selectedEmail.sender.split(' ')[0]},\n\nWe confirm the terms without additional modification. Please proceed with deployment without delay.\n\nAlexandre`}
            </div>

            <button
              onClick={() => {
                setSentNotice(true);
                setTimeout(() => setSentNotice(false), 2000);
              }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff9d2b] to-[#ffb2bb] text-[#29074a] font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{sentNotice ? 'Sent successfully!' : 'Approve & Send Draft Response'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: MeetAI & Jira Tasks */}
      {activeTab === 'meetings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-7 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-[#e8defb] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ff9d2b]">mic</span>
              <span>Processed Meeting Transcript (MeetAI)</span>
            </h3>
            <div className="p-4 rounded-2xl bg-[#151024] border border-[#373147] space-y-2.5 text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                <strong className="text-[#ffc06e]">Sarah Jenkins (2:12 PM) :</strong> "We must finalize the API documentation by Friday to launch phase 1 of the pilot."
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                <strong className="text-[#34d399]">Alexandre (2:13 PM) :</strong> "Marcus is on it. I will create a high-priority Jira ticket right now."
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#e8defb] mb-3">Jira Task Detected & Extracted</h3>
              <div className="p-4 rounded-2xl bg-[#2c273c] border border-[#ecd7ff]/30 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#e8defb]">
                  <span>[ENG-492] Write Phase 1 API Doc</span>
                  <span className="text-[#34d399] font-mono text-[10px]">99.8% Confidence</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Assigned to: <strong>Marcus (Head of Eng)</strong> • Priority: <strong>High</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setJiraSynced(true);
                setTimeout(() => setJiraSynced(false), 2500);
              }}
              className="w-full py-3 rounded-full bg-[#34d399] text-[#151024] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>{jiraSynced ? 'Created in Jira & Posted on Slack!' : 'Sync to Jira & Slack'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW: Finance & Valuation */}
      {activeTab === 'finance' && (
        <div className="bg-white dark:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#373147]">
            <div>
              <h3 className="text-xl font-bold text-[#e8defb]">Cash Flow Modeling, Runway & M&A Valuation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Continuous data synchronization from Stripe, Carta, and ExitReady</p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#34d399]/20 text-[#34d399] font-bold">
              27.1 Months of Runway
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#221c31] border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">Annualized ARR</div>
              <div className="text-3xl font-black text-[#ffc06e] font-mono my-1.5">$1,540,800</div>
              <div className="text-[11px] text-[#34d399] font-mono">+28.4% YoY Growth</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#221c31] border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">Estimated M&A Valuation</div>
              <div className="text-3xl font-black text-orange-500 font-mono my-1.5">$19.1M</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">12.4x ARR Multiple</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#221c31] border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">Monthly Net Burn</div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-200 font-mono my-1.5">$45,000</div>
              <div className="text-[11px] text-[#34d399] font-mono">Runway extended to late 2028</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
