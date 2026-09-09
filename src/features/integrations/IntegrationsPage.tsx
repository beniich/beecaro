import React, { useState } from 'react';
import { NavigationPage, IntegrationCategory, IntegrationApp } from '../../types/bizos';
import { mockIntegrations } from '../../data/bizosData';
import { ConnectIntegrationModal } from '../../components/ConnectIntegrationModal';
import { RequestIntegrationModal } from '../../components/RequestIntegrationModal';

interface IntegrationsPageProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTrial: () => void;
  lang?: 'fr' | 'en';
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  onNavigate,
  onOpenTrial,
  lang = 'fr'
}) => {
  const [integrations, setIntegrations] = useState<IntegrationApp[]>(mockIntegrations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>('All');
  const [activeModalApp, setActiveModalApp] = useState<IntegrationApp | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const categories: IntegrationCategory[] = ['All', 'Communication', 'CRM', 'Productivity', 'Finance', 'Analytics'];

  const filteredIntegrations = integrations.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((app) => (app.id === id ? { ...app, connected: !app.connected } : app))
    );
  };

  return (
    <div className="w-full relative overflow-hidden pt-28 pb-20 px-4 md:px-8 max-w-[1440px] mx-auto">
      {/* Ambient background glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ecd7ff]/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero */}
      <div className="text-center max-w-4xl mx-auto mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2c273c]/80 border border-[#ecd7ff]/25 text-xs font-mono text-[#ecd7ff] shadow-[0_0_20px_rgba(216,180,254,0.15)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
          <span>{lang === 'fr' ? '12+ CONNECTEURS EN DIRECT' : '12+ NATIVE CONNECTORS'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#e8defb] tracking-tight leading-[1.1] mb-6">
          {lang === 'fr' ? (
            <>
              Connectez votre stack. <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Libérez l'autonomie.
              </span>
            </>
          ) : (
            <>
              Connect Your Stack. <br />
              <span className="bg-gradient-to-r from-[#ecd7ff] via-[#ffb2bb] to-[#ecd7ff] bg-clip-text text-transparent">
                Unlock Autonomous Harmony.
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-[#cdc3d0] max-w-3xl mx-auto leading-relaxed mb-8">
          {lang === 'fr'
            ? "BeeCarbonat se synchronise en temps réel avec vos outils de communication, CRM, finance et productivité pour unifier les décisions de votre entreprise."
            : "BeeCarbonat synchronizes in real time with your communication tools, CRM, finance, and engineering trackers to synthesize company clarity."}
        </p>

        {/* Search & Request Integration Bar */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cdc3d0] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher un connecteur (Slack, Gmail, Notion, Stripe...)' : 'Search integrations (Slack, Gmail, Notion, Stripe...)'}
              className="w-full bg-[#1d182d] border border-[#ecd7ff]/20 focus:border-[#ecd7ff] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#e8defb] placeholder-[#968e9a] outline-none shadow-xl"
            />
          </div>

          <button
            onClick={() => setRequestModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-[#221c31] hover:bg-[#2c273c] border border-[#ecd7ff]/20 text-xs font-semibold text-[#ecd7ff] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{lang === 'fr' ? 'Demander un outil' : 'Request App'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 relative z-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold font-mono transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#ecd7ff] to-[#ffb2bb] text-[#571c27] shadow-[0_0_15px_rgba(216,180,254,0.3)] font-bold'
                : 'bg-[#1d182d] text-[#cdc3d0] border border-[#ecd7ff]/15 hover:border-[#ecd7ff]/40 hover:text-black dark:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredIntegrations.map((app) => (
          <div
            key={app.id}
            onClick={() => setActiveModalApp(app)}
            className="p-6 rounded-3xl bg-[#1d182d] border border-[#ecd7ff]/20 hover:border-[#ecd7ff]/50 transition-all cursor-pointer group shadow-xl hover:shadow-[0_0_30px_rgba(216,180,254,0.15)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#221c31] border border-[#ecd7ff]/20 p-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <img src={app.logo} alt={app.name} className="w-8 h-8 object-contain rounded-lg" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${app.connected ? 'bg-[#34d399] animate-pulse' : 'bg-[#968e9a]'}`}></span>
                  <span className="text-[11px] font-mono text-[#cdc3d0]">
                    {app.connected ? (lang === 'fr' ? 'Connecté' : 'Connected') : (lang === 'fr' ? 'Disponible' : 'Available')}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#e8defb] mb-1 group-hover:text-[#ecd7ff] transition-colors">
                {app.name}
              </h3>
              <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#968e9a] mb-3">
                {app.category}
              </span>
              <p className="text-xs text-[#cdc3d0] leading-relaxed mb-4">
                {app.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#373147] flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#ecd7ff]">
                {app.dataFlowRate || 'Realtime Webhook'}
              </span>
              <span className="text-[#ecd7ff] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{app.connected ? 'Manage' : 'Connect'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Connection Modal */}
      <ConnectIntegrationModal
        integration={activeModalApp}
        isOpen={Boolean(activeModalApp)}
        onClose={() => setActiveModalApp(null)}
        onToggleConnection={handleToggleConnection}
        lang={lang}
      />

      {/* Request New Integration Modal */}
      <RequestIntegrationModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
