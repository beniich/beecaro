import React, { useState } from 'react';
import { NavigationPage, BiometricState } from '../../types/bizos';

interface SolutionsVitalAIPageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial: () => void;
  biometrics: BiometricState;
  onUpdateBiometrics: (updated: Partial<BiometricState>) => void;
  lang?: 'fr' | 'en';
}

export const SolutionsVitalAIPage: React.FC<SolutionsVitalAIPageProps> = ({
  onNavigate,
  onOpenTrial,
  biometrics,
  onUpdateBiometrics,
  lang = 'fr'
}) => {
  const [workloadSlider, setWorkloadSlider] = useState<number>(75);
  const [actionAccepted, setActionAccepted] = useState(false);
  const [connectedWearable, setConnectedWearable] = useState<string>(biometrics.wearableConnected);

  const handleWearableConnect = (name: 'Apple Watch' | 'Oura Ring' | 'Whoop') => {
    setConnectedWearable(name);
    onUpdateBiometrics({
      wearableConnected: name,
      lastSyncTime: 'Just now',
      batteryLevel: 94
    });
  };

  const handleAcceptIntervention = () => {
    setActionAccepted(true);
    onUpdateBiometrics({
      cognitiveLoad: 'Optimal',
      stressLevel: 'Low',
      recommendedAction: 'Calendar shielded. 45-min restorative focus window locked in.'
    });
  };

  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-16 right-1/4 w-[600px] h-[400px] bg-[#ecd7ff]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2c273c]/80 border border-[#ecd7ff]/25 text-xs font-mono text-[#ecd7ff] shadow-[0_0_20px_rgba(216,180,254,0.15)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
          <span>{lang === 'fr' ? '● VITALAI OS EST EN LIGNE' : '● VITALAI OS IS LIVE'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#e8defb] tracking-tight leading-[1.1] mb-6">
          {lang === 'fr' ? (
            <>
              Stoppez le Burnout. <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Scalez avec Clarté.
              </span>
            </>
          ) : (
            <>
              Stop the Burnout. <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Scale with Clarity.
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-[#cdc3d0] max-w-3xl mx-auto leading-relaxed mb-8">
          {lang === 'fr'
            ? "Le premier système d'exploitation qui synchronise vos performances commerciales avec votre état physiologique. Parce que les fondateurs épuisés construisent des entreprises fragiles."
            : "The first operating system that syncs your business performance with your physiological state. Because exhausted founders build fragile companies."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenTrial}
            className="w-full sm:w-auto bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(216,180,254,0.35)] hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>{lang === 'fr' ? 'Synchroniser votre Wearable' : 'Sync Your Wearable'}</span>
            <span className="material-symbols-outlined text-[18px]">watch</span>
          </button>
          <button
            onClick={() => onNavigate('workspace')}
            className="w-full sm:w-auto bg-[#221c31] hover:bg-[#2c273c] border border-[#ecd7ff]/20 text-[#e8defb] px-7 py-4 rounded-full font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ffb2bb]">tune</span>
            <span>{lang === 'fr' ? 'Tester le simulateur interactif' : 'Open Live Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Interactive Graph: Cognitive Load vs. Output (Screenshot 5) */}
      <section className="mb-20 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#373147] mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#ecd7ff] font-bold">
              <span className="material-symbols-outlined text-[20px] text-[#ffb2bb]">vital_signs</span>
              <span>{lang === 'fr' ? 'Télémétrie Physiologique en Direct' : 'Live Physiological Telemetry'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e8defb] tracking-tight mt-1">
              Cognitive Load vs. Output Over Time
            </h2>
          </div>

          {/* Biometric Badges (HRV 42ms | Recovery 38%) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffb2bb]/10 flex items-center justify-center text-[#ffb2bb]">
                <span className="material-symbols-outlined text-[22px] animate-pulse">favorite</span>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#cdc3d0]">HRV Baseline</div>
                <div className="text-xl font-bold font-mono text-[#e8defb]">{biometrics.hrvBaseline} ms</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ecd7ff]/10 flex items-center justify-center text-[#ecd7ff]">
                <span className="material-symbols-outlined text-[22px]">bedtime</span>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#cdc3d0]">Recovery Score</div>
                <div className="text-xl font-bold font-mono text-[#ffb2bb]">{biometrics.recoveryScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Workload Scrubber */}
        <div className="mb-8 p-4 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/15">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-[#e8defb]">
              {lang === 'fr' ? 'Ajuster la charge de travail simulée' : 'Adjust Simulated Daily Workload'}
            </span>
            <span className="font-mono text-[#ecd7ff] font-bold">{workloadSlider}% Strain</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={workloadSlider}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWorkloadSlider(val);
              onUpdateBiometrics({
                hrvBaseline: Math.round(55 - (val * 0.2)),
                recoveryScore: Math.round(75 - (val * 0.45)),
                stressLevel: val > 75 ? 'Critical' : val > 50 ? 'Moderate' : 'Low'
              });
            }}
            className="w-full accent-[#ecd7ff] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#968e9a] mt-1">
            <span>Calm (Deep Focus)</span>
            <span>Balanced</span>
            <span>Intense (High Cognitive Strain)</span>
          </div>
        </div>

        {/* Visual Graph Curve */}
        <div className="relative h-64 w-full bg-[#151024]/60 border border-[#373147] rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 grid grid-rows-4 w-full pointer-events-none opacity-20">
            <div className="border-b border-[#ecd7ff]"></div>
            <div className="border-b border-[#ecd7ff]"></div>
            <div className="border-b border-[#ecd7ff]"></div>
            <div className="border-b border-[#ecd7ff]"></div>
          </div>

          {/* SVG Area Paths */}
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="strainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb2bb" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffb2bb" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ecd7ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ecd7ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area under cognitive load */}
            <path
              d={`M 0 160 Q 200 ${180 - workloadSlider * 1.2} 400 ${140 - workloadSlider * 0.8} T 800 ${120 - workloadSlider * 0.6} L 800 200 L 0 200 Z`}
              fill="url(#strainGrad)"
            />
            {/* Cognitive Strain Line */}
            <path
              d={`M 0 160 Q 200 ${180 - workloadSlider * 1.2} 400 ${140 - workloadSlider * 0.8} T 800 ${120 - workloadSlider * 0.6}`}
              fill="none"
              stroke="#ffb2bb"
              strokeWidth="3"
            />

            {/* Output Performance Curve */}
            <path
              d={`M 0 180 Q 200 60 400 70 T 800 110`}
              fill="none"
              stroke="#ecd7ff"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Time Labels */}
          <div className="flex justify-between text-[11px] font-mono text-[#cdc3d0] relative z-10 px-2 pt-2 border-t border-[#373147]">
            <span>08:00 (Awake)</span>
            <span>12:00 (Peak Strain)</span>
            <span>16:00 (Cognitive Drop)</span>
            <span>20:00 (Restoration)</span>
          </div>
        </div>

        {/* AI Intervention Card */}
        <div className="mt-8 p-5 rounded-2xl bg-[#2c273c] border border-[#ecd7ff]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ecd7ff] to-[#ffb2bb] p-[1px] flex-shrink-0">
              <div className="w-full h-full bg-[#151024] rounded-[10px] flex items-center justify-center text-[#ecd7ff]">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-[#e8defb] flex items-center gap-2">
                <span>VitalAI Autonomic Intervention</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ffb2bb]/20 text-[#ffb2bb]">
                  {actionAccepted ? 'Executed' : 'Recommended'}
                </span>
              </div>
              <p className="text-xs text-[#cdc3d0] mt-1 max-w-xl">
                {actionAccepted 
                  ? 'Calendar slots protected. 2 non-essential meetings shifted to tomorrow morning. 45-min deep rest initiated.'
                  : 'Recovery is 38%. Rescheduling non-essential afternoon meetings to tomorrow. 45 min deep rest recommended.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {!actionAccepted ? (
              <>
                <button
                  onClick={handleAcceptIntervention}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(216,180,254,0.3)] hover:scale-105 transition-all"
                >
                  Accept Action
                </button>
                <button
                  onClick={() => setActionAccepted(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-full text-xs font-semibold text-[#cdc3d0] hover:text-white bg-[#221c31] border border-[#ecd7ff]/15"
                >
                  Adjust Plan
                </button>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#34d399] font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>PROTECTED</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Seamlessly Integrated with your Biology (Wearable Devices) */}
      <section className="mb-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-[#ecd7ff] uppercase tracking-widest font-semibold">
            {lang === 'fr' ? '● MATÉRIEL PHYSIOLOGIQUE' : '● HARDWARE BIO-SYNC'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            {lang === 'fr' ? 'Intégré à votre biologie' : 'Seamlessly Integrated with Your Biology'}
          </h2>
          <p className="text-xs sm:text-sm text-[#cdc3d0] mt-1">
            {lang === 'fr'
              ? 'Connectez votre montre ou bague en 1 clic pour activer la protection autonome.'
              : 'Connect your wearable sensor in 1 click to activate autonomous calendar shielding.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Apple Watch */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between hover:border-[#ecd7ff]/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ecd7ff]/10 border border-[#ecd7ff]/20 flex items-center justify-center text-[#ecd7ff] mb-6">
                <span className="material-symbols-outlined text-[26px]">watch</span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">Apple Watch Ultra / Series</h3>
              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-6">
                Continuous optical heart rate variability (HRV), sleep staging, VO2 max, and active energy expenditure telemetry.
              </p>
            </div>

            <button
              onClick={() => handleWearableConnect('Apple Watch')}
              className={`w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                connectedWearable === 'Apple Watch'
                  ? 'bg-[#34d399]/20 border border-[#34d399] text-[#34d399]'
                  : 'bg-[#221c31] hover:bg-[#2c273c] text-[#ecd7ff] border border-[#ecd7ff]/20'
              }`}
            >
              {connectedWearable === 'Apple Watch' ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Connected (Syncing)</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  <span>Connect Apple Watch</span>
                </>
              )}
            </button>
          </div>

          {/* Oura Ring */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between hover:border-[#ecd7ff]/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffb2bb]/10 border border-[#ffb2bb]/20 flex items-center justify-center text-[#ffb2bb] mb-6">
                <span className="material-symbols-outlined text-[26px]">vital_signs</span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">Oura Ring Gen 3</h3>
              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-6">
                Deep readiness scoring, circadian rhythm alignment, body temperature variations, and overnight restorative sleep curves.
              </p>
            </div>

            <button
              onClick={() => handleWearableConnect('Oura Ring')}
              className={`w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                connectedWearable === 'Oura Ring'
                  ? 'bg-[#34d399]/20 border border-[#34d399] text-[#34d399]'
                  : 'bg-[#221c31] hover:bg-[#2c273c] text-[#ffb2bb] border border-[#ffb2bb]/20'
              }`}
            >
              {connectedWearable === 'Oura Ring' ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Connected (Syncing)</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  <span>Connect Oura Ring</span>
                </>
              )}
            </button>
          </div>

          {/* Whoop */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between hover:border-[#ecd7ff]/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#e1daff]/10 border border-[#e1daff]/20 flex items-center justify-center text-[#e1daff] mb-6">
                <span className="material-symbols-outlined text-[26px]">fitness_center</span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">Whoop 4.0 Strap</h3>
              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-6">
                Strain vs recovery optimization, real-time stress coaching, and auto-adaptive deep work recommendations.
              </p>
            </div>

            <button
              onClick={() => handleWearableConnect('Whoop')}
              className={`w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                connectedWearable === 'Whoop'
                  ? 'bg-[#34d399]/20 border border-[#34d399] text-[#34d399]'
                  : 'bg-[#221c31] hover:bg-[#2c273c] text-[#e1daff] border border-[#e1daff]/20'
              }`}
            >
              {connectedWearable === 'Whoop' ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Connected (Syncing)</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  <span>Connect Whoop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
