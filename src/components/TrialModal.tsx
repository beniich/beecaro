import React, { useState } from 'react';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang?: 'fr' | 'en';
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang = 'fr'
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: 'Alexandre Dubois',
    companyName: 'Lumina Technologies',
    email: 'alexandre@lumina.io',
    teamSize: '10-25',
    wearable: 'apple-watch'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as 2 | 3);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100b1f]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-[#100b1f]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-[#cdc3d0] hover:text-black dark:text-white hover:bg-[#373147] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Stepper indicator */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#ecd7ff] text-[#29074a]' : 'bg-[#373147] text-[#cdc3d0]'}`}>
              1
            </span>
            <span className="text-xs font-medium text-[#cdc3d0]">{lang === 'fr' ? 'Profil' : 'Profile'}</span>
          </div>
          <div className="w-8 h-[2px] bg-[#373147]"></div>
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#ecd7ff] text-[#29074a]' : 'bg-[#373147] text-[#cdc3d0]'}`}>
              2
            </span>
            <span className="text-xs font-medium text-[#cdc3d0]">{lang === 'fr' ? 'Bio-Sync' : 'Bio-Sync'}</span>
          </div>
          <div className="w-8 h-[2px] bg-[#373147]"></div>
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-[#ecd7ff] text-[#29074a]' : 'bg-[#373147] text-[#cdc3d0]'}`}>
              3
            </span>
            <span className="text-xs font-medium text-[#cdc3d0]">{lang === 'fr' ? 'Modules' : 'Modules'}</span>
          </div>
        </div>

        {/* Step 1: Founder Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-[#ffb2bb] uppercase tracking-wider font-semibold">
                {lang === 'fr' ? 'Étape 1 sur 3' : 'Step 1 of 3'}
              </span>
              <h3 className="text-xl font-bold text-[#e8defb]">
                {lang === 'fr' ? 'Initialisez votre espace BizOS' : 'Initialize your BizOS Workspace'}
              </h3>
              <p className="text-xs text-[#cdc3d0] mt-0.5">
                {lang === 'fr' ? '14 jours d\'essai gratuit avec toutes les fonctionnalités VitalAI débloquées.' : '14-day free trial with all VitalAI capabilities unlocked.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cdc3d0] mb-1">
                {lang === 'fr' ? 'Nom et Prénom' : 'Full Name'}
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-xl px-3.5 py-2 text-sm text-[#e8defb] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#cdc3d0] mb-1">
                  {lang === 'fr' ? 'Entreprise / Startup' : 'Company Name'}
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-xl px-3.5 py-2 text-sm text-[#e8defb] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#cdc3d0] mb-1">
                  {lang === 'fr' ? 'Taille de l\'équipe' : 'Team Size'}
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-xl px-3 py-2 text-sm text-[#e8defb] outline-none"
                >
                  <option value="1-5">1-5 personnes</option>
                  <option value="10-25">10-25 personnes</option>
                  <option value="25-100">25-100 personnes</option>
                  <option value="100+">100+ personnes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cdc3d0] mb-1">
                {lang === 'fr' ? 'Email Pro (Gmail / Outlook)' : 'Work Email'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-xl px-3.5 py-2 text-sm text-[#e8defb] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Wearable Connection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-[#ecd7ff] uppercase tracking-wider font-semibold">
                {lang === 'fr' ? 'Étape 2 sur 3' : 'Step 2 of 3'}
              </span>
              <h3 className="text-xl font-bold text-[#e8defb]">
                {lang === 'fr' ? 'Associez votre capteur physiologique' : 'Connect Your Wearable Sensor'}
              </h3>
              <p className="text-xs text-[#cdc3d0] mt-0.5">
                {lang === 'fr' ? 'Permet au moteur VitalAI d\'adapter votre emploi du temps selon votre charge cognitive.' : 'Enables VitalAI to guard your calendar and deep work according to biological recovery.'}
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'apple-watch', name: 'Apple Watch', desc: 'Heart Rate Variability & Active Energy', icon: 'watch' },
                { id: 'oura-ring', name: 'Oura Ring Gen 3', desc: 'Readiness Score, Sleep Quality & Body Temp', icon: 'vital_signs' },
                { id: 'whoop', name: 'Whoop 4.0 Strap', desc: 'Day Strain & Recovery Coaching', icon: 'fitness_center' },
                { id: 'manual', name: 'Simulation Manuelle / Plus tard', desc: 'Calibrage par questionnaire et micro-pauses', icon: 'tune' }
              ].map((device) => (
                <div
                  key={device.id}
                  onClick={() => setFormData({ ...formData, wearable: device.id })}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    formData.wearable === device.id
                      ? 'bg-[#2c273c] border-[#ecd7ff] shadow-[0_0_15px_rgba(216,180,254,0.2)]'
                      : 'bg-[#221c31] border-[#373147] hover:border-[#ecd7ff]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#151024] flex items-center justify-center text-[#ecd7ff]">
                      <span className="material-symbols-outlined text-[20px]">{device.icon}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#e8defb]">{device.name}</div>
                      <div className="text-[11px] text-[#cdc3d0]">{device.desc}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.wearable === device.id ? 'border-[#ecd7ff] bg-[#ecd7ff]' : 'border-[#968e9a]'}`}>
                    {formData.wearable === device.id && <div className="w-1.5 h-1.5 rounded-full bg-[#29074a]"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Module Activation */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono text-[#34d399] uppercase tracking-wider font-semibold">
                {lang === 'fr' ? 'Étape 3 sur 3' : 'Step 3 of 3'}
              </span>
              <h3 className="text-xl font-bold text-[#e8defb]">
                {lang === 'fr' ? 'Activer les modules symbiotiques' : 'Activate Symbiotic Modules'}
              </h3>
              <p className="text-xs text-[#cdc3d0] mt-0.5">
                {lang === 'fr' ? 'Tous les modules sont inclus dans votre période d\'essai.' : 'All five modules are enabled by default for full symbiotic harmony.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#e8defb] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ecd7ff]">mail</span>
                  InboxAI Email Copilot
                </span>
                <span className="text-[#34d399] font-mono text-[11px] font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#e8defb] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ffb2bb]">record_voice_over</span>
                  MeetAI Meeting Engine
                </span>
                <span className="text-[#34d399] font-mono text-[11px] font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#e8defb] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#e1daff]">podcasts</span>
                  CallCopilot Investor Sentiment
                </span>
                <span className="text-[#34d399] font-mono text-[11px] font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#e8defb] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ecd7ff]">domain</span>
                  ExitReady VDR Room
                </span>
                <span className="text-[#34d399] font-mono text-[11px] font-bold">READY</span>
              </div>
            </div>

            <div className="text-[11px] text-[#cdc3d0] bg-[#2c273c]/50 p-2.5 rounded-xl border border-[#ecd7ff]/10">
              🔒 Aucune carte bancaire requise. Annulation en 1 clic à tout moment.
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-[#373147]">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#cdc3d0] hover:text-black dark:text-white transition-colors"
            >
              {lang === 'fr' ? 'Retour' : 'Back'}
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(216,180,254,0.3)] hover:shadow-[0_0_30px_rgba(216,180,254,0.5)] transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-[#571c27] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {step === 3 
                    ? (lang === 'fr' ? 'Lancer mon essai de 14 jours' : 'Launch 14-Day Free Trial')
                    : (lang === 'fr' ? 'Continuer' : 'Continue')}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
