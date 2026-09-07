import React, { useState } from 'react';
import { IntegrationApp } from '../types/bizos';

interface ConnectIntegrationModalProps {
  integration: IntegrationApp | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleConnection: (id: string) => void;
  lang?: 'fr' | 'en';
}

export const ConnectIntegrationModal: React.FC<ConnectIntegrationModalProps> = ({
  integration,
  isOpen,
  onClose,
  onToggleConnection,
  lang = 'fr'
}) => {
  const [syncFrequency, setSyncFrequency] = useState('realtime');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !integration) return null;

  const handleToggle = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onToggleConnection(integration.id);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100b1f]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1d182d] border border-[#ecd7ff]/20 rounded-3xl p-6 shadow-2xl shadow-[#100b1f]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-[#cdc3d0] hover:text-black dark:text-white hover:bg-[#373147] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/20 p-2 flex items-center justify-center">
            <img src={integration.logo} alt={integration.name} className="w-8 h-8 object-contain rounded-lg" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#e8defb]">{integration.name}</h3>
            <span className="text-xs text-[#cdc3d0]">{integration.category}</span>
          </div>
        </div>

        <p className="text-xs text-[#cdc3d0] leading-relaxed mb-4">
          {integration.description}
        </p>

        <div className="p-3.5 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/10 space-y-2 mb-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#ecd7ff] font-semibold">
            {lang === 'fr' ? 'Capacités VitalAI activées' : 'Active VitalAI Capabilities'}
          </div>
          <div className="space-y-1.5">
            {integration.capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#e8defb]">
                <span className="material-symbols-outlined text-[16px] text-[#34d399]">check_circle</span>
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {integration.id === 'wordpress' ? (
            <div className="p-3 rounded-2xl bg-[#2c273c]/80 border border-[#ecd7ff]/20 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#ecd7ff] font-bold">
                <span>📦 Package WordPress Prêt à Installer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">v1.0.0</span>
              </div>
              <p className="text-[11px] text-[#cdc3d0]">
                {lang === 'fr'
                  ? 'Téléchargez le fichier .zip et téléversez-le directement dans votre panneau WordPress (Extensions > Ajouter > Téléverser).'
                  : 'Download the .zip file and upload it directly into your WordPress dashboard (Plugins > Add New > Upload).'}
              </p>
              <div className="p-2 bg-[#120f1d] rounded-xl border border-white/5 font-mono text-[11px] text-[#ecd7ff] flex items-center justify-between">
                <span>[beecarbonat]</span>
                <span className="text-[10px] text-gray-400">Shortcode Gutenberg & Elementor</span>
              </div>
              <a
                href="/downloads/beecarbonat-wordpress-plugin.zip"
                download="beecarbonat-wordpress-plugin.zip"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all text-decoration-none"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{lang === 'fr' ? 'Télécharger le Plugin WordPress (.zip)' : 'Download WordPress Plugin (.zip)'}</span>
              </a>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-[#cdc3d0] mb-1">
                  {lang === 'fr' ? 'Fréquence de synchronisation' : 'Sync Frequency'}
                </label>
                <select
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value)}
                  className="w-full bg-[#221c31] border border-[#373147] focus:border-[#ecd7ff] rounded-xl px-3 py-2 text-xs text-[#e8defb] outline-none"
                >
                  <option value="realtime">{lang === 'fr' ? 'Temps réel (Webhooks continus)' : 'Real-time (continuous webhooks)'}</option>
                  <option value="hourly">{lang === 'fr' ? 'Toutes les heures' : 'Every hour'}</option>
                  <option value="daily">{lang === 'fr' ? 'Quotidien (Synthèse nocturne)' : 'Daily (nightly synthesis)'}</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-[#cdc3d0] p-2 bg-[#2c273c]/50 rounded-xl border border-[#ecd7ff]/10">
                <span>{lang === 'fr' ? 'Débit de données actuel' : 'Current Data Stream'}</span>
                <span className="font-mono text-[#ecd7ff] font-bold">{integration.dataFlowRate || 'Optimal'}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#373147]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#cdc3d0] hover:text-black dark:text-white"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
          <button
            onClick={handleToggle}
            disabled={isProcessing}
            className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              integration.connected
                ? 'bg-[#373147] text-[#ffb4ab] hover:bg-[#93000a]/50'
                : 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_15px_rgba(216,180,254,0.3)]'
            }`}
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : integration.connected ? (
              <>
                <span className="material-symbols-outlined text-[16px]">link_off</span>
                <span>{lang === 'fr' ? 'Déconnecter' : 'Disconnect'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">link</span>
                <span>{lang === 'fr' ? 'Autoriser & Synchroniser' : 'Authorize & Sync'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
