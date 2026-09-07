import React, { useState } from 'react';
import { NavigationPage, UserSession } from '../../types/bizos';
import { OfflineCacheStatus } from '../OfflineCacheStatus';
import { BeeLogo } from '../BeeLogo';
import { AppDownloadQrCard } from '../AppDownloadQrCard';
import { ErrorBoundary } from '../ErrorBoundary';
import { 
  ChevronRight, 
  LayoutDashboard, 
  Box, 
  Database, 
  ArrowLeft, 
  Moon, 
  Sun,
  ChevronDown,
  QrCode,
  Smartphone
} from 'lucide-react';

const RESTRICTED_PAGES: Record<string, { roles: string[]; labelFr: string; labelEn: string }> = {
  'security-access': { roles: ['SuperAdmin', 'Admin', 'FacilityManager', 'Technician', 'Guest'], labelFr: 'Sécurité & Contrôle d\'Accès', labelEn: 'Security & Access Control' },
  'system-config': { roles: ['SuperAdmin', 'Admin', 'FacilityManager', 'Technician', 'Guest'], labelFr: 'Configuration Système Globale', labelEn: 'Global System Configuration' },
  'erp-integration': { roles: ['SuperAdmin', 'Admin', 'FacilityManager', 'Technician', 'Guest'], labelFr: 'Intégration & Synchronisation ERP', labelEn: 'ERP Integration & Sync' },
  'analytics-dashboard': { roles: ['SuperAdmin', 'Admin', 'FacilityManager', 'Technician', 'Guest'], labelFr: 'Analytiques, KPIs & Rapports RSE', labelEn: 'Analytics & ESG Reports' },
  'cmms-beecarbonat': { roles: ['SuperAdmin', 'Admin', 'FacilityManager', 'Technician', 'Guest'], labelFr: 'Portail de Déploiement Vercel Edge', labelEn: 'Vercel Edge Deployment' }
};

interface DashboardLayoutProps {
  currentPage: NavigationPage;
  onNavigate: (page: any) => void;
  lang: 'fr' | 'en';
  isLightMode: boolean;
  onToggleLightMode: () => void;
  dashboardMode: 'cafm' | 'web3';
  onChangeDashboardMode: (mode: 'cafm' | 'web3') => void;
  currentUser: UserSession | null;
  onUpdateUserRole: (role: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPage,
  onNavigate,
  lang,
  isLightMode,
  onToggleLightMode,
  dashboardMode,
  onChangeDashboardMode,
  currentUser,
  onUpdateUserRole,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const restriction = RESTRICTED_PAGES[currentPage];
  const activeRole = currentUser?.role || 'Guest';
  const hasAccess = !restriction || restriction.roles.includes(activeRole);

  const renderGuardPage = () => {
    if (!restriction) return null;
    return (
      <div className={`p-8 rounded-2xl border text-center max-w-2xl mx-auto my-12 backdrop-blur-md relative overflow-hidden transition-all shadow-xl ${
        isLightMode 
          ? 'bg-white/90 border-red-200/60 shadow-red-100/30' 
          : 'bg-[#0a0a0a]/90 border-red-500/25 shadow-black/80'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        
        {/* Animated holographic lock/shield icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-red-500/10 border border-red-500/25 animate-pulse text-red-500">
          <span className="material-symbols-outlined text-3xl">shield_lock</span>
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-red-500/10 text-red-500 border border-red-500/25 mb-4">
          {lang === 'fr' ? 'Accès Restreint' : 'Access Restricted'}
        </div>
        
        <h2 className="text-xl font-mono font-black uppercase tracking-tight mb-2 text-gray-900 dark:text-white">
          {lang === 'fr' ? 'Vérification du Rôle de Sécurité' : 'Security Role Verification'}
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          {lang === 'fr' 
            ? `La section "${restriction.labelFr}" est hautement sensible et requiert l'un des rôles d'accréditation suivants :`
            : `The section "${restriction.labelEn}" is highly confidential and requires one of the following security roles:`}
        </p>

        {/* Authorized Roles List */}
        <div className="flex justify-center gap-3 mb-8">
          {restriction.roles.map(r => (
            <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#ff9a00]/10 text-orange-500 border border-orange-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9a00]" />
              {r}
            </span>
          ))}
        </div>

        {/* Current status info */}
        <div className={`p-4 rounded-xl mb-8 border text-left ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">{lang === 'fr' ? 'Identifiant de session :' : 'Session identity:'}</span>
            <span className="font-bold text-gray-700 dark:text-slate-200">{currentUser?.email || 'Guest / Non connecté'}</span>
          </div>
          <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2" />
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">{lang === 'fr' ? 'Votre rôle actuel :' : 'Your current role:'}</span>
            <span className="font-black px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/25">
              {activeRole}
            </span>
          </div>
        </div>

        {/* Dynamic simulator playground buttons */}
        <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-6">
          <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            ⚡ {lang === 'fr' ? 'Simulateur de Rôles en Direct (Bac à sable)' : 'Live Role Simulator Playground'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
            {lang === 'fr'
              ? 'Pour les besoins de la démonstration, changez de rôle instantanément pour débloquer l\'accès et voir les modifications en temps réel :'
              : 'For demonstration purposes, switch roles on-the-fly to simulate authorization and view the sections:'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['SuperAdmin', 'Admin', 'Technician', 'Guest'].map((r) => (
              <button
                key={r}
                onClick={() => onUpdateUserRole(r)}
                className={`py-2 px-3 rounded-xl border font-mono text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                  activeRole === r
                    ? 'bg-orange-500 text-white dark:text-white border-orange-500 shadow-md shadow-[#ff9a00]/20'
                    : isLightMode
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-[#0a0a0a] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {r === 'SuperAdmin' ? 'military_tech' : r === 'Admin' ? 'admin_panel_settings' : r === 'Technician' ? 'build' : 'person_search'}
                </span>
                <span>{r}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Restructured 5 Strategic Enterprise Pillars (ISO 50001, CSRD, BIM IFC, Smart CAFM)
  const cafmGroups = [
    {
      title: lang === 'fr' ? '🏢 1. OPÉRATIONS & FLUIDES' : '🏢 1. SMART UTILITIES & BMS',
      items: [
        { id: 'workspace', label: lang === 'fr' ? 'Vue d\'ensemble & Pilotage' : 'Overview & Cockpit', icon: 'grid_view' },
        { id: 'lighting', label: lang === 'fr' ? 'Énergie & Éclairage (Smart Metering)' : 'Energy & Lighting Pulse', icon: 'lightbulb' },
        { id: 'water', label: lang === 'fr' ? 'Eau & Fluides (HydroSync)' : 'Water HydroSync', icon: 'water_drop' },
        { id: 'waste', label: lang === 'fr' ? 'Déchets & Économie Circulaire' : 'Circular Flow & Waste', icon: 'recycling' },
      ]
    },
    {
      title: lang === 'fr' ? '⚙️ 2. GMAO, TICKETS & INTERVENANTS' : '⚙️ 2. CMMS, TICKETS & TEAMS',
      items: [
        { id: 'work-orders', label: lang === 'fr' ? '🎫 Gestion des Tickets (GMAO)' : '🎫 Work Orders & Tickets', icon: 'assignment' },
        { id: 'team-ops', label: lang === 'fr' ? '👷 Gestion des Intervenants & Agents' : '👷 Field Operators & Teams', icon: 'group' },
        { id: 'spaces', label: lang === 'fr' ? '🏢 Gestion des Sites & Adresses' : '🏢 Sites & Addresses Manager', icon: 'domain' },
        { id: 'assets', label: lang === 'fr' ? '📦 Équipements & Inventaire EAM' : '📦 Assets Manager & EAM', icon: 'inventory_2' },
        { id: 'maintenance', label: lang === 'fr' ? '🛠️ Maintenance & Interventions' : '🛠️ Maintenance Engine', icon: 'build' },
        { id: 'scanner', label: lang === 'fr' ? '📱 Scan Sans Contact NFC & QR' : '📱 Contactless NFC & QR', icon: 'qr_code_scanner' },
      ]
    },
    {
      title: lang === 'fr' ? '🌍 3. STRATÉGIE CLIMAT & ESG' : '🌍 3. CLIMATE STRATEGY & ESG',
      items: [
        { id: 'env-impact', label: lang === 'fr' ? 'Bilan Carbone Scopes 1-2-3 (CSRD)' : 'Carbon Scopes 1-2-3 (CSRD)', icon: 'nature_people' },
        { id: 'market', label: lang === 'fr' ? 'Marché des Crédits Carbone' : 'Carbon Credit Market', icon: 'public' },
        { id: 'air-quality', label: lang === 'fr' ? 'Qualité de l\'Air (QAI)' : 'Air Quality AQI', icon: 'air' },
        { id: 'occupants-care', label: lang === 'fr' ? 'Confort & Bien-être Occupants' : 'Occupant Wellness', icon: 'person_pin' },
        { id: 'esg-copilot', label: lang === 'fr' ? 'Copilote IA Optimisation Énergie' : 'ESG Energy Copilot', icon: 'eco' },
      ]
    },
    {
      title: lang === 'fr' ? '📐 4. JUMEAU NUMÉRIQUE & HYPERVISION' : '📐 4. DIGITAL TWIN & SPATIAL',
      items: [
        { id: 'bim-3d', label: lang === 'fr' ? 'Jumeau 3D & Visionneuse BIM' : '3D Digital Twin & BIM', icon: 'architecture' },
        { id: 'grafana', label: lang === 'fr' ? 'Observabilité Grafana v11.4' : 'Grafana Telemetry v11.4', icon: 'monitoring' },
        { id: 'mission-control', label: lang === 'fr' ? 'Hyperviseur Mission Control HQ' : 'Mission Control HQ', icon: 'speed' },
        { id: 'god-mode', label: lang === 'fr' ? 'God-Mode Spatial Matrix' : 'God-Mode Spatial Matrix', icon: 'view_in_ar' },
        { id: 'predictive-ai', label: lang === 'fr' ? 'IA Prédictive & Santé Actifs' : 'Predictive AI Diagnostics', icon: 'psychology' },
      ]
    },
    {
      title: lang === 'fr' ? '🔌 5. GOUVERNANCE & SUPER ADMIN' : '🔌 5. GOVERNANCE & SUPER ADMIN',
      items: [
        { id: 'system-config', label: lang === 'fr' ? '⚙️ Configuration Super Admin (Sites & Intervenants)' : '⚙️ Super Admin Config (Sites & Teams)', icon: 'settings' },
        { id: 'diagnostics', label: lang === 'fr' ? 'Audit Rubriques & Base de Données' : 'Rubrics & DB Diagnostics', icon: 'verified_user' },
        { id: 'erp-integration', label: lang === 'fr' ? 'Connecteurs ERP (SAP, CRM)' : 'ERP Connectors (SAP)', icon: 'hub' },
        { id: 'google-sheets', label: lang === 'fr' ? 'Google Sheets Live Sync' : 'Google Sheets Live Sync', icon: 'table_view' },
        { id: 'analytics-dashboard', label: lang === 'fr' ? 'Analytiques & Reporting Exécutif' : 'Analytics & Executive KPI', icon: 'analytics' },
        { id: 'genai-assistant', label: lang === 'fr' ? 'BMS Assistant IA Générative' : 'BMS Generative AI Assistant', icon: 'smart_toy' },
        { id: 'security-access', label: lang === 'fr' ? 'Sécurité Zero-Trust & Accès' : 'Zero-Trust Security & RBAC', icon: 'shield' },
      ]
    },
    {
      title: lang === 'fr' ? '🏛️ Écosystème & Ressources' : '🏛️ Ecosystem & Info',
      items: [
        { id: 'bee-roots', label: lang === 'fr' ? 'À Propos de BeeCarbonat' : 'About BeeCarbonat', icon: 'info' },
        { id: 'success-stories', label: lang === 'fr' ? 'Cas Clients & Retours d\'Expérience' : 'Client Success Stories', icon: 'auto_awesome' },
        { id: 'careers', label: lang === 'fr' ? 'Espace Carrières' : 'Careers Workspace', icon: 'work' },
        { id: 'partner-portal', label: lang === 'fr' ? 'Portail Partenaire B2B' : 'B2B Partner Portal', icon: 'vpn_key' },
      ]
    }
  ];

  const web3Groups = [
    {
      title: 'Web3 & DeFi Engine',
      items: [
        { id: 'workspace', label: lang === 'fr' ? 'Staking CAFM' : 'CAFM Staking Pool', icon: 'account_balance_wallet' },
        { id: 'gov', label: lang === 'fr' ? 'Gouvernance DAO' : 'DAO Governance', icon: 'diversity_3' },
        { id: 'ido', label: lang === 'fr' ? 'Launchpad IDO' : 'IDO Launchpad', icon: 'rocket_launch' },
        { id: 'bridge', label: lang === 'fr' ? 'Pont Cross-Chain' : 'Cross-Chain Bridge', icon: 'swap_calls' },
        { id: 'oracles', label: lang === 'fr' ? 'Tarifs d\'Oracles' : 'Oracle Price Feeds', icon: 'query_stats' },
        { id: 'perps', label: lang === 'fr' ? 'Trading Perpétuel' : 'Perpetuals Engine', icon: 'candlestick_chart' },
        { id: 'options', label: lang === 'fr' ? 'Trading d\'Options' : 'Options Chamber', icon: 'donut_large' },
      ]
    }
  ];

  const activeGroups = dashboardMode === 'cafm' ? cafmGroups : web3Groups;

  return (
    <div className={`vercel-ui min-h-screen transition-colors duration-200 font-sans ${
      isLightMode 
        ? 'bg-white text-slate-900 selection:bg-amber-100 selection:text-amber-950' 
        : 'bg-[#000000] text-[#f4effa] selection:bg-amber-500/30 selection:text-amber-200'
    }`}>
      {/* Vercel Top Navigation Header */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors px-4 py-2 flex items-center justify-between font-sans ${
        isLightMode 
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' 
          : 'border-amber-500/30 bg-black/95 text-white shadow-[0_4px_20px_rgba(0,0,0,0.8)]'
      }`}>
        
        {/* --- GAUCHE : NAVIGATION & HIÉRARCHIE --- */}
        <div className="flex items-center gap-3">
          {/* Logo & Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <div 
              className="relative group cursor-pointer transition-transform hover:scale-105"
              onClick={() => onNavigate('home')}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden ${
                isLightMode 
                  ? 'border border-slate-200 bg-slate-50' 
                  : 'border border-amber-500/40 bg-black/80 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
              }`}>
                <BeeLogo size="sm" showText={false} />
              </div>
              <span className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white dark:border-black ${
                isLightMode ? 'bg-amber-500' : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
              }`}></span>
            </div>
          </div>
        </div>

        {/* --- CENTRE : CONTRÔLES & MODE --- */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Role Selector */}
          <div className="relative group/role">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all ${
              isLightMode 
                ? 'bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-800' 
                : 'bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] text-amber-400'
            }`}>
              <span className={`text-[10px] uppercase font-bold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Role:</span>
              <span className="text-xs font-bold font-mono">{currentUser?.role || 'Guest'}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
            
            <div className={`absolute left-0 mt-1.5 w-40 rounded-xl border p-1.5 shadow-2xl hidden group-hover/role:block z-50 backdrop-blur-xl ${
              isLightMode ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0a0a0a] border-amber-500/40'
            }`}>
              <p className={`text-[8px] font-mono font-black uppercase px-2 py-1 select-none ${
                isLightMode ? 'text-slate-400' : 'text-amber-400/70'
              }`}>
                {lang === 'fr' ? 'SIMULER RÔLE' : 'SIMULATE ROLE'}
              </p>
              {['SuperAdmin', 'Admin', 'Technician', 'Guest'].map((r) => (
                <button
                  key={r}
                  onClick={() => onUpdateUserRole(r)}
                  className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-mono transition-colors block ${
                    (currentUser?.role || 'Guest') === r
                      ? isLightMode 
                        ? 'bg-amber-500 text-white font-bold' 
                        : 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : isLightMode 
                        ? 'text-slate-700 hover:bg-slate-100' 
                        : 'text-slate-400 hover:bg-neutral-900 hover:text-amber-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className={`flex items-center p-1 rounded-full border ${
            isLightMode 
              ? 'border-slate-200 bg-slate-100' 
              : 'border-amber-500/30 bg-black shadow-[0_0_10px_rgba(245,158,11,0.08)]'
          }`}>
            <button 
              onClick={() => onNavigate('work-orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentPage === 'work-orders'
                  ? isLightMode 
                    ? 'bg-amber-600 text-white shadow font-black border border-amber-700' 
                    : 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] font-black border border-amber-300'
                  : isLightMode 
                    ? 'text-amber-800 hover:text-amber-950 hover:bg-amber-100' 
                    : 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/15'
              }`}
              title="Gestion des Tickets et Ordres de travail GMAO"
            >
              <span className="material-symbols-outlined text-[14px]">assignment</span>
              {lang === 'fr' ? 'Tickets' : 'Tickets'}
            </button>
            <button 
              onClick={() => onNavigate('team-ops')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ml-1 ${
                currentPage === 'team-ops'
                  ? isLightMode 
                    ? 'bg-orange-500 text-white shadow font-black border border-orange-600' 
                    : 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)] font-black border border-orange-400'
                  : isLightMode 
                    ? 'text-orange-700 hover:text-orange-900 hover:bg-orange-50' 
                    : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'
              }`}
              title="Gestion des Intervenants et Techniciens"
            >
              <span className="material-symbols-outlined text-[14px]">group</span>
              {lang === 'fr' ? 'Intervenants' : 'Operators'}
            </button>
            <button 
              onClick={() => onNavigate('spaces')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ml-1 ${
                currentPage === 'spaces'
                  ? isLightMode 
                    ? 'bg-sky-600 text-white shadow font-black border border-sky-700' 
                    : 'bg-sky-600 text-white shadow-[0_0_15px_rgba(2,132,199,0.6)] font-black border border-sky-400'
                  : isLightMode 
                    ? 'text-sky-700 hover:text-sky-900 hover:bg-sky-50' 
                    : 'text-sky-400 hover:text-sky-300 hover:bg-sky-500/10'
              }`}
              title="Gestion des Sites, Bâtiments et Adresses"
            >
              <span className="material-symbols-outlined text-[14px]">domain</span>
              {lang === 'fr' ? 'Sites' : 'Sites'}
            </button>
            <button 
              onClick={() => onNavigate('system-config')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ml-1 ${
                currentPage === 'system-config'
                  ? isLightMode 
                    ? 'bg-emerald-600 text-white shadow font-black border border-emerald-700' 
                    : 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] font-black border border-emerald-400'
                  : isLightMode 
                    ? 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50' 
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
              title="Configuration Super Admin Master (Sites & Intervenants)"
            >
              <span className="material-symbols-outlined text-[14px]">settings</span>
              {lang === 'fr' ? 'Config Super Admin' : 'Super Admin'}
            </button>
            <button 
              onClick={() => onNavigate('mission-control')}
              className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ml-1 ${
                currentPage === 'mission-control'
                  ? isLightMode 
                    ? 'bg-white text-slate-900 shadow font-black border border-slate-300' 
                    : 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] font-black border border-amber-300'
                  : isLightMode 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60' 
                    : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Cockpit
            </button>
            <button 
              onClick={() => onNavigate('god-mode')}
              className={`hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ml-1 ${
                currentPage === 'god-mode'
                  ? isLightMode 
                    ? 'bg-white text-slate-900 shadow font-black border border-slate-300' 
                    : 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] font-black border border-amber-300'
                  : isLightMode 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60' 
                    : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              God-Mode
            </button>
          </div>

        {/* Database Sync Status */}
        <div className="hidden lg:block">
          <OfflineCacheStatus lang={lang} isLightMode={isLightMode} />
        </div>
        </div>

        {/* --- DROITE : UTILS & STATUS --- */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Download App QR Button matching the cyan card */}
          <button 
            onClick={() => setShowDownloadModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
              isLightMode 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' 
                : 'bg-black hover:bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)] border border-amber-500/40'
            }`}
            title="Afficher le QR Code pour installer ou télécharger l'application"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'App Mobile' : 'Mobile App'}</span>
          </button>

          {/* Site Public Button */}
          <button 
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isLightMode 
                ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800' 
                : 'bg-black border border-amber-500/30 text-slate-300 hover:text-amber-300 hover:border-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'Site Public' : 'Public Site'}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleLightMode}
            className={`p-2 rounded-full border transition-all ${
              isLightMode 
                ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900' 
                : 'border border-amber-500/30 bg-black text-amber-400 hover:text-amber-300 hover:border-amber-400 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]'
            }`}
          >
            {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setShowDownloadModal(true)}
            className={`p-1.5 rounded-full border ${isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-black border-amber-500/40 text-amber-400'}`}
            title="QR Code App"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleLightMode}
            className={`p-1.5 rounded-full border ${isLightMode ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-amber-500/30 bg-black text-amber-400'}`}
          >
            {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded-full border ${isLightMode ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-amber-500/30 bg-black text-amber-400'}`}
          >
            <span className="material-symbols-outlined text-xs">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Nav Dropdown Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b py-3 px-4 space-y-4 transition-colors ${
          isLightMode ? 'bg-white border-slate-200 text-slate-900 shadow-lg' : 'border-amber-500/30 bg-black text-white'
        }`}>
          {/* Dashboard Switch inside mobile menu */}
          <div className={`flex gap-2 p-1 rounded-xl border text-[10px] font-mono ${
            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-neutral-900 border-amber-500/30'
          }`}>
            <button
              onClick={() => onChangeDashboardMode('cafm')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                dashboardMode === 'cafm' 
                  ? isLightMode ? 'bg-white text-slate-900 font-bold shadow-sm' : 'bg-amber-500 text-black font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                  : isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              🏢 CAFM GMAO
            </button>
            <button
              onClick={() => onChangeDashboardMode('web3')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                dashboardMode === 'web3' 
                  ? isLightMode ? 'bg-white text-slate-900 font-bold shadow-sm' : 'bg-amber-500 text-black font-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                  : isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              🌐 WEB3 & DEFI
            </button>
          </div>

          <div className="space-y-3">
            {activeGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className={`text-[9px] font-mono font-bold uppercase px-2 ${
                  isLightMode ? 'text-slate-500' : 'text-amber-400/80'
                }`}>
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-mono text-[11px] flex items-center gap-2 transition-all ${
                        isActive
                          ? isLightMode 
                            ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' 
                            : 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                          : isLightMode 
                            ? 'text-slate-700 hover:bg-slate-100' 
                            : 'text-slate-300 hover:bg-neutral-900 hover:text-amber-200'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xs ${isActive ? (isLightMode ? 'text-amber-600' : 'text-amber-400') : (isLightMode ? 'text-slate-500' : 'text-slate-400')}`}>{item.icon}</span>
                      <span className={isActive ? (isLightMode ? 'text-amber-900 font-bold' : 'text-amber-300 font-bold') : (isLightMode ? 'text-slate-800' : 'text-slate-300')}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className={`h-[1px] my-2 ${isLightMode ? 'bg-slate-200' : 'bg-amber-500/20'}`} />
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 ${
              isLightMode ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-amber-300'
            }`}
          >
            <span className={`material-symbols-outlined text-xs ${isLightMode ? 'text-slate-600' : 'text-amber-400'}`}>arrow_back</span>
            {lang === 'fr' ? 'Retour au site public' : 'Back to Public Site'}
          </button>
        </div>
      )}

      {/* Main Content Workspace Container (Pristine Antigravity Canvas) */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 lg:gap-8">
        
        {/* Left Side: Antigravity-style Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} hidden lg:block shrink-0 transition-all duration-300 space-y-4`}>
          
          {/* Collapse/Expand Toggle Button & CAFM Mode */}
          <div className="flex items-center justify-between gap-1.5">
            {!isSidebarCollapsed && (
              <div className={`flex-1 p-1 rounded-xl border flex gap-1 text-[10px] font-mono ${
                isLightMode 
                  ? 'bg-slate-100 border-slate-300' 
                  : 'bg-black border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
              }`}>
                <button
                  onClick={() => onChangeDashboardMode('cafm')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                    dashboardMode === 'cafm' 
                      ? isLightMode 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-300' 
                        : 'bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] border border-amber-400/60' 
                      : isLightMode 
                        ? 'text-slate-600 hover:text-slate-900' 
                        : 'text-slate-400 hover:text-amber-200'
                  }`}
                >
                  🏢 CAFM
                </button>
                <button
                  onClick={() => onChangeDashboardMode('web3')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                    dashboardMode === 'web3' 
                      ? isLightMode 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-300' 
                        : 'bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] border border-amber-400/60' 
                      : isLightMode 
                        ? 'text-slate-600 hover:text-slate-900' 
                        : 'text-slate-400 hover:text-amber-200'
                  }`}
                >
                  🌐 WEB3
                </button>
              </div>
            )}
            
            {/* Collapse Toggle Button */}
            <button
              id="btn-collapse-sidebar-toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 rounded-xl border transition-all flex items-center justify-center font-mono ${
                isLightMode 
                  ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900' 
                  : 'border-amber-500/30 bg-black text-slate-300 hover:text-amber-300 hover:border-amber-400 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              } ${isSidebarCollapsed ? 'w-full shadow-sm py-2' : ''}`}
              title={isSidebarCollapsed ? (lang === 'fr' ? 'Agrandir la barre latérale' : 'Expand sidebar') : (lang === 'fr' ? 'Réduire la barre latérale' : 'Collapse sidebar')}
              aria-label="Toggle sidebar width"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLightMode ? 'text-slate-700' : 'text-amber-400'}`}>
                {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
              {!isSidebarCollapsed && (
                <span className={`text-[10px] font-semibold ml-1 hidden xl:inline ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  {lang === 'fr' ? 'Réduire' : 'Collapse'}
                </span>
              )}
            </button>
          </div>

          {/* Render Groups and Items */}
          <div className="space-y-4 overflow-y-auto max-h-[72vh] pr-1 no-scrollbar">
            {activeGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <h3 className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 ${
                    isLightMode ? 'text-slate-500' : 'text-amber-400/70'
                  }`}>
                    {group.title}
                  </h3>
                )}
                <nav className="space-y-1" aria-label="Sidebar Navigation">
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        title={item.label}
                        className={`w-full flex items-center gap-2.5 rounded-xl font-mono text-xs transition-all ${
                          isSidebarCollapsed 
                            ? 'justify-center p-2.5' 
                            : 'px-3 py-2'
                        } ${
                          isActive
                            ? isLightMode 
                              ? 'bg-amber-100 border border-amber-400 text-amber-900 font-bold shadow-sm' 
                              : 'bg-amber-500/15 border border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : isLightMode 
                              ? 'bg-transparent border border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-100 hover:border-slate-300' 
                              : 'bg-black/40 border border-amber-500/15 text-slate-300 hover:text-amber-200 hover:bg-amber-500/10 hover:border-amber-400/50'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[16px] leading-none shrink-0 ${
                          isActive 
                            ? (isLightMode ? 'text-amber-700' : 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]') 
                            : (isLightMode ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-amber-300')
                        }`}>
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && (
                          <span className={`truncate text-left ${
                            isActive 
                              ? (isLightMode ? 'text-amber-950 font-bold' : 'text-amber-300 font-bold') 
                              : (isLightMode ? 'text-slate-800' : 'text-slate-300')
                          }`}>
                            {item.label}
                          </span>
                        )}
                        {!isSidebarCollapsed && isActive && (
                          <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${
                            isLightMode ? 'bg-amber-600' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
          
          {/* Footer of Sidebar with collapse toggle & status */}
          <div className={`pt-3 border-t text-center space-y-2 ${isLightMode ? 'border-slate-200' : 'border-amber-500/30'}`}>
            {!isSidebarCollapsed ? (
              <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold px-3 py-1 rounded-full border ${
                isLightMode 
                  ? 'text-slate-700 bg-slate-100 border-slate-300' 
                  : 'text-amber-300 bg-black border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLightMode ? 'bg-emerald-500' : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'}`} />
                Edge CDG1 Paris
              </span>
            ) : (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className={`w-full flex justify-center p-1.5 ${isLightMode ? 'text-slate-700 hover:text-slate-950' : 'text-amber-400 hover:text-amber-300'}`}
                title="Agrandir la barre"
              >
                <span className="material-symbols-outlined text-[16px]">dock_to_right</span>
              </button>
            )}
          </div>
        </aside>

        {/* Right Side: Active Workspace Viewport */}
        <main className="flex-1 min-w-0">
          {/* Render Active Selected Component viewport */}
          <div className="min-h-[60vh] animate-fade-in">
            <ErrorBoundary key={currentPage}>
              {hasAccess ? children : renderGuardPage()}
            </ErrorBoundary>
          </div>
        </main>

      </div>

      {/* Vercel-style footer */}
      <footer className={`border-t py-6 mt-16 transition-colors text-center text-[10px] font-mono ${
        isLightMode ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-neutral-900 bg-black text-gray-400'
      }`}>
        <div className="max-w-8xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BeeLogo size="sm" showText={false} />
            <span className={isLightMode ? 'text-slate-700' : 'text-gray-300'}>© {new Date().getFullYear()} BeeCarbonat • Global Deployment Platform.</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#docs" className={`transition-colors ${isLightMode ? 'hover:text-black text-slate-600' : 'hover:text-white text-gray-400'}`}>Documentation</a>
            <span className={isLightMode ? 'text-slate-300' : 'text-neutral-800'}>|</span>
            <a href="#status" className={`transition-colors font-bold ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`}>All Edge Systems Operational</a>
            <span className={isLightMode ? 'text-slate-300' : 'text-neutral-800'}>|</span>
            <a href="#privacy" className={`transition-colors ${isLightMode ? 'hover:text-black text-slate-600' : 'hover:text-white text-gray-400'}`}>Privacy Policy</a>
          </div>
        </div>
      </footer>
      {/* Modal for App Download QR matching user reference */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full animate-scale-up">
            <AppDownloadQrCard
              url={typeof window !== 'undefined' ? window.location.href : 'https://beecarbonat.com/app'}
              title="Téléchargez l'application"
              subtitle="Scannez ce QR Code avec votre appareil photo pour ouvrir la Web App"
              backgroundColor="bg-[#4ec5f7]"
              onClose={() => setShowDownloadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
