import React, { useState } from 'react';
import { NavigationPage } from '../../types/bizos';
import { mockMeetingTranscript } from '../../data/bizosData';

interface SolutionsMeetAIPageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial: () => void;
  lang?: 'fr' | 'en';
}

export const SolutionsMeetAIPage: React.FC<SolutionsMeetAIPageProps> = ({
  onNavigate,
  onOpenTrial,
  lang = 'fr'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:04 AM');
  const [selectedSpeakerTab, setSelectedSpeakerTab] = useState<'diarization' | 'intent' | 'graph'>('diarization');
  const [pushedToJira, setPushedToJira] = useState(false);

  const handlePushToJira = () => {
    setPushedToJira(true);
    setTimeout(() => setPushedToJira(false), 2500);
  };

  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-16 left-1/3 w-[600px] h-[400px] bg-[#ecd7ff]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2c273c]/80 border border-[#ecd7ff]/25 text-xs font-mono text-[#ecd7ff] shadow-[0_0_20px_rgba(216,180,254,0.15)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
          <span>{lang === 'fr' ? '● INTELLIGENCE D\'ENTREPRISE' : '● ENTERPRISE INTELLIGENCE'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#e8defb] tracking-tight leading-[1.1] mb-6">
          {lang === 'fr' ? (
            <>
              Transformez chaque réunion en <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                clarté actionnable.
              </span>
            </>
          ) : (
            <>
              Transform Every Conversation into <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Actionable Clarity.
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-[#cdc3d0] max-w-3xl mx-auto leading-relaxed mb-8">
          {lang === 'fr'
            ? "MeetAI capture, analyse et distille vos réunions d'entreprise en temps réel. Découvrez la sérénité d'un alignement absolu grâce au moteur VitalAI."
            : "MeetAI captures, analyzes, and distills your enterprise meetings in real-time. Experience the calm of absolute alignment with our VitalAI engine."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenTrial}
            className="w-full sm:w-auto bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(216,180,254,0.35)] hover:scale-105 transition-all"
          >
            {lang === 'fr' ? 'Déployer MeetAI' : 'Deploy MeetAI'}
          </button>
          <button
            onClick={() => onNavigate('workspace')}
            className="w-full sm:w-auto bg-[#221c31] hover:bg-[#2c273c] border border-[#ecd7ff]/20 text-[#e8defb] px-7 py-4 rounded-full font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ffb2bb]">play_circle</span>
            <span>{lang === 'fr' ? 'Écouter l\'Extrait Démo' : 'Simulate Live Audio'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Transcript Demo (Screenshot 4) */}
      <section className="mb-24 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Player Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-[#373147] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#221c31] border border-[#ecd7ff]/20 flex items-center justify-center text-[#ecd7ff]">
              <span className="material-symbols-outlined text-[22px]">videocam</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#e8defb]">Q3_Strategy_Sync.mp4</h3>
              <p className="text-xs text-[#cdc3d0]">Live Speaker Diarization • 4 Participants</p>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-full bg-[#2c273c] hover:bg-[#373147] border border-[#ecd7ff]/20 text-xs font-semibold text-[#ecd7ff] flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#ffb2bb]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span>{isPlaying ? 'Pause Simulation' : 'Play Live Feed'}</span>
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20">
              99.8% Accuracy
            </span>
          </div>
        </div>

        {/* 2-Column: Transcript dialog on left, AI Extracted Action item on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Transcript Feed (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-4 max-h-[380px] overflow-y-auto pr-2">
            {mockMeetingTranscript.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-[#221c31]/80 border border-[#373147] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#373147] flex items-center justify-center font-bold text-[10px] text-[#ecd7ff]">
                      {item.speakerInitials}
                    </span>
                    <strong className="text-[#e8defb]">{item.speaker}</strong>
                  </div>
                  <span className="text-[11px] font-mono text-[#968e9a]">{item.time}</span>
                </div>
                <p className="text-xs text-[#cdc3d0] leading-relaxed pl-8">
                  "{item.text}"
                </p>

                {item.actionItem && (
                  <div className="ml-8 mt-2 p-2.5 rounded-xl bg-[#2c273c] border border-[#ecd7ff]/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#34d399]">task_alt</span>
                      <span className="text-[#e8defb] font-medium">{item.actionItem.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#ecd7ff]">
                      Assignee: {item.actionItem.assignee} ({item.actionItem.dueDate})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: AI Synthesis & Automated Workflow Push (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-[#221c31] border border-[#ecd7ff]/20 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ecd7ff] font-mono uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>VitalAI Meeting Synthesis</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34d399]/20 text-[#34d399]">
                  Aligned
                </span>
              </div>

              <div className="space-y-3 text-xs text-[#cdc3d0]">
                <div>
                  <div className="font-bold text-[#e8defb] mb-1">Executive Decision:</div>
                  <p className="text-[11px] leading-relaxed bg-[#151024]/50 p-2.5 rounded-xl border border-[#373147]">
                    Push AI integrations to Phase 2 to unblock data team. Lock in SOC2 enterprise specs before Thursday Lumina sync.
                  </p>
                </div>

                <div>
                  <div className="font-bold text-[#e8defb] mb-1">Live Action Item Extracted:</div>
                  <div className="p-3 rounded-xl bg-[#2c273c] border border-[#ecd7ff]/25">
                    <div className="flex justify-between items-center text-xs font-bold text-[#e8defb]">
                      <span>Document API requirements for Phase 1</span>
                      <span className="text-[#34d399] font-mono text-[10px]">99.8% Conf.</span>
                    </div>
                    <div className="text-[11px] text-[#cdc3d0] mt-1">
                      Assignee: <strong>Marcus (Head of Engineering)</strong> • Due: <strong>Tomorrow EOD</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Push to Jira / Slack Button */}
            <div className="pt-6 border-t border-[#373147] mt-6">
              <button
                onClick={handlePushToJira}
                className={`w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  pushedToJira
                    ? 'bg-[#34d399] text-[#151024]'
                    : 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:scale-102'
                }`}
              >
                {pushedToJira ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Pushed to Jira & Slack #engineering!</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    <span>Sync Decisions to Jira & Slack</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Why Enterprise Chooses MeetAI */}
      <section className="mb-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-[#ffb2bb] uppercase tracking-widest font-semibold">
            {lang === 'fr' ? '● MATRICE COMPARATIVE' : '● COMPARISON MATRIX'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            Why Enterprise Chooses MeetAI
          </h2>
        </div>

        <div className="overflow-x-auto bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#373147] text-[#cdc3d0] uppercase font-mono tracking-wider">
                <th className="py-4 px-4">Feature Capability</th>
                <th className="py-4 px-4 text-center">Otter.ai</th>
                <th className="py-4 px-4 text-center">Zoom AI Companion</th>
                <th className="py-4 px-4 text-center text-[#ecd7ff] font-bold bg-[#2c273c]/50 rounded-t-xl">
                  MeetAI (VitalAI)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#373147] text-[#e8defb]">
              <tr>
                <td className="py-4 px-4 font-semibold">Contextual Action Extraction</td>
                <td className="py-4 px-4 text-center text-[#cdc3d0]">Basic keyword list</td>
                <td className="py-4 px-4 text-center text-[#cdc3d0]">Generic summary</td>
                <td className="py-4 px-4 text-center bg-[#2c273c]/50 text-[#34d399] font-bold">
                  ✓ Autonomous Jira/Slack Push
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold">Physiological Stress Sync</td>
                <td className="py-4 px-4 text-center text-[#ffb4ab]">✗ None</td>
                <td className="py-4 px-4 text-center text-[#ffb4ab]">✗ None</td>
                <td className="py-4 px-4 text-center bg-[#2c273c]/50 text-[#34d399] font-bold">
                  ✓ Bio-Sync Calendar Shield
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold">Custom LLM Fine-Tuning</td>
                <td className="py-4 px-4 text-center text-[#ffb4ab]">✗ None</td>
                <td className="py-4 px-4 text-center text-[#cdc3d0]">Standard models</td>
                <td className="py-4 px-4 text-center bg-[#2c273c]/50 text-[#34d399] font-bold">
                  ✓ Company Knowledge Enclave
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold">Diarization Accuracy</td>
                <td className="py-4 px-4 text-center text-[#cdc3d0]">92.4%</td>
                <td className="py-4 px-4 text-center text-[#cdc3d0]">94.1%</td>
                <td className="py-4 px-4 text-center bg-[#2c273c]/50 text-[#ecd7ff] font-mono font-bold">
                  99.8% Multi-Speaker
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Weathers Any Workflow (Slack bot preview) */}
      <section className="relative z-10 max-w-4xl mx-auto">
        <div className="p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#ffb2bb]/10 border border-[#ffb2bb]/20 flex items-center justify-center text-[#ffb2bb]">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#e8defb]">MeetAI Slack Bot (#engineering)</h3>
              <p className="text-xs text-[#cdc3d0]">Auto-broadcasts within 30 seconds of meeting conclusion</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#151024] border border-[#373147] font-mono text-xs space-y-2 text-[#e8defb]">
            <div className="text-[#ecd7ff] font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34d399]"></span>
              <span>@here Summary from Q3 Strategy Sync is ready:</span>
            </div>
            <div className="text-[#cdc3d0] pl-4 border-l-2 border-[#ecd7ff]/30 space-y-1">
              <div>• <strong>Decision:</strong> AI integration pushed to Phase 2 for optimal data velocity.</div>
              <div>• <strong>Action Item:</strong> @marcus to document API specifications by tomorrow 5 PM.</div>
              <div>• <strong>Next Step:</strong> Sarah syncing with Lumina CTO Thursday 2 PM.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
