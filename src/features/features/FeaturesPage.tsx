import React, { useState } from 'react';
import { NavigationPage } from '../../types/bizos';
import { mockArchitectureNodes } from '../../data/bizosData';

interface FeaturesPageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial: () => void;
  lang?: 'fr' | 'en';
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({
  onNavigate,
  onOpenTrial,
  lang = 'fr'
}) => {
  const [activeNodeId, setActiveNodeId] = useState<'core' | 'sales' | 'hr' | 'finance' | 'ops'>('core');
  const activeNode = mockArchitectureNodes[activeNodeId];

  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-12 left-1/3 w-[600px] h-[350px] bg-[#ecd7ff]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2c273c]/80 border border-[#ecd7ff]/25 text-xs font-mono text-[#ecd7ff] shadow-[0_0_20px_rgba(216,180,254,0.15)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#ffb2bb] animate-pulse"></span>
          <span>{lang === 'fr' ? 'VISION OS UNIFIÉ' : 'THE UNIFIED OS VISION'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#e8defb] tracking-tight leading-[1.1] mb-6">
          {lang === 'fr' ? (
            <>
              Une seule source de vérité pour des <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                opérations d'entreprise intelligentes
              </span>
            </>
          ) : (
            <>
              A single source of truth for <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                intelligent business operations
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-[#cdc3d0] max-w-3xl mx-auto leading-relaxed">
          {lang === 'fr'
            ? "BizOS élimine les flux de travail fragmentés. Notre architecture VitalAI lie données, actions et décisions dans un environnement fluide et respirant."
            : "BizOS eliminates fragmented workflows. Our VitalAI architecture binds data, action, and insight into one seamless, breathable environment designed for cognitive clarity."}
        </p>
      </div>

      {/* Interactive Architecture Diagram: Symbiotic Modules */}
      <section className="mb-24 relative z-10">
        <div className="text-center mb-8">
          <span className="text-xs font-mono text-[#ffb2bb] uppercase tracking-widest font-semibold">
            {lang === 'fr' ? '● ARCHITECTURE INTERACTIVE' : '● INTERACTIVE ARCHITECTURE'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            {lang === 'fr' ? 'Les Modules Symbiotiques' : 'Symbiotic Modules'}
          </h2>
          <p className="text-xs sm:text-sm text-[#cdc3d0] mt-1">
            {lang === 'fr' ? 'Cliquez sur un nœud pour observer les flux de données et déclencheurs en temps réel.' : 'Click on any node to observe real-time data flows and cross-module triggers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Interactive Visual Graph (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[420px] relative p-4 select-none">
            {/* SVG Connecting Lines & Pulsing Streams */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 400">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ecd7ff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ffb2bb" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {/* Lines from Center (250, 200) to 4 orbiting nodes */}
              <line x1="250" y1="200" x2="100" y2="90" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="250" y1="200" x2="400" y2="90" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="250" y1="200" x2="100" y2="310" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="250" y1="200" x2="400" y2="310" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />

              {/* Pulsing ring around central node */}
              <circle cx="250" cy="200" r="64" fill="none" stroke="#ecd7ff" strokeOpacity="0.2" strokeWidth="1.5" className="animate-ping" />
            </svg>

            {/* Orbiting Node 1: Sales Intelligence (Top Left) */}
            <button
              onClick={() => setActiveNodeId('sales')}
              className={`absolute top-6 left-6 sm:left-12 p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                activeNodeId === 'sales'
                  ? 'bg-[#2c273c] border-[#ffb2bb] shadow-[0_0_25px_rgba(255,178,187,0.4)] scale-105'
                  : 'bg-[#221c31] border-[#373147] hover:border-[#ffb2bb]/50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#ffb2bb]/10 flex items-center justify-center text-[#ffb2bb]">
                <span className="material-symbols-outlined text-[18px]">monitoring</span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#e8defb]">Sales Intelligence</div>
                <div className="text-[10px] text-[#cdc3d0] font-mono">94% Win Rate</div>
              </div>
            </button>

            {/* Orbiting Node 2: HR & Bandwidth (Top Right) */}
            <button
              onClick={() => setActiveNodeId('hr')}
              className={`absolute top-6 right-6 sm:right-12 p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                activeNodeId === 'hr'
                  ? 'bg-[#2c273c] border-[#e1daff] shadow-[0_0_25px_rgba(225,218,255,0.4)] scale-105'
                  : 'bg-[#221c31] border-[#373147] hover:border-[#e1daff]/50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#e1daff]/10 flex items-center justify-center text-[#e1daff]">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#e8defb]">Human Capital</div>
                <div className="text-[10px] text-[#cdc3d0] font-mono">85% Capacity</div>
              </div>
            </button>

            {/* Central Node: VitalAI Core (Center) */}
            <button
              onClick={() => setActiveNodeId('core')}
              className={`relative z-20 p-5 sm:p-6 rounded-3xl border transition-all flex flex-col items-center text-center max-w-[200px] ${
                activeNodeId === 'core'
                  ? 'bg-[#2c273c] border-[#ecd7ff] shadow-[0_0_35px_rgba(216,180,254,0.5)] scale-110'
                  : 'bg-[#221c31] border-[#ecd7ff]/30 hover:scale-105'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ecd7ff] to-[#ffb2bb] p-[1.5px] mb-2 shadow-[0_0_20px_rgba(216,180,254,0.4)]">
                <div className="w-full h-full bg-[#151024] rounded-[14px] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ecd7ff] text-[24px]">hub</span>
                </div>
              </div>
              <div className="text-sm font-bold text-[#e8defb]">VitalAI Core</div>
              <div className="text-[10px] font-mono text-[#ecd7ff]">Central Nervous System</div>
            </button>

            {/* Orbiting Node 3: Dynamic Finance (Bottom Left) */}
            <button
              onClick={() => setActiveNodeId('finance')}
              className={`absolute bottom-6 left-6 sm:left-12 p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                activeNodeId === 'finance'
                  ? 'bg-[#2c273c] border-[#ecd7ff] shadow-[0_0_25px_rgba(216,180,254,0.4)] scale-105'
                  : 'bg-[#221c31] border-[#373147] hover:border-[#ecd7ff]/50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#ecd7ff]/10 flex items-center justify-center text-[#ecd7ff]">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#e8defb]">Dynamic Finance</div>
                <div className="text-[10px] text-[#cdc3d0] font-mono">18 Mo Runway</div>
              </div>
            </button>

            {/* Orbiting Node 4: Automated Operations (Bottom Right) */}
            <button
              onClick={() => setActiveNodeId('ops')}
              className={`absolute bottom-6 right-6 sm:right-12 p-3 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                activeNodeId === 'ops'
                  ? 'bg-[#2c273c] border-[#ffb2bb] shadow-[0_0_25px_rgba(255,178,187,0.4)] scale-105'
                  : 'bg-[#221c31] border-[#373147] hover:border-[#ffb2bb]/50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#ffb2bb]/10 flex items-center justify-center text-[#ffb2bb]">
                <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#e8defb]">Automated Ops</div>
                <div className="text-[10px] text-[#cdc3d0] font-mono">42 Sequences</div>
              </div>
            </button>
          </div>

          {/* Node Inspector Panel (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-[#221c31] border border-[#ecd7ff]/15 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2c273c] border border-[#ecd7ff]/20 flex items-center justify-center text-[#ecd7ff]">
                    <span className="material-symbols-outlined text-[22px]">{activeNode.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#e8defb]">{activeNode.title}</h3>
                    <span className="text-[11px] font-mono text-[#ecd7ff] uppercase">Active Synapse</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30">
                  LIVE SYNC
                </span>
              </div>

              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-6">
                {activeNode.text}
              </p>

              <div className="space-y-3 p-4 rounded-xl bg-[#151024]/60 border border-[#373147]">
                <div className="text-[11px] font-mono text-[#ecd7ff] uppercase tracking-wider font-semibold">
                  {lang === 'fr' ? 'Télémétrie en temps réel' : 'Real-time Telemetry'}
                </div>
                <div className="text-xs font-bold text-[#e8defb] font-mono">
                  {activeNode.metrics}
                </div>
                <div className="text-[11px] text-[#968e9a]">
                  Interconnecté avec: {activeNode.connectedNodes.map(n => n.toUpperCase()).join(', ')}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onOpenTrial}
                className="w-full bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:scale-102 transition-transform flex items-center justify-center gap-2"
              >
                <span>{lang === 'fr' ? 'Tester cette architecture' : 'Deploy This Architecture'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The Shift from Chaos to Clarity */}
      <section className="mb-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono text-[#ecd7ff] uppercase tracking-widest font-semibold">
            {lang === 'fr' ? '● PARADIGME OPÉRATIONNEL' : '● OPERATIONAL PARADIGM'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1 mb-3">
            {lang === 'fr' ? 'Le Passage du Chaos à la Clarté' : 'The Shift from Chaos to Clarity'}
          </h2>
          <p className="text-sm text-[#cdc3d0]">
            {lang === 'fr'
              ? 'Comparez l\'ancien modèle fragmenté avec l\'intelligence autonome de BizOS.'
              : 'Compare the fragmented status quo with the sovereign clarity of BizOS.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#151024]/80 border border-[#ffb4ab]/20 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ffb4ab] uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>{lang === 'fr' ? 'L\'ANCIEN MODÈLE (SILOS)' : 'THE OLD WAY (SILOED)'}</span>
            </div>

            <div className="space-y-4 text-xs text-[#cdc3d0]">
              <div className="p-3.5 rounded-xl bg-[#221c31]/50 border border-[#ffb4ab]/15">
                <div className="font-bold text-[#e8defb] mb-1">❌ Silos d'informations et doublons</div>
                <div>Chaque équipe utilise son propre outil sans communication unifiée. 3h/jour perdues à synchroniser.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#221c31]/50 border border-[#ffb4ab]/15">
                <div className="font-bold text-[#e8defb] mb-1">❌ Décisions réactives en état de fatigue</div>
                <div>Le fondateur passe ses soirées à répondre à des emails génériques au lieu de se reposer.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#221c31]/50 border border-[#ffb4ab]/15">
                <div className="font-bold text-[#e8defb] mb-1">❌ Prévisions manuelles obsolètes</div>
                <div>Les feuilles Excel de trésorerie sont toujours en retard par rapport aux signatures réelles.</div>
              </div>
            </div>
          </div>

          {/* With BizOS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/30 shadow-2xl shadow-[#ecd7ff]/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#34d399] uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{lang === 'fr' ? 'AVEC BIZOS (VITALAI)' : 'WITH BIZOS (VITALAI)'}</span>
            </div>

            <div className="space-y-4 text-xs text-[#cdc3d0]">
              <div className="p-3.5 rounded-xl bg-[#221c31] border border-[#ecd7ff]/20">
                <div className="font-bold text-[#e8defb] mb-1 flex items-center justify-between">
                  <span> Graphe Synaptique Unifié</span>
                  <span className="text-[#34d399] font-mono text-[10px]">Autonome</span>
                </div>
                <div>Tous vos modules (Vente, RH, Finance, Ops) se synchronisent en 14ms sans action humaine.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#221c31] border border-[#ecd7ff]/20">
                <div className="font-bold text-[#e8defb] mb-1 flex items-center justify-between">
                  <span> Bouclier de Calendrier & Bio-Sync</span>
                  <span className="text-[#ffb2bb] font-mono text-[10px]">Anti-Burnout</span>
                </div>
                <div>InboxAI et MeetAI protègent vos blocs de concentration dès que votre récupération faiblit.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#221c31] border border-[#ecd7ff]/20">
                <div className="font-bold text-[#e8defb] mb-1 flex items-center justify-between">
                  <span> Modélisation Prédictive en Direct</span>
                  <span className="text-[#ecd7ff] font-mono text-[10px]">94% Précision</span>
                </div>
                <div>Vos indicateurs de valorisation et de runway s'ajustent instantanément à chaque contrat.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules in Motion Bento Grid (Matching Screenshot 2 & 6) */}
      <section className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-[#ffb2bb] uppercase tracking-widest font-semibold">
            {lang === 'fr' ? '● BENTO D\'EXÉCUTION' : '● BENTO IN MOTION'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            {lang === 'fr' ? 'Les Modules en Action' : 'Modules in Motion'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bento 1: Predictive Pipeline (8 Cols) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-[#ffb2bb] uppercase tracking-wider font-bold">
                  Sales Intelligence
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-[#2c273c] text-[#ecd7ff] border border-[#ecd7ff]/20">
                  94% Prediction Accuracy
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">Predictive Pipeline Engine</h3>
              <p className="text-xs text-[#cdc3d0] mb-6">
                Calculates deal closure probabilities based on meeting transcripts, sentiment radar, and stakeholder interactions.
              </p>

              {/* Visual Pipeline Deals */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-[#221c31] border border-[#ecd7ff]/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></span>
                    <div>
                      <strong className="text-[#e8defb]">Acme Global (Enterprise ARR)</strong>
                      <div className="text-[11px] text-[#cdc3d0]">Final SLA Review with Sarah Jenkins</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#ecd7ff]">$84,000 /yr</div>
                    <div className="text-[10px] text-[#34d399] font-mono">98% Close Probability</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#221c31] border border-[#ecd7ff]/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffb2bb]"></span>
                    <div>
                      <strong className="text-[#e8defb]">VentureFlow SaaS</strong>
                      <div className="text-[11px] text-[#cdc3d0]">Security Questionnaire Verification</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#ecd7ff]">$42,000 /yr</div>
                    <div className="text-[10px] text-[#ffb2bb] font-mono">82% Close Probability</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center text-xs text-[#cdc3d0] border-t border-[#373147] mt-6">
              <span>Automatically updates cash runway in Dynamic Finance.</span>
              <span className="font-mono text-[#ecd7ff] font-bold">14ms latency</span>
            </div>
          </div>

          {/* Bento 2: Resource Utilization Radial Gauge (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col items-center justify-between text-center">
            <div>
              <span className="text-xs font-mono text-[#e1daff] uppercase tracking-wider font-bold">
                Human Capital
              </span>
              <h3 className="text-lg font-bold text-[#e8defb] mt-1 mb-4">Resource Utilization</h3>

              {/* 85% Radial Gauge SVG */}
              <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#2c273c" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ecd7ff"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset="37.68"
                    strokeLinecap="round"
                    className="transition-all duration-1000 shadow-[0_0_15px_rgba(216,180,254,0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[#e8defb] font-mono">85%</span>
                  <span className="text-[10px] font-mono text-[#cdc3d0]">Optimal</span>
                </div>
              </div>

              <p className="text-xs text-[#cdc3d0] mt-2">
                Team bandwidth is balanced. Zero risk of engineering fatigue this sprint.
              </p>
            </div>

            <button 
              onClick={() => onNavigate('solutions-vitalai')}
              className="w-full mt-4 py-2 px-3 rounded-xl bg-[#221c31] hover:bg-[#2c273c] text-xs font-semibold text-[#ecd7ff] border border-[#ecd7ff]/15 transition-colors"
            >
              View Capacity Matrix
            </button>
          </div>

          {/* Bento 3: Dynamic Forecasting (4 Cols) */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-[#ecd7ff] uppercase tracking-wider font-bold">
                Dynamic Finance
              </span>
              <h3 className="text-lg font-bold text-[#e8defb] mt-1 mb-2">Live Runway Calibrator</h3>
              <p className="text-xs text-[#cdc3d0] mb-4">
                Auto-recalibrates burn rate as hiring tickets and cloud infrastructure auto-scale.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-[#cdc3d0] mb-1">
                    <span>Base Runway (Cash in Bank)</span>
                    <span className="font-mono text-[#e8defb] font-bold">18.4 Mo</span>
                  </div>
                  <div className="w-full h-2 bg-[#221c31] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ecd7ff] rounded-full w-[78%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#cdc3d0] mb-1">
                    <span>Scenario: +2 Senior Engineers</span>
                    <span className="font-mono text-[#ffb2bb] font-bold">15.2 Mo</span>
                  </div>
                  <div className="w-full h-2 bg-[#221c31] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ffb2bb] rounded-full w-[64%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#373147] text-[11px] text-[#968e9a] font-mono">
              ⚡ Stripe Webhook Synced (0-sec delay)
            </div>
          </div>

          {/* Bento 4: Invisible Onboarding Terminal Flow (8 Cols) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono text-[#ffb2bb] uppercase tracking-wider font-bold">
                  Automated Operations
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20">
                  Trigger: Hired
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">Invisible Onboarding Sequence</h3>
              <p className="text-xs text-[#cdc3d0] mb-4">
                When a new team member is signed, Ops executes zero-touch credentials, GitHub access, and hardware provisioning.
              </p>

              {/* Terminal Code Console */}
              <div className="bg-[#100b1f] border border-[#373147] rounded-2xl p-4 font-mono text-xs text-[#ecd7ff] space-y-1.5 overflow-x-auto">
                <div className="text-[#968e9a]">// VitalAI Autonomous Trigger</div>
                <div className="text-[#34d399]">&gt; trigger_onboarding(employee_id: "EMP-9402", role: "Staff Engineer")</div>
                <div className="text-[#cdc3d0]">&gt; [OK] provision_google_workspace("marcus.v@lumina.io")</div>
                <div className="text-[#cdc3d0]">&gt; [OK] invite_github_org(role: "maintainer", repo_access: ["core", "api"])</div>
                <div className="text-[#cdc3d0]">&gt; [OK] setup_payroll_profile(currency: "USD", provider: "Rippling")</div>
                <div className="text-[#ffb2bb]">&gt; [OK] sync_calendar_shielding(deep_work_mode: ACTIVE)</div>
                <div className="text-[#34d399] font-bold">&gt; Sequence completed in 1.4 seconds (0 human interventions).</div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs text-[#cdc3d0] border-t border-[#373147] mt-4">
              <span>Saved 4.5 hours of manual IT/HR management.</span>
              <span className="text-[#34d399] font-mono font-bold">100% Error-Free</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
