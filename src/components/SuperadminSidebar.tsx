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
      className={`fixed left-3 top-3 bottom-3 w-64 rounded-xl border p-3 flex flex-col transition-colors duration-300 z-40 h-[calc(100vh-1.5rem)] ${
        isLightMode 
          ? 'bg-white border-slate-200 shadow-md text-slate-900' 
          : 'bg-zinc-950 border-zinc-800 text-zinc-200'
      }`}
    >
      {/* Header / Logo */}
      <div className="pb-2.5 border-b border-slate-200 dark:border-zinc-800 mb-2 shrink-0">
        <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5 font-mono">
          <span className="text-slate-900 dark:text-white font-bold">SUPERADMIN</span>
          <span className="text-blue-500 text-xs font-semibold">HQ</span>
        </h2>
        <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
          {lang === 'fr' ? 'FACILITY MANAGEMENT' : 'FACILITY MANAGEMENT'}
        </div>
      </div>

      {/* Sidebar Navigation Selector */}
      <div className="mb-2 shrink-0">
        <div className={`flex gap-1.5 p-1 rounded-xl border text-[10px] font-mono mb-2 ${
          isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
        }`}>
          <button 
            onClick={() => onChangeDashboardMode('cafm')}
            className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
              dashboardMode === 'cafm' 
                ? isLightMode ? 'bg-white text-slate-900 shadow-sm' : 'bg-[#0051c3] text-white' 
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            CAFM GMAO
          </button>
          <button 
            onClick={() => onChangeDashboardMode('web3')}
            className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition-all ${
              dashboardMode === 'web3' 
                ? isLightMode ? 'bg-white text-slate-900 shadow-sm' : 'bg-[#0051c3] text-white' 
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            WEB3 & DEFI
          </button>
        </div>
      </div>

      {/* Render Sidebar Navigation List with scrollable container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 my-2 no-scrollbar">
          {dashboardMode === 'cafm' ? (
            <>
              {/* Category 0: CYBER COCKPITS (Variants 1-10) */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                            isActive
                              ? isLightMode 
                                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                                : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                              : isLightMode 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 1: OPÉRATIONS & FLUIDES */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {lang === 'fr' ? '1. OPÉRATIONS & FLUIDES (BMS)' : '1. SMART UTILITIES & BMS'}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                            isActive
                              ? isLightMode 
                                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                                : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                              : isLightMode 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 2: GMAO & GESTION TECHNIQUE */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {lang === 'fr' ? '2. GMAO & GESTION TECHNIQUE' : '2. ASSET LIFECYCLE & CMMS'}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                            isActive
                              ? isLightMode 
                                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                                : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                              : isLightMode 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 3: STRATÉGIE CLIMAT & ESG */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {lang === 'fr' ? '3. STRATÉGIE CLIMAT & ESG' : '3. CLIMATE STRATEGY & ESG'}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                            isActive
                              ? isLightMode 
                                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                                : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                              : isLightMode 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 4: JUMEAU NUMÉRIQUE & HYPERVISION */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {lang === 'fr' ? '4. JUMEAU NUMÉRIQUE & HYPERVISION' : '4. DIGITAL TWIN & SPATIAL'}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                            isActive
                              ? isLightMode 
                                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                                : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                              : isLightMode 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 5: CONNECTIVITÉ & GOUVERNANCE */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {lang === 'fr' ? '5. CONNECTIVITÉ & GOUVERNANCE' : '5. CONNECTIVITY & GOVERNANCE'}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                            isActive
                              ? isLightMode 
                                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                                : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                              : isLightMode 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Category 6: ÉCOSYSTÈME & RESSOURCES */}
              <div>
                <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {lang === 'fr' ? 'ÉCOSYSTÈME & RESSOURCES' : 'ECOSYSTEM & INFO'}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                            isActive
                              ? isLightMode 
                                ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                                : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                              : isLightMode 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
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
              <h3 className={`text-[10px] font-mono font-bold tracking-wider uppercase mb-2 px-2 ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>
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
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-xs font-medium font-mono text-left ${
                          isActive
                            ? isLightMode 
                              ? 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold' 
                              : 'bg-zinc-900 text-white border border-zinc-700 font-semibold'
                            : isLightMode 
                              ? 'text-slate-700 hover:bg-slate-100' 
                              : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[16px] ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : 'text-zinc-500'}`}>{item.icon}</span>
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
      <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 mt-4 space-y-3">
        {/* Mode Clair Switch */}
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-medium font-mono uppercase text-zinc-500 flex items-center gap-2">
            {isLightMode ? <Sun className="w-3.5 h-3.5 text-zinc-700" /> : <Moon className="w-3.5 h-3.5 text-zinc-400" />}
            {lang === 'fr' ? 'MODE CLAIR' : 'LIGHT MODE'}
          </span>
          <button 
            type="button"
            onClick={onToggleLightMode}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${isLightMode ? 'bg-slate-900' : 'bg-zinc-800'}`}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isLightMode ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Profile Block */}
        <div className={`p-2.5 rounded-xl flex items-center gap-2.5 ${isLightMode ? 'bg-slate-100' : 'bg-zinc-900 border border-zinc-800'}`}>
          <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center font-mono text-xs">
            TB
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate text-white">Tarik Benaich</div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase font-medium mt-0.5">SUPERADMIN</div>
          </div>
        </div>

        {/* Sidebar Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button className={`py-1.5 px-3 rounded-lg text-[10px] font-mono font-medium uppercase text-center border transition-all ${isLightMode ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'}`}>
            {lang === 'fr' ? 'ÉQUIPE' : 'TEAM'}
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className={`py-1.5 px-3 rounded-lg text-[10px] font-mono font-medium uppercase text-center border transition-all ${isLightMode ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            {lang === 'fr' ? 'RETOUR' : 'BACK'}
          </button>
        </div>
      </div>
    </aside>
  );
};
