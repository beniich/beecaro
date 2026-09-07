import React, { useState } from 'react';
import { NavigationPage } from '../../types/bizos';

interface SolutionsMorePageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial: () => void;
  lang?: 'fr' | 'en';
}

export const SolutionsMorePage: React.FC<SolutionsMorePageProps> = ({
  onNavigate,
  onOpenTrial,
  lang = 'fr'
}) => {
  const [activeTab, setActiveTab] = useState<'callcopilot' | 'exitready'>('callcopilot');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [convictionScore, setConvictionScore] = useState(91);

  const runSentimentSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setSimulationRunning(false);
      setConvictionScore(96);
    }, 1200);
  };

  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Ambient glow */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[400px] bg-[#ecd7ff]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2c273c]/80 border border-[#ecd7ff]/25 text-xs font-mono text-[#ecd7ff] shadow-[0_0_20px_rgba(216,180,254,0.15)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#ffb2bb] animate-pulse"></span>
          <span>{lang === 'fr' ? 'STRATÉGIE & DUE DILIGENCE' : 'STRATEGY & DUE DILIGENCE'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#e8defb] tracking-tight leading-[1.1] mb-6">
          {lang === 'fr' ? (
            <>
              CallCopilot & ExitReady : <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Maîtrisez vos négociations.
              </span>
            </>
          ) : (
            <>
              CallCopilot & ExitReady: <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Command Every Negotiation.
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-[#cdc3d0] max-w-3xl mx-auto leading-relaxed mb-8">
          {lang === 'fr'
            ? "Conçus spécialement pour les tours de table d'investisseurs, les fusions-acquisitions et la due diligence permanente."
            : "Engineered specifically for high-stakes investor pitch rounds, M&A due diligence, and continuous valuation benchmarking."}
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/20">
          <button
            onClick={() => setActiveTab('callcopilot')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeTab === 'callcopilot'
                ? 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_15px_rgba(216,180,254,0.3)]'
                : 'text-[#cdc3d0] hover:text-white'
            }`}
          >
            CallCopilot (Investor Sentiment)
          </button>
          <button
            onClick={() => setActiveTab('exitready')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
              activeTab === 'exitready'
                ? 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_15px_rgba(216,180,254,0.3)]'
                : 'text-[#cdc3d0] hover:text-white'
            }`}
          >
            ExitReady (VDR & Valuation)
          </button>
        </div>
      </div>

      {/* Tab 1: CallCopilot */}
      {activeTab === 'callcopilot' && (
        <div className="space-y-12 relative z-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {/* Live Objection Handling & Sentiment Radar */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#373147]">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ffb2bb]">
                  <span className="material-symbols-outlined text-[20px]">podcasts</span>
                  <span>Live Investor Pitch Call Simulation</span>
                </div>
                <button
                  onClick={runSentimentSimulation}
                  disabled={simulationRunning}
                  className="px-3 py-1 rounded-full text-xs font-mono bg-[#2c273c] text-[#ecd7ff] border border-[#ecd7ff]/20 hover:border-[#ecd7ff]/50 transition-colors"
                >
                  {simulationRunning ? 'Analyzing...' : 'Simulate Objection'}
                </button>
              </div>

              {/* Call Dialog */}
              <div className="p-4 rounded-2xl bg-[#221c31] border border-[#373147] space-y-2 text-xs">
                <div className="flex justify-between text-[#cdc3d0]">
                  <strong className="text-[#ffb2bb]">Partner (Tier-1 VC):</strong>
                  <span className="font-mono text-[11px]">14:22</span>
                </div>
                <p className="text-[#e8defb]">
                  "Your CAC payback period looks solid, but how do you defend against enterprise incumbents launching copycat features next quarter?"
                </p>
              </div>

              {/* Real-Time AI Objection Prompt Card */}
              <div className="p-4 rounded-2xl bg-[#2c273c] border border-[#ecd7ff]/40 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#ecd7ff]">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#ffb2bb]">psychology</span>
                    <span>VitalAI Real-time Coaching Response</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#34d399] font-bold">Recommended Pivot</span>
                </div>
                <p className="text-xs text-[#e8defb] leading-relaxed">
                  "Highlight our proprietary bio-sync telemetry patent and our 94% retention moat. Mention that our enterprise switching cost is 4x higher due to unified CRM-to-VDR synchronization."
                </p>
              </div>
            </div>

            {/* Right Conviction & Term Sheet Probability */}
            <div className="lg:col-span-5 bg-[#221c31] border border-[#ecd7ff]/20 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#373147] mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#ecd7ff] font-bold">Investor Conviction Radar</span>
                  <span className="text-xs font-mono text-[#34d399] font-bold">Tier-1 Lead</span>
                </div>

                <div className="text-center py-6">
                  <div className="text-5xl font-black text-[#ecd7ff] font-mono tracking-tight">{convictionScore}%</div>
                  <div className="text-xs font-mono text-[#ffb2bb] mt-1">Term Sheet Likelihood: VERY HIGH</div>
                </div>

                <div className="space-y-2 text-xs text-[#cdc3d0] bg-[#151024]/60 p-3 rounded-xl border border-[#373147]">
                  <div className="flex justify-between">
                    <span>Valuation Multiple Alignment:</span>
                    <strong className="text-[#e8defb]">12.4x ARR</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Follow-Up Strategy:</span>
                    <strong className="text-[#34d399]">Auto-Send ExitReady Data Room</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenTrial}
                className="w-full mt-6 bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:scale-102 transition-transform"
              >
                Enable CallCopilot for Next Pitch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ExitReady */}
      {activeTab === 'exitready' && (
        <div className="space-y-12 relative z-10 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {/* VDR Virtual Data Room & Diligence Checklist */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#373147]">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ecd7ff]">
                  <span className="material-symbols-outlined text-[20px]">folder_open</span>
                  <span>Automated Virtual Data Room (VDR)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#34d399]/20 text-[#34d399]">
                  100% Due Diligence Ready
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'Corporate Cap Table & Voting Rights', size: '2.4 MB', status: 'Audited' },
                  { name: 'Audited Financial Statements (Q1-Q4)', size: '8.1 MB', status: 'Live Synced' },
                  { name: 'SOC2 Type II & Security Whitepaper', size: '4.7 MB', status: 'Certified' },
                  { name: 'Enterprise Customer Contracts (Redacted)', size: '14.2 MB', status: 'Encrypted' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#221c31] border border-[#373147] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#ecd7ff]">description</span>
                      <div>
                        <div className="font-bold text-[#e8defb]">{doc.name}</div>
                        <div className="text-[10px] text-[#968e9a] font-mono">{doc.size}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2c273c] text-[#ecd7ff] border border-[#ecd7ff]/15">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: SaaS Multiple & Valuation Benchmark */}
            <div className="lg:col-span-5 bg-[#221c31] border border-[#ecd7ff]/20 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#373147] mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#ecd7ff] font-bold">Valuation Multiple Benchmark</span>
                  <span className="text-xs font-mono text-[#ecd7ff]">SaaS Index</span>
                </div>

                <div className="text-center py-6">
                  <div className="text-4xl font-black text-[#ecd7ff] font-mono tracking-tight">$18,400,000</div>
                  <div className="text-xs font-mono text-[#34d399] mt-1">Estimated Valuation (12.4x ARR)</div>
                </div>

                <div className="space-y-2 text-xs text-[#cdc3d0] bg-[#151024]/60 p-3.5 rounded-xl border border-[#373147]">
                  <div className="flex justify-between">
                    <span>Net Revenue Retention:</span>
                    <strong className="text-[#e8defb]">134%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Margin:</span>
                    <strong className="text-[#e8defb]">84.2%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rule of 40 Score:</span>
                    <strong className="text-[#34d399]">52% (Elite Tier)</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenTrial}
                className="w-full mt-6 bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:scale-102 transition-transform"
              >
                Generate ExitReady Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
