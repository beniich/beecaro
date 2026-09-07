import React, { useState } from 'react';

interface RequestIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
}

export const RequestIntegrationModal: React.FC<RequestIntegrationModalProps> = ({
  isOpen,
  onClose,
  lang = 'fr'
}) => {
  const [toolName, setToolName] = useState('');
  const [useCase, setUseCase] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setToolName('');
      setUseCase('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100b1f]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 shadow-2xl shadow-[#100b1f]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-[#cdc3d0] hover:text-black dark:text-white hover:bg-[#373147] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/20 mx-auto mb-2 flex items-center justify-center text-[#ecd7ff]">
            <span className="material-symbols-outlined text-[24px]">extension</span>
          </div>
          <h3 className="text-xl font-bold text-[#e8defb]">
            {lang === 'fr' ? 'Demander une intégration' : 'Request an Integration'}
          </h3>
          <p className="text-xs text-[#cdc3d0] mt-1">
            {lang === 'fr' 
              ? 'Notre équipe d\'ingénieurs connecte de nouveaux outils sous 48h.' 
              : 'Our engineering team ships custom webhooks and connectors in 48 hours.'}
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <span className="material-symbols-outlined text-[48px] text-[#34d399] animate-bounce">check_circle</span>
            <h4 className="text-base font-bold text-[#e8defb]">
              {lang === 'fr' ? 'Demande transmise avec succès !' : 'Request Received!'}
            </h4>
            <p className="text-xs text-[#cdc3d0]">
              {lang === 'fr' ? 'Vous recevrez une alerte dès la disponibilité du connecteur.' : 'You will be notified as soon as the connector is in production.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#cdc3d0] mb-1">
                {lang === 'fr' ? 'Nom du logiciel / API' : 'Software / API Name'}
              </label>
              <input
                type="text"
                required
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="ex: Airtable, SAP, ClickUp, Snowflake..."
                className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-xl px-3.5 py-2.5 text-xs text-[#e8defb] placeholder-[#968e9a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cdc3d0] mb-1">
                {lang === 'fr' ? 'Cas d\'usage principal' : 'Key Use Case'}
              </label>
              <textarea
                rows={3}
                required
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder={lang === 'fr' ? 'Quelle donnée souhaitez-vous synchroniser avec VitalAI ?' : 'What telemetry or action do you want VitalAI to automate?'}
                className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-xl px-3.5 py-2 text-xs text-[#e8defb] placeholder-[#968e9a] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(216,180,254,0.3)] hover:shadow-[0_0_25px_rgba(216,180,254,0.5)] transition-all"
            >
              {lang === 'fr' ? 'Envoyer la demande' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
