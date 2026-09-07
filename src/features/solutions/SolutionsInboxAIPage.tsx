import React, { useState } from 'react';
import { NavigationPage } from '../../types/bizos';
import { mockStandardEmails } from '../../data/bizosData';

interface SolutionsInboxAIPageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial: () => void;
  lang?: 'fr' | 'en';
}

export const SolutionsInboxAIPage: React.FC<SolutionsInboxAIPageProps> = ({
  onNavigate,
  onOpenTrial,
  lang = 'fr'
}) => {
  const [activeTab, setActiveTab] = useState<'after' | 'before'>('after');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [testTone, setTestTone] = useState<'concise' | 'warm' | 'firm'>('concise');
  const [customReplyText, setCustomReplyText] = useState(
    "Hi Sarah,\n\nI've reviewed the updated SLA clauses with our legal counsel and everything looks solid. Signed agreement attached.\n\nBest,\nAlexandre"
  );
  const [isSent, setIsSent] = useState(false);

  const handleSendDraft = () => {
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setShowReplyModal(false);
    }, 1200);
  };

  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-16 left-1/4 w-[600px] h-[400px] bg-[#ffb2bb]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2c273c]/80 border border-[#ffb2bb]/25 text-xs font-mono text-[#ffb2bb] shadow-[0_0_20px_rgba(255,178,187,0.15)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#ecd7ff] animate-pulse"></span>
          <span>{lang === 'fr' ? '● DÉCOUVREZ INBOXAI' : '● INTRODUCING INBOXAI'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#e8defb] tracking-tight leading-[1.1] mb-6">
          {lang === 'fr' ? (
            <>
              Votre boîte de réception, <br />
              <span className="bg-gradient-to-r from-[#ffb2bb] via-[#ecd7ff] to-[#ffb2bb] bg-clip-text text-transparent">
                réinventée par l'IA.
              </span>
            </>
          ) : (
            <>
              Your Inbox, <br />
              <span className="bg-gradient-to-r from-[#ffb2bb] via-[#ecd7ff] to-[#ffb2bb] bg-clip-text text-transparent">
                Reimagined by AI.
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-[#cdc3d0] max-w-3xl mx-auto leading-relaxed mb-8">
          {lang === 'fr'
            ? "Entraînez votre IA personnelle à trier, prioriser et rédiger des réponses qui vous ressemblent exactement. Gagnez 2h par jour avec le compagnon email ultime."
            : "Train your personal AI to sort, prioritize, and draft responses that sound exactly like you. Reclaim hours of your day with the ultimate intelligent email companion for busy professionals."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={onOpenTrial}
            className="w-full sm:w-auto bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(216,180,254,0.35)] hover:scale-105 transition-all"
          >
            {lang === 'fr' ? 'Essayer InboxAI Gratuitement' : 'Start Free Trial'}
          </button>
          <button
            onClick={() => onNavigate('workspace')}
            className="w-full sm:w-auto bg-[#221c31] hover:bg-[#2c273c] border border-[#ecd7ff]/20 text-[#e8defb] px-7 py-4 rounded-full font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ffb2bb]">play_circle</span>
            <span>{lang === 'fr' ? 'Voir la Démo Interactive' : 'Watch Demo'}</span>
          </button>
        </div>

        {/* Supported providers */}
        <div className="flex items-center justify-center gap-6 text-xs text-[#968e9a] font-mono">
          <span>Google Workspace</span>
          <span>•</span>
          <span>Microsoft 365</span>
          <span>•</span>
          <span>Superhuman / Fastmail</span>
        </div>
      </div>

      {/* The Before & After Comparison (Screenshot 3) */}
      <section className="mb-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs font-mono text-[#ecd7ff] uppercase tracking-widest font-semibold">
            {lang === 'fr' ? '● COMPARAISON AVANT / APRÈS' : '● BEFORE & AFTER COMPARISON'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            {lang === 'fr' ? 'De l\'Anxiété à l\'Inbox Zero' : 'From Chaos to Clarity'}
          </h2>
        </div>

        {/* Toggle on mobile / side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Standard Cluttered Inbox (1,492 unread) */}
          <div className="rounded-3xl bg-[#151024]/90 border border-[#ffb4ab]/25 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ffb4ab] font-mono uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">inbox</span>
                  <span>Standard Inbox (1,492 Unread)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#ffb4ab]/10 text-[#ffb4ab]">
                  Unfiltered Noise
                </span>
              </div>

              <div className="space-y-3">
                {mockStandardEmails.map((email) => (
                  <div key={email.id} className="p-3.5 rounded-2xl bg-[#221c31]/60 border border-[#373147] opacity-75">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <strong className="text-[#e8defb]">{email.sender}</strong>
                      <span className="text-[11px] text-[#968e9a] font-mono">{email.time}</span>
                    </div>
                    <div className="text-xs font-medium text-[#cdc3d0] mb-0.5">{email.subject}</div>
                    <div className="text-[11px] text-[#968e9a] truncate">{email.snippet}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#373147] mt-6 text-xs text-[#ffb4ab] font-mono">
              ⚠️ 1.5 hours wasted daily triaging marketing newsletters and low-priority pings.
            </div>
          </div>

          {/* Right: With InboxAI (Vital Workspace) */}
          <div className="rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/30 p-6 shadow-2xl shadow-[#ecd7ff]/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#373147] mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ecd7ff] font-mono uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px] text-[#34d399]">check_circle</span>
                  <span>Vital Workspace (2 Items Require Action)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#34d399]/20 text-[#34d399]">
                  100% Curated
                </span>
              </div>

              {/* High Priority Contract Card */}
              <div className="p-4 rounded-2xl bg-[#2c273c] border border-[#ecd7ff]/30 mb-4 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffb2bb] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#e8defb]">Sarah Jenkins (Acme Corp)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffb2bb]/20 text-[#ffb2bb] font-bold">
                    URGENT SLA
                  </span>
                </div>

                <p className="text-xs text-[#cdc3d0] mb-3">
                  "Hey Alexandre, need the revised SLA signed by 5 PM today for board approval."
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReplyModal(true)}
                    className="bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(216,180,254,0.3)] hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    <span>1-Click Draft Reply</span>
                  </button>
                  <button className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#cdc3d0] hover:text-white bg-[#221c31] border border-[#ecd7ff]/15">
                    Snooze
                  </button>
                </div>
              </div>

              {/* AI Digest Card */}
              <div className="p-3.5 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/15 text-xs">
                <div className="flex items-center gap-2 text-[#ecd7ff] font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px] text-[#ecd7ff]">auto_awesome</span>
                  <span>AI Digest (3 Low-Priority Emails Summarized)</span>
                </div>
                <p className="text-[#cdc3d0] text-[11px] leading-relaxed">
                  • Summer sale blast digested & archived. <br />
                  • IT maintenance weekend alert logged to calendar. <br />
                  • Lunch catering confirmed for 12:30 PM.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#373147] mt-6 text-xs text-[#34d399] font-mono flex items-center justify-between">
              <span> Reclaim 12+ hours every week.</span>
              <span className="font-bold">Zero Cognitive Load</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid: Deep Style Learning, Sentiment Radar, Auto-Replies */}
      <section className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-[#ffb2bb] uppercase tracking-widest font-semibold">
            {lang === 'fr' ? '● MOTEUR D\'ÉCRITURE' : '● INTELLIGENT ENGINE'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e8defb] tracking-tight mt-1">
            {lang === 'fr' ? 'Calibré sur Votre Propre Style' : 'Calibrated to Your Voice'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Deep Style Learning */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ecd7ff]/10 border border-[#ecd7ff]/20 flex items-center justify-center text-[#ecd7ff] mb-6">
                <span className="material-symbols-outlined text-[26px]">stylus</span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">Deep Style Learning</h3>
              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-4">
                Analyzes thousands of your sent messages to mirror your exact greetings, sign-offs, conciseness, and tone spectrum.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#221c31] border border-[#ecd7ff]/15 text-[11px] font-mono text-[#ecd7ff]">
              Tone Calibration: 99.2% Alexandre Dubois
            </div>
          </div>

          {/* Sentiment Radar */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#ffb2bb]/10 border border-[#ffb2bb]/20 flex items-center justify-center text-[#ffb2bb] mb-6">
                <span className="material-symbols-outlined text-[26px]">radar</span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">Sentiment Radar</h3>
              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-4">
                Instantly flags frustrated customers, eager investors, and urgent deadlines so you never drop high-stakes communication.
              </p>
            </div>

            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#ffb2bb]/20 text-[#ffb2bb]">
                Urgent Contract
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#34d399]/20 text-[#34d399]">
                Investor Positive
              </span>
            </div>
          </div>

          {/* Contextual Auto-Replies */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#e1daff]/10 border border-[#e1daff]/20 flex items-center justify-center text-[#e1daff] mb-6">
                <span className="material-symbols-outlined text-[26px]">send</span>
              </div>
              <h3 className="text-xl font-bold text-[#e8defb] mb-2">1-Click Approvals</h3>
              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-4">
                Generate high-confidence responses ready for 1-click execution on mobile or desktop without opening a full editor.
              </p>
            </div>

            <button
              onClick={() => setShowReplyModal(true)}
              className="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-[#221c31] hover:bg-[#2c273c] text-[#ecd7ff] border border-[#ecd7ff]/20 transition-all"
            >
              Test Draft Generator
            </button>
          </div>
        </div>
      </section>

      {/* Interactive 1-Click Draft Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100b1f]/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#1d182d] border border-[#ecd7ff]/25 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setShowReplyModal(false)}
              className="absolute top-5 right-5 text-[#cdc3d0] hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[22px] text-[#ecd7ff]">auto_awesome</span>
              <h3 className="text-lg font-bold text-[#e8defb]">InboxAI Draft Generator</h3>
            </div>

            {/* Tone Selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-[#cdc3d0]">Tone Style:</span>
              {(['concise', 'warm', 'firm'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTestTone(t);
                    if (t === 'concise') {
                      setCustomReplyText("Hi Sarah,\n\nReviewed the SLA with legal. Approved and signed copy attached.\n\nBest,\nAlexandre");
                    } else if (t === 'warm') {
                      setCustomReplyText("Hi Sarah,\n\nHope your week is going great! I went through the revised SLA terms with our counsel and we are completely aligned. Signed agreement attached.\n\nWarmly,\nAlexandre");
                    } else {
                      setCustomReplyText("Sarah,\n\nWe have reviewed the SLA and accepted the standard terms as discussed. Please proceed with board signoff today.\n\nAlexandre");
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${
                    testTone === t ? 'bg-[#ecd7ff] text-[#29074a] font-bold' : 'bg-[#221c31] text-[#cdc3d0]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              value={customReplyText}
              onChange={(e) => setCustomReplyText(e.target.value)}
              className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-2xl p-4 text-xs text-[#e8defb] outline-none resize-none font-sans leading-relaxed"
            />

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#373147]">
              <span className="text-[11px] text-[#968e9a] font-mono">Attachment: Signed_SLA_2024.pdf</span>

              <button
                onClick={handleSendDraft}
                disabled={isSent}
                className="bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:scale-105 transition-all flex items-center gap-2"
              >
                {isSent ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Sent!</span>
                  </>
                ) : (
                  <>
                    <span>Approve & Send</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
