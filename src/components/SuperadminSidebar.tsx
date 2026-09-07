import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface SuperadminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  lang: 'fr' | 'en';
  isLightMode: boolean;
  onToggleLightMode: () => void;
  dashboardMode: 'cafm' | 'web3';
  onChangeDashboardMode: (mode: 'cafm' | 'web3') => void;
}

export const SuperadminSidebar: React.FC<SuperadminSidebarProps> = ({
  currentPage,
  onNavigate,
  lang,
  isLightMode,
  onToggleLightMode,
  dashboardMode,
  onChangeDashboardMode
}) => {
  return (
    <aside 
      className={`fixed left-4 top-4 bottom-4 w-72 rounded-3xl border p-5 flex flex-col transition-colors duration-300 z-40 h-[calc(100vh-2rem)] ${
        isLightMode 
          ? 'bg-white border-[#e5e7eb] shadow-md text-[#111827]' 
          : 'bg-[#120e23] border-[#ff9d2b]/15 shadow-2xl text-[#e8defb]'
      }`}
    >
      {/* Header / Logo */}
      <div className="pb-4 border-b border-slate-200/50 dark:border-white/5 mb-4 shrink-0">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2 font-mono">
          <span className="text-[#ff9d2b] font-extrabold">SUPERADMIN</span>
          <span className={`${isLightMode ? 'text-gray-400' : 'text-slate-500'} text-xs font-semibold`}>HQ</span>
        </h2>
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#ff9d2b] font-bold mt-0.5">
          {lang === 'fr' ? 'FACILITY MANAGEMENT' : 'FACILITY MANAGEMENT'}
        </div>
      </div>

      {/* Sidebar Navigation Selector */}
      <div className="mb-2 shrink-0">
        <div className="flex gap-2 p-1 rounded-xl bg-slate-200/50 dark:bg-white dark:bg-slate-950/20 text-[10px] font-mono mb-2">
          <button 
            onClick={() => onChangeDashboardMode('cafm')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
              dashboardMode === 'cafm' 
                ? 'bg-[#ff9d2b] text-black dark:text-white shadow-sm' 
                : 'text-gray-400 hover:text-slate-600 dark:hover:text-black dark:text-white'
            }`}
          >
            🏢 CAFM GMAO
          </button>
          <button 
            onClick={() => onChangeDashboardMode('web3')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
              dashboardMode === 'web3' 
                ? 'bg-[#ff9d2b] text-black dark:text-white shadow-sm' 
                : 'text-gray-400 hover:text-slate-600 dark:hover:text-black dark:text-white'
            }`}
          >
            🌐 WEB3 & DEFI
          </button>
        </div>
      </div>

      {/* Render Sidebar Navigation List with scrollable container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 my-2 scrollbar-thin scrollbar-thumb-orange-500/20 hover:scrollbar-thumb-orange-500/40">
          {dashboardMode === 'cafm' ? (
            <>
              {/* Category 0: CYBER COCKPITS (Variants 1-10) */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/90 font-black'}`}>
                  {lang === 'fr' ? 'CYBER COCKPITS (VARIANTS 1-10)' : 'CYBER COCKPITS (VARIANTS 1-10)'}
                </h3>
                <ul className="space-y-1">
                  {[
                    { id: 'threat-matrix', label: 'V1. THREAT MATRIX', icon: 'security' },
                    { id: 'neural-engine', label: 'V2. NEURAL ARCHITECT', icon: 'hub' },
                    { id: 'energy-nexus', label: 'V3. ENERGY NEXUS', icon: 'bolt' },
                    { id: 'fleet-command', label: 'V4. FLEET COMMAND', icon: 'radar' },
                    { id: 'database-monitor', label: 'V5. DB & CACHE MONITOR', icon: 'database' },
                    { id: 'predictive-core', label: 'V6. PREDICTIVE CORE', icon: 'speed' },
                    { id: 'traffic-hub', label: 'V8. API GATEWAY TRAFFIC', icon: 'alt_route' },
                    { id: 'cloud-pulse', label: 'V9. MULTI-CLOUD PULSE', icon: 'cloud' },
                    { id: 'audit-vault', label: 'V10. IMMUTABLE AUDIT VAULT', icon: 'verified_user' },
                    { id: 'mission-control', label: 'MISSION CONTROL HQ', icon: 'monitoring' },
                    { id: 'god-mode', label: 'GOD-MODE SYSTEM VIEW', icon: 'view_in_ar' }
                  ].map((item, index) => {
                    const isActive = currentPage === item.id;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                            isActive
                              ? 'bg-[#ff9d2b]/20 text-[#ff9d2b] border-l-4 border-[#ff9d2b] shadow-[0_0_15px_rgba(255,157,43,0.3)]'
                              : isLightMode 
                                ? 'text-gray-700 hover:bg-slate-100/70 hover:text-black' 
                                : 'text-[#f4effa] hover:bg-white/10 hover:text-black dark:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] text-[#ff9d2b]">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 1: OPÉRATIONS & FLUIDES */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/90 font-black'}`}>
                  {lang === 'fr' ? '🏢 1. OPÉRATIONS & FLUIDES (BMS)' : '🏢 1. SMART UTILITIES & BMS'}
                </h3>
                <ul className="space-y-1">
                  {[
                    { id: 'workspace', label: lang === 'fr' ? 'VUE D\'ENSEMBLE & PILOTAGE' : 'OVERVIEW & COCKPIT', icon: 'grid_view' },
                    { id: 'lighting', label: lang === 'fr' ? 'ÉNERGIE & ÉCLAIRAGE' : 'ENERGY & LIGHTING PULSE', icon: 'lightbulb' },
                    { id: 'water', label: lang === 'fr' ? 'EAU & FLUIDES (HYDROSYNC)' : 'WATER HYDROSYNC', icon: 'water_drop' },
                    { id: 'waste', label: lang === 'fr' ? 'DÉCHETS & CIRCULARITÉ' : 'CIRCULAR FLOW & WASTE', icon: 'recycling' },
                  ].map((item, index) => {
                    const isActive = currentPage === item.id;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                            isActive
                              ? 'bg-[#ff9d2b]/20 text-[#ff9d2b] border-l-4 border-[#ff9d2b] shadow-[0_0_15px_rgba(255,157,43,0.3)]'
                              : isLightMode 
                                ? 'text-gray-700 hover:bg-slate-100/70 hover:text-black' 
                                : 'text-[#f4effa] hover:bg-white/10 hover:text-black dark:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] text-[#ff9d2b]">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 2: GMAO & GESTION TECHNIQUE */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/70'}`}>
                  {lang === 'fr' ? '⚙️ 2. GMAO & GESTION TECHNIQUE' : '⚙️ 2. ASSET LIFECYCLE & CMMS'}
                </h3>
                <ul className="space-y-1">
                  {[
                    { id: 'assets', label: lang === 'fr' ? 'ÉQUIPEMENTS & PARC EAM' : 'ASSETS MANAGER & EAM', icon: 'inventory_2' },
                    { id: 'scanner', label: lang === 'fr' ? 'SCAN SANS CONTACT NFC & QR' : 'CONTACTLESS NFC & QR', icon: 'qr_code_scanner' },
                    { id: 'qr-generator', label: lang === 'fr' ? 'GÉNÉRATEUR QR RÉCLAMATIONS' : 'COMPLAINT QR GENERATOR', icon: 'qr_code_2' },
                    { id: 'work-orders', label: lang === 'fr' ? 'BONS DE TRAVAIL (WO)' : 'WORK ORDERS (WO)', icon: 'assignment' },
                    { id: 'maintenance', label: lang === 'fr' ? 'MAINTENANCE & INTERVENTIONS' : 'MAINTENANCE ENGINE', icon: 'build' },
                    { id: 'spaces', label: lang === 'fr' ? 'ESPACES & OCCUPATION' : 'SPACES & DESKS', icon: 'domain' },
                    { id: 'team-ops', label: lang === 'fr' ? "OPÉRATIONS D'ÉQUIPES" : 'FIELD TEAM OPERATIONS', icon: 'group' }
                  ].map((item, index) => {
                    const isActive = currentPage === item.id;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                            isActive
                              ? 'bg-[#ff9d2b]/10 text-[#ff9d2b] border-l-4 border-[#ff9d2b]'
                              : isLightMode 
                                ? 'text-slate-600 hover:bg-slate-100/70 hover:text-black' 
                                : 'text-[#cdc3d0] hover:bg-white/5 hover:text-black dark:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 3: STRATÉGIE CLIMAT & ESG */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/70'}`}>
                  {lang === 'fr' ? '🌍 3. STRATÉGIE CLIMAT & ESG' : '🌍 3. CLIMATE STRATEGY & ESG'}
                </h3>
                <ul className="space-y-1">
                  {[
                    { id: 'env-impact', label: lang === 'fr' ? 'BILAN CARBONE CSRD (SCOPE 1-3)' : 'CSRD CARBON SCOPES 1-3', icon: 'nature_people' },
                    { id: 'market', label: lang === 'fr' ? 'MARCHÉ CRÉDITS CARBONE' : 'CARBON CREDIT MARKET', icon: 'public' },
                    { id: 'air-quality', label: lang === 'fr' ? "QUALITÉ DE L'AIR (QAI)" : 'AIR QUALITY & AQI', icon: 'air' },
                    { id: 'occupants-care', label: lang === 'fr' ? 'CONFORT & BIEN-ÊTRE' : 'OCCUPANT WELLNESS', icon: 'person_pin' },
                    { id: 'esg-copilot', label: lang === 'fr' ? 'COPILOTE IA ÉNERGIE' : 'AI ENERGY COPILOT', icon: 'eco' },
                  ].map((item, index) => {
                    const isActive = currentPage === item.id;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                            isActive
                              ? 'bg-[#ff9d2b]/10 text-[#ff9d2b] border-l-4 border-[#ff9d2b]'
                              : isLightMode 
                                ? 'text-slate-600 hover:bg-slate-100/70 hover:text-black' 
                                : 'text-[#cdc3d0] hover:bg-white/5 hover:text-black dark:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 4: JUMEAU NUMÉRIQUE & HYPERVISION */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/70'}`}>
                  {lang === 'fr' ? '📐 4. JUMEAU NUMÉRIQUE & HYPERVISION' : '📐 4. DIGITAL TWIN & SPATIAL'}
                </h3>
                <ul className="space-y-1">
                  {[
                    { id: 'bim-3d', label: lang === 'fr' ? 'JUMEAU 3D & VISIONNEUSE BIM' : '3D DIGITAL TWIN & BIM', icon: 'architecture' },
                    { id: 'mission-control', label: lang === 'fr' ? 'HYPERVISEUR MISSION CONTROL' : 'MISSION CONTROL HQ', icon: 'monitoring' },
                    { id: 'god-mode', label: lang === 'fr' ? 'GOD-MODE SYSTEM VIEW' : 'GOD-MODE SYSTEM VIEW', icon: 'view_in_ar' },
                    { id: 'predictive-ai', label: lang === 'fr' ? 'IA PRÉDICTIVE & SANTÉ' : 'PREDICTIVE AI DIAGNOSTICS', icon: 'psychology' },
                  ].map((item, index) => {
                    const isActive = currentPage === item.id;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                            isActive
                              ? 'bg-[#ff9d2b]/10 text-[#ff9d2b] border-l-4 border-[#ff9d2b]'
                              : isLightMode 
                                ? 'text-slate-600 hover:bg-slate-100/70 hover:text-black' 
                                : 'text-[#cdc3d0] hover:bg-white/5 hover:text-black dark:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 5: CONNECTIVITÉ & GOUVERNANCE */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/70'}`}>
                  {lang === 'fr' ? '🔌 5. CONNECTIVITÉ & GOUVERNANCE' : '🔌 5. CONNECTIVITY & GOVERNANCE'}
                </h3>
                <ul className="space-y-1">
                  {[
                    { id: 'erp-integration', label: lang === 'fr' ? 'CONNECTEURS ERP (SAP)' : 'ERP INTEGRATION (SAP)', icon: 'hub' },
                    { id: 'google-sheets', label: lang === 'fr' ? 'GOOGLE SHEETS SYNC' : 'GOOGLE SHEETS SYNC', icon: 'table_view' },
                    { id: 'analytics-dashboard', label: lang === 'fr' ? 'ANALYTIQUES & REPORTING' : 'ANALYTICS & REPORTING', icon: 'analytics' },
                    { id: 'genai-assistant', label: lang === 'fr' ? 'BMS ASSISTANT IA' : 'BMS GENAI ASSISTANT', icon: 'smart_toy' },
                    { id: 'security-access', label: lang === 'fr' ? 'SÉCURITÉ ZERO-TRUST & RBAC' : 'ZERO-TRUST SECURITY & RBAC', icon: 'shield' },
                    { id: 'system-config', label: lang === 'fr' ? 'CONFIGURATION SYSTÈME MASTER' : 'SYSTEM MASTER CONFIG', icon: 'settings' },
                  ].map((item, index) => {
                    const isActive = currentPage === item.id;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                            isActive
                              ? 'bg-[#ff9d2b]/10 text-[#ff9d2b] border-l-4 border-[#ff9d2b]'
                              : isLightMode 
                                ? 'text-slate-600 hover:bg-slate-100/70 hover:text-black' 
                                : 'text-[#cdc3d0] hover:bg-white/5 hover:text-black dark:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 6: ÉCOSYSTÈME & RESSOURCES */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/70'}`}>
                  {lang === 'fr' ? '🏛️ ÉCOSYSTÈME & RESSOURCES' : '🏛️ ECOSYSTEM & INFO'}
                </h3>
                <ul className="space-y-1">
                  {[
                    { id: 'bee-roots', label: lang === 'fr' ? 'À PROPOS DE BEECARBONAT' : 'ABOUT BEECARBONAT', icon: 'info' },
                    { id: 'success-stories', label: lang === 'fr' ? 'CAS CLIENTS & SUCCESS' : 'SUCCESS STORIES', icon: 'auto_awesome' },
                    { id: 'careers', label: lang === 'fr' ? 'ESPACE CARRIÈRES' : 'CAREERS WORKSPACE', icon: 'work' },
                    { id: 'partner-portal', label: lang === 'fr' ? 'PORTAIL PARTENAIRE B2B' : 'PARTNER PORTAL (B2B)', icon: 'vpn_key' },
                  ].map((item, index) => {
                    const isActive = currentPage === item.id;
                    return (
                      <li key={index}>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                            isActive
                              ? 'bg-[#ff9d2b]/10 text-[#ff9d2b] border-l-4 border-[#ff9d2b]'
                              : isLightMode 
                                ? 'text-slate-600 hover:bg-slate-100/70 hover:text-black' 
                                : 'text-[#cdc3d0] hover:bg-white/5 hover:text-black dark:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          ) : (
            <div>
              <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-3 px-2 ${isLightMode ? 'text-gray-400' : 'text-[#ff9d2b]/70'}`}>
                WEB3 & DEFI
              </h3>
              <ul className="space-y-1">
                {[
                  { id: 'workspace', label: lang === 'fr' ? 'STAKING CAFM' : 'CAFM STAKING', icon: 'account_balance_wallet' },
                  { id: 'gov', label: lang === 'fr' ? 'GOUVERNANCE DAO' : 'DAO GOVERNANCE', icon: 'diversity_3' },
                  { id: 'ido', label: lang === 'fr' ? 'IDO LAUNCHPAD' : 'IDO LAUNCHPAD', icon: 'rocket_launch' },
                  { id: 'bridge', label: lang === 'fr' ? 'CROSS-CHAIN BRIDGE' : 'CROSS-CHAIN BRIDGE', icon: 'swap_calls' },
                  { id: 'oracles', label: lang === 'fr' ? 'ORACLE PRICES' : 'ORACLE PRICES', icon: 'query_stats' },
                  { id: 'perps', label: lang === 'fr' ? 'PERPETUALS TRADING' : 'PERPETUALS TRADING', icon: 'candlestick_chart' },
                  { id: 'options', label: lang === 'fr' ? 'OPTIONS TRADING' : 'OPTIONS TRADING', icon: 'donut_large' }
                ].map((item, index) => {
                  const isActive = currentPage === item.id;
                  return (
                    <li key={index}>
                      <button
                        onClick={() => {
                          if (item.id === 'workspace') onNavigate('workspace');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-bold font-mono text-left ${
                          isActive
                            ? 'bg-[#ff9d2b]/10 text-[#ff9d2b] border-l-4 border-[#ff9d2b]'
                            : isLightMode 
                              ? 'text-slate-600 hover:bg-slate-100/70 hover:text-black' 
                              : 'text-[#cdc3d0] hover:bg-white/5 hover:text-black dark:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
      </div>

      {/* Sidebar Footer Area containing Mode Light Switch & Tarik Benaich user block */}
      <div className="pt-6 border-t border-slate-200/50 dark:border-white/5 mt-8 space-y-4">
        {/* Mode Clair Switch */}
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-bold font-mono uppercase text-slate-500 flex items-center gap-2">
            {isLightMode ? <Sun className="w-3.5 h-3.5 text-orange-500" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
            {lang === 'fr' ? 'MODE CLAIR' : 'LIGHT MODE'}
          </span>
          <button 
            type="button"
            onClick={onToggleLightMode}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${isLightMode ? 'bg-[#ff9d2b]' : 'bg-gray-700'}`}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isLightMode ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Profile Block */}
        <div className={`p-3 rounded-2xl flex items-center gap-3 ${isLightMode ? 'bg-slate-100/60' : 'bg-white dark:bg-slate-950/35'}`}>
          <div className="w-10 h-10 rounded-xl bg-[#ff9d2b]/20 text-[#ff9d2b] border border-[#ff9d2b]/40 font-black flex items-center justify-center font-mono text-sm shadow-[inset_0_0_10px_rgba(255,157,43,0.15)]">
            TB
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate">Tarik Benaich</div>
            <div className="text-[10px] font-mono text-[#ff9d2b] uppercase font-bold tracking-widest mt-0.5">SUPERADMIN</div>
          </div>
        </div>

        {/* Sidebar Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button className={`py-2 px-3 rounded-xl text-[10px] font-mono font-bold uppercase text-center border transition-all ${isLightMode ? 'bg-white border-slate-200 text-gray-700 hover:bg-slate-50' : 'bg-white/5 border-white/15 text-black dark:text-white hover:bg-white/10'}`}>
            {lang === 'fr' ? 'ÉQUIPE' : 'TEAM'}
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className="py-2 px-3 rounded-xl text-[10px] font-mono font-bold uppercase text-center bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all"
          >
            {lang === 'fr' ? 'RETOUR' : 'BACK'}
          </button>
        </div>
      </div>
    </aside>
  );
};
