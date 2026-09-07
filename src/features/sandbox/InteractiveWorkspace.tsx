import React, { useState } from 'react';
import { BiometricState } from '../../types/bizos';
import { mockStandardEmails, mockMeetingTranscript } from '../../data/bizosData';

interface InteractiveWorkspaceProps {
  biometrics: BiometricState;
  onUpdateBiometrics: (updated: Partial<BiometricState>) => void;
  lang?: 'fr' | 'en';
}

export const InteractiveWorkspace: React.FC<InteractiveWorkspaceProps> = ({
  biometrics,
  onUpdateBiometrics,
  lang = 'fr'
}) => {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'inbox' | 'meetings' | 'finance'>('cockpit');

  // Interactive Inbox State
  const [selectedEmail, setSelectedEmail] = useState(mockStandardEmails[1]);
  const [emailTone, setEmailTone] = useState<'concise' | 'warm' | 'firm'>('concise');
  const [emailDraft, setEmailDraft] = useState(
    "Hi Sarah,\n\nI've reviewed the updated SLA clauses with our legal counsel and everything looks solid. Signed agreement attached.\n\nBest,\nAlexandre"
  );
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  // Interactive Meeting State
  const [meetingStep, setMeetingStep] = useState(2);
  const [jiraSynced, setJiraSynced] = useState(false);

  const handleSendEmail = () => {
    setEmailSentNotice(true);
    setTimeout(() => setEmailSentNotice(false), 2000);
  };

  const handleSyncJira = () => {
    setJiraSynced(true);
    setTimeout(() => setJiraSynced(false), 2500);
  };

  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ecd7ff]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#373147] mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ffb2bb]">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
            <span>{lang === 'fr' ? 'COCKPIT DE DÉMONSTRATION EN DIRECT' : 'LIVE INTERACTIVE WORKSPACE'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            BizOS Founder Cockpit Simulator
          </h1>
        </div>

        {/* Live Biometric Status Pill */}
        <div className="flex items-center gap-3 bg-[#1d182d] p-2.5 rounded-2xl border border-[#ecd7ff]/20">
          <div className="text-xs text-[#cdc3d0]">
            HRV: <strong className="text-[#ecd7ff] font-mono">{biometrics.hrvBaseline}ms</strong>
          </div>
          <span className="text-[#4a454f]">|</span>
          <div className="text-xs text-[#cdc3d0]">
            Recovery: <strong className="text-[#ffb2bb] font-mono">{biometrics.recoveryScore}%</strong>
          </div>
          <span className="text-[#4a454f]">|</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#34d399]/20 text-[#34d399] font-bold">
            {biometrics.cognitiveLoad}
          </span>
        </div>
      </div>

      {/* Interactive Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {[
          { id: 'cockpit', label: lang === 'fr' ? 'Vue Générale & Bio-Sync' : 'Executive Overview & Bio-Sync', icon: 'dashboard' },
          { id: 'inbox', label: lang === 'fr' ? 'InboxAI Simulateur' : 'InboxAI Draft Engine', icon: 'mail' },
          { id: 'meetings', label: lang === 'fr' ? 'MeetAI Diarization & Jira' : 'MeetAI Audio & Jira Sync', icon: 'record_voice_over' },
          { id: 'finance', label: lang === 'fr' ? 'Finance Dynamique & ARR' : 'Dynamic Finance & Runway', icon: 'account_balance' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_20px_rgba(216,180,254,0.3)]'
                : 'bg-[#1d182d] text-[#cdc3d0] border border-[#ecd7ff]/15 hover:border-[#ecd7ff]/40 hover:text-black dark:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Executive Overview & Bio-Sync Controls */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Left 7 Cols: Live Biometric Simulator Controls */}
          <div className="lg:col-span-7 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#373147]">
              <h3 className="text-lg font-bold text-[#e8defb]">Biometric Strain & Calendar Shield Controller</h3>
              <span className="text-xs font-mono text-[#ecd7ff]">Live Emulation</span>
            </div>

            <p className="text-xs text-[#cdc3d0]">
              Test how BizOS protects founder calendar blocks when physiological fatigue or high cognitive strain is detected.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#e8defb]">Simulate HRV Baseline (ms)</span>
                  <span className="font-mono text-[#ecd7ff] font-bold">{biometrics.hrvBaseline} ms</span>
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
                  className="w-full accent-[#ecd7ff] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#e8defb]">Simulate Recovery Score (%)</span>
                  <span className="font-mono text-[#ffb2bb] font-bold">{biometrics.recoveryScore}%</span>
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
            </div>

            {/* Quick State Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-[#968e9a] uppercase tracking-wider block mb-2 font-bold">
                Quick Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateBiometrics({ hrvBaseline: 32, recoveryScore: 28, cognitiveLoad: 'Overloaded' })}
                  className="p-2 rounded-xl bg-[#221c31] hover:bg-[#2c273c] border border-[#ffb4ab]/30 text-xs font-mono text-[#ffb4ab] text-center transition-colors"
                >
                  ⚡ High Fatigue (28%)
                </button>
                <button
                  onClick={() => onUpdateBiometrics({ hrvBaseline: 46, recoveryScore: 54, cognitiveLoad: 'Elevated' })}
                  className="p-2 rounded-xl bg-[#221c31] hover:bg-[#2c273c] border border-[#ecd7ff]/30 text-xs font-mono text-[#ecd7ff] text-center transition-colors"
                >
                  ⚖️ Balanced (54%)
                </button>
                <button
                  onClick={() => onUpdateBiometrics({ hrvBaseline: 72, recoveryScore: 92, cognitiveLoad: 'Optimal' })}
                  className="p-2 rounded-xl bg-[#221c31] hover:bg-[#2c273c] border border-[#34d399]/30 text-xs font-mono text-[#34d399] text-center transition-colors"
                >
                  🌟 Peak Flow (92%)
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Resulting AI Calendar Shield */}
          <div className="lg:col-span-5 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ecd7ff]">
                  <span className="material-symbols-outlined text-[20px] text-[#ffb2bb]">calendar_month</span>
                  <span>Google Calendar AI Shield</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#34d399]/20 text-[#34d399] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {biometrics.recoveryScore < 45 ? (
                  <div className="p-4 rounded-2xl bg-[#2c273c] border border-[#ffb2bb]/40 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-[#ffb2bb]">
                      <span className="material-symbols-outlined text-[18px]">shield</span>
                      <span>Deep Focus Shield Triggered</span>
                    </div>
                    <p className="text-xs text-[#e8defb]">
                      Recovery is low ({biometrics.recoveryScore}%). 2 non-essential meetings shifted to tomorrow. 90-minute restorative focus block locked in.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#221c31] border border-[#34d399]/30 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-[#34d399]">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>High Energy Window Open</span>
                    </div>
                    <p className="text-xs text-[#cdc3d0]">
                      Recovery is optimal ({biometrics.recoveryScore}%). High-leverage strategic pitching and key stakeholder syncs are scheduled for today.
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-[#151024]/60 border border-[#373147] space-y-1.5 text-[11px] text-[#cdc3d0]">
                  <div className="flex justify-between">
                    <span>14:00 - 15:30 :</span>
                    <strong className="text-[#ecd7ff]">Protected Deep Work</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>16:00 - 16:30 :</span>
                    <strong className="text-[#e8defb]">Sarah Jenkins (SLA Review)</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#373147] mt-6 text-xs text-[#968e9a] font-mono">
              ⚡ Wearable telemetry ingested continuously.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: InboxAI Draft Engine */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Email Selector */}
          <div className="lg:col-span-5 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#e8defb] mb-2 font-mono uppercase tracking-wider">
              Select Incoming Message
            </h3>
            {mockStandardEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  if (email.suggestedReply) {
                    setEmailDraft(email.suggestedReply);
                  }
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedEmail.id === email.id
                    ? 'bg-[#2c273c] border-[#ecd7ff] shadow-md'
                    : 'bg-[#221c31] border-[#373147] hover:border-[#ecd7ff]/30'
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1">
                  <strong className="text-[#e8defb]">{email.sender}</strong>
                  <span className="text-[10px] text-[#968e9a] font-mono">{email.time}</span>
                </div>
                <div className="text-xs text-[#cdc3d0] font-medium truncate">{email.subject}</div>
              </div>
            ))}
          </div>

          {/* AI Drafting Studio */}
          <div className="lg:col-span-7 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                <div>
                  <h4 className="text-base font-bold text-[#e8defb]">{selectedEmail.subject}</h4>
                  <p className="text-xs text-[#cdc3d0]">{selectedEmail.sender} • {selectedEmail.email}</p>
                </div>
                {selectedEmail.sentiment && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#ffb2bb]/20 text-[#ffb2bb]">
                    {selectedEmail.sentiment}
                  </span>
                )}
              </div>

              {/* Tone Selection */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[#cdc3d0]">Tone Mode:</span>
                {(['concise', 'warm', 'firm'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setEmailTone(t);
                      if (t === 'concise') {
                        setEmailDraft("Hi Sarah,\n\nReviewed the SLA with legal. Approved and signed copy attached.\n\nBest,\nAlexandre");
                      } else if (t === 'warm') {
                        setEmailDraft("Hi Sarah,\n\nHope your week is going great! I went through the revised SLA terms with our counsel and we are completely aligned. Signed agreement attached.\n\nWarmly,\nAlexandre");
                      } else {
                        setEmailDraft("Sarah,\n\nWe have reviewed the SLA and accepted the standard terms as discussed. Please proceed with board signoff today.\n\nAlexandre");
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${
                      emailTone === t ? 'bg-[#ecd7ff] text-[#29074a] font-bold' : 'bg-[#221c31] text-[#cdc3d0]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <textarea
                rows={5}
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-2xl p-4 text-xs text-[#e8defb] outline-none resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-[#373147] flex items-center justify-between mt-4">
              <span className="text-[11px] font-mono text-[#968e9a]">Drafted by VitalAI (0.2s)</span>
              <button
                onClick={handleSendEmail}
                disabled={emailSentNotice}
                className="bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(216,180,254,0.3)] hover:scale-105 transition-all flex items-center gap-1.5"
              >
                {emailSentNotice ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Dispatched via Gmail API</span>
                  </>
                ) : (
                  <>
                    <span>1-Click Approve & Send</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: MeetAI & Jira */}
      {activeTab === 'meetings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-7 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-[#e8defb]">Live Meeting Audio Diarization</h3>
            <div className="space-y-3">
              {mockMeetingTranscript.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-[#221c31] border border-[#373147] text-xs space-y-1">
                  <div className="flex justify-between font-bold text-[#e8defb]">
                    <span>{item.speaker}</span>
                    <span className="font-mono text-[10px] text-[#968e9a]">{item.time}</span>
                  </div>
                  <p className="text-[#cdc3d0]">"{item.text}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#e8defb] mb-4">Extracted Jira Sprint Task</h3>
              <div className="p-4 rounded-2xl bg-[#2c273c] border border-[#ecd7ff]/30 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#e8defb]">
                  <span>[ENG-492] Document API for Phase 1</span>
                  <span className="text-[#34d399] font-mono text-[10px]">99.8% Conf.</span>
                </div>
                <p className="text-[11px] text-[#cdc3d0]">
                  Assignee: <strong>Marcus (Head of Eng)</strong> • Priority: <strong>High</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncJira}
              className={`w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                jiraSynced
                  ? 'bg-[#34d399] text-[#151024]'
                  : 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_20px_rgba(216,180,254,0.3)]'
              }`}
            >
              {jiraSynced ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Created ENG-492 in Jira!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Sync to Jira & Slack #engineering</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Dynamic Finance */}
      {activeTab === 'finance' && (
        <div className="bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 sm:p-10 space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#373147]">
            <div>
              <h3 className="text-xl font-bold text-[#e8defb]">Dynamic Finance Runway & Valuation Model</h3>
              <p className="text-xs text-[#cdc3d0]">Live telemetry synced from Stripe & ExitReady</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#34d399]/20 text-[#34d399] font-bold">
              18.4 Months Runway
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/15">
              <div className="text-xs text-[#cdc3d0]">Annual Recurring Revenue</div>
              <div className="text-3xl font-black text-[#ecd7ff] font-mono my-1">$112,500</div>
              <div className="text-[11px] text-[#34d399] font-mono">+28% YoY Growth</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/15">
              <div className="text-xs text-[#cdc3d0]">Estimated M&A Valuation</div>
              <div className="text-3xl font-black text-[#ffb2bb] font-mono my-1">$18.4M</div>
              <div className="text-[11px] text-[#cdc3d0] font-mono">12.4x SaaS ARR Multiple</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/15">
              <div className="text-xs text-[#cdc3d0]">Monthly Net Burn</div>
              <div className="text-3xl font-black text-[#e8defb] font-mono my-1">$64,000</div>
              <div className="text-[11px] text-[#34d399] font-mono">Runway Extends to Q4 2026</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
