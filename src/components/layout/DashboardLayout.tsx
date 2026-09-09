import React, { useState } from 'react';
import { NavigationPage, UserSession } from '../../types/bizos';
import { OfflineCacheStatus } from '../OfflineCacheStatus';
import { FREE_TIER_PAGES } from "../../hooks/usePlanGate";
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
  'api-keys': { roles: ['SuperAdmin', 'Admin', 'FacilityManager', 'Technician', 'Guest'], labelFr: 'Gestionnaire Clés API & Scopes', labelEn: 'API Key Manager & Scopes' },
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


  const isPremium = currentUser?.plan === 'PRO' || currentUser?.plan === 'ENTERPRISE' || currentUser?.subscriptionStatus === 'active';

  const restriction = RESTRICTED_PAGES[currentPage];
  const activeRole = currentUser?.role || 'Guest';
  const hasRoleAccess = !restriction || restriction.roles.includes(activeRole);
  const isFreePlanAndRestricted = !isPremium && !FREE_TIER_PAGES.includes(currentPage);
  
  const hasAccess = hasRoleAccess && !isFreePlanAndRestricted;

  const renderGuardPage = () => {
    if (isFreePlanAndRestricted) {
      return (
        <div className={`p-8 rounded-2xl border text-center max-w-xl mx-auto my-12 backdrop-blur-md relative overflow-hidden transition-all shadow-xl ${
          isLightMode 
            ? 'bg-white/90 border-amber-200/60 shadow-amber-100/30' 
            : 'bg-[#0a0a0a]/90 border-amber-500/25 shadow-black/80'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-amber-500/10 border border-amber-500/25 animate-pulse text-amber-500">
            <span className="material-symbols-outlined text-3xl">workspace_premium</span>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/25 mb-4">
            {lang === 'fr' ? 'Fonctionnalité Premium' : 'Premium Feature'}
          </div>
          
          <h2 className="text-xl font-mono font-black uppercase tracking-tight mb-2 text-gray-900 dark:text-white">
            {lang === 'fr' ? 'Abonnement Requis' : 'Subscription Required'}
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {lang === 'fr' 
              ? `La section que vous essayez de consulter est réservée aux abonnements PRO et ENTERPRISE. Mettez à niveau votre plan pour débloquer ces rubriques.`
              : `The section you are trying to access is restricted to PRO and ENTERPRISE plans. Upgrade your subscription to unlock these features.`}
          </p>

          <button
            onClick={() => onNavigate('pricing')}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
          >
            {lang === 'fr' ? 'Voir les Offres' : 'View Pricing Plans'}
          </button>
        </div>
      );
    }

    if (!hasRoleAccess && restriction) {
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
              <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
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
        </div>
      );
    }
    
    return null;
  };

  // Restructured 5 Strategic Enterprise Pillars (ISO 50001, CSRD, BIM IFC, Smart CAFM)
  const cafmGroups = [
    {
      title: lang === 'fr' ? '1. OPÉRATIONS & FLUIDES' : '1. SMART UTILITIES & BMS',
      items: [
        { id: 'workspace', label: lang === 'fr' ? 'Vue d\'ensemble & Pilotage' : 'Overview & Cockpit', icon: 'grid_view' },
        { id: 'lighting', label: lang === 'fr' ? 'Énergie & Éclairage (Smart Metering)' : 'Energy & Lighting Pulse', icon: 'lightbulb' },
        { id: 'water', label: lang === 'fr' ? 'Eau & Fluides (HydroSync)' : 'Water HydroSync', icon: 'water_drop' },
        { id: 'waste', label: lang === 'fr' ? 'Déchets & Économie Circulaire' : 'Circular Flow & Waste', icon: 'recycling' },
      ]
    },
    {
      title: lang === 'fr' ? '2. GMAO, TICKETS & INTERVENANTS' : '2. CMMS, TICKETS & TEAMS',
      items: [
        { id: 'work-orders', label: lang === 'fr' ? 'Gestion des Tickets (GMAO)' : 'Work Orders & Tickets', icon: 'assignment' },
        { id: 'team-ops', label: lang === 'fr' ? 'Gestion des Intervenants & Agents' : 'Field Operators & Teams', icon: 'group' },
        { id: 'spaces', label: lang === 'fr' ? 'Gestion des Sites & Adresses' : 'Sites & Addresses Manager', icon: 'domain' },
        { id: 'assets', label: lang === 'fr' ? 'Équipements & Inventaire EAM' : 'Assets Manager & EAM', icon: 'inventory_2' },
        { id: 'maintenance', label: lang === 'fr' ? 'Maintenance & Interventions' : 'Maintenance Engine', icon: 'build' },
        { id: 'scanner', label: lang === 'fr' ? 'Scan Sans Contact NFC & QR' : 'Contactless NFC & QR', icon: 'qr_code_scanner' },
      ]
    },
    {
      title: lang === 'fr' ? '3. STRATÉGIE CLIMAT & ESG' : '3. CLIMATE STRATEGY & ESG',
      items: [
        { id: 'env-impact', label: lang === 'fr' ? 'Bilan Carbone Scopes 1-2-3 (CSRD)' : 'Carbon Scopes 1-2-3 (CSRD)', icon: 'nature_people' },
        { id: 'market', label: lang === 'fr' ? 'Marché des Crédits Carbone' : 'Carbon Credit Market', icon: 'public' },
        { id: 'air-quality', label: lang === 'fr' ? 'Qualité de l\'Air (QAI)' : 'Air Quality AQI', icon: 'air' },
        { id: 'occupants-care', label: lang === 'fr' ? 'Confort & Bien-être Occupants' : 'Occupant Wellness', icon: 'person_pin' },
        { id: 'esg-copilot', label: lang === 'fr' ? 'Copilote IA Optimisation Énergie' : 'ESG Energy Copilot', icon: 'eco' },
      ]
    },
    {
      title: lang === 'fr' ? '4. JUMEAU NUMÉRIQUE & HYPERVISION' : '4. DIGITAL TWIN & SPATIAL',
      items: [
        { id: 'bim-3d', label: lang === 'fr' ? 'Jumeau 3D & Visionneuse BIM' : '3D Digital Twin & BIM', icon: 'architecture' },
        { id: 'grafana', label: lang === 'fr' ? 'Observabilité Grafana v11.4' : 'Grafana Telemetry v11.4', icon: 'monitoring' },
        { id: 'mission-control', label: lang === 'fr' ? 'Hyperviseur Mission Control HQ' : 'Mission Control HQ', icon: 'speed' },
        { id: 'god-mode', label: lang === 'fr' ? 'God-Mode Spatial Matrix' : 'God-Mode Spatial Matrix', icon: 'view_in_ar' },
        { id: 'predictive-ai', label: lang === 'fr' ? 'IA Prédictive & Santé Actifs' : 'Predictive AI Diagnostics', icon: 'psychology' },
      ]
    },
    {
      title: lang === 'fr' ? '5. GOUVERNANCE & SUPER ADMIN' : '5. GOVERNANCE & SUPER ADMIN',
      items: [
        { id: 'system-config', label: lang === 'fr' ? 'Configuration Super Admin (Sites & Intervenants)' : 'Super Admin Config (Sites & Teams)', icon: 'settings' },
        { id: 'diagnostics', label: lang === 'fr' ? 'Audit Rubriques & Base de Données' : 'Rubrics & DB Diagnostics', icon: 'verified_user' },
        { id: 'erp-integration', label: lang === 'fr' ? 'Connecteurs ERP (SAP, CRM)' : 'ERP Connectors (SAP)', icon: 'hub' },
        { id: 'google-sheets', label: lang === 'fr' ? 'Google Sheets Live Sync' : 'Google Sheets Live Sync', icon: 'table_view' },
        { id: 'analytics-dashboard', label: lang === 'fr' ? 'Analytiques & Reporting Exécutif' : 'Analytics & Executive KPI', icon: 'analytics' },
        { id: 'genai-assistant', label: lang === 'fr' ? 'BMS Assistant IA Générative' : 'BMS Generative AI Assistant', icon: 'smart_toy' },
        { id: 'security-access', label: lang === 'fr' ? 'Sécurité Zero-Trust & Accès' : 'Zero-Trust Security & RBAC', icon: 'shield' },
        { id: 'api-keys', label: lang === 'fr' ? 'Gestionnaire Clés API (Scopes RBAC)' : 'API Key Manager (RBAC Scopes)', icon: 'key' },
      ]
    },
    {
      title: lang === 'fr' ? 'Écosystème & Ressources' : 'Ecosystem & Info',
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

  const filterGroups = (groups: any[]) => {
    if (isPremium) return groups;
    
    // Pour les comptes gratuits, on supprime carrément les groupes Jumeau Numérique / Web3 et on garde le reste avec des cadenas
    return groups.filter(group => 
      !group.title.includes('JUMEAU NUMÉRIQUE') && 
      !group.title.includes('Web3')
    ).map(group => ({
      ...group,
      items: group.items.map((item: any) => ({
        ...item,
        isLocked: !FREE_TIER_PAGES.includes(item.id)
      }))
    }));
  };

  const activeGroups = filterGroups(dashboardMode === 'cafm' ? cafmGroups : web3Groups);

  return (
    <div className={`vercel-ui min-h-screen transition-colors duration-200 font-sans ${
      isLightMode 
        ? 'bg-white text-slate-900 selection:bg-slate-200 selection:text-slate-950' 
        : 'bg-[#000000] text-[#f4f4f5] selection:bg-blue-600/30 selection:text-blue-200'
    }`}>
      {/* Top Navigation Header - Cloudflare Clean Standard */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors px-4 py-2 flex items-center justify-between font-sans ${
        isLightMode 
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm' 
          : 'border-zinc-800/80 bg-black/95 text-white'
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
                  : 'border border-zinc-800 bg-zinc-950'
              }`}>
                <BeeLogo size="sm" showText={false} />
              </div>
              <span className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white dark:border-black ${
                isLightMode ? 'bg-emerald-500' : 'bg-emerald-400'
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
                : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}>
              <span className={`text-[10px] uppercase font-medium ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>Role:</span>
              <span className="text-xs font-semibold font-mono">{currentUser?.role || 'Guest'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>
            
            <div className={`absolute left-0 mt-1.5 w-40 rounded-xl border p-1.5 shadow-2xl hidden group-hover/role:block z-50 backdrop-blur-xl ${
              isLightMode ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0a0a0a] border-zinc-800'
            }`}>
              <p className={`text-[8px] font-mono font-bold uppercase px-2 py-1 select-none ${
                isLightMode ? 'text-slate-400' : 'text-zinc-500'
              }`}>
                {lang === 'fr' ? 'SIMULER RÔLE' : 'SIMULATE ROLE'}
              </p>
              {['SuperAdmin', 'Admin', 'Technician', 'Guest'].map((r) => (
                <button
                  key={r}
                  onClick={() => onUpdateUserRole(r)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-mono transition-colors block ${
                    (currentUser?.role || 'Guest') === r
                      ? isLightMode 
                        ? 'bg-slate-900 text-white font-bold' 
                        : 'bg-[#0051c3] text-white font-bold'
                      : isLightMode 
                        ? 'text-slate-700 hover:bg-slate-100' 
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons Group with Cloudflare Clean Style */}
          <div className={`flex items-center p-1 rounded-full border ${
            isLightMode 
              ? 'border-slate-200 bg-slate-100' 
              : 'border-zinc-800 bg-zinc-950'
          }`}>
            {[
              { id: 'work-orders', icon: 'assignment', labelFr: 'Tickets', labelEn: 'Tickets', title: 'Gestion des Tickets et Ordres de travail GMAO' },
              { id: 'team-ops', icon: 'group', labelFr: 'Intervenants', labelEn: 'Operators', title: 'Gestion des Intervenants et Techniciens' },
              { id: 'spaces', icon: 'domain', labelFr: 'Sites', labelEn: 'Sites', title: 'Gestion des Sites, Bâtiments et Adresses', hiddenSm: true },
              { id: 'system-config', icon: 'settings', labelFr: 'Config Super Admin', labelEn: 'Super Admin', title: 'Configuration Super Admin Master' },
              { id: 'mission-control', lucideIcon: LayoutDashboard, labelFr: 'Cockpit', labelEn: 'Cockpit', title: 'Hyperviseur Mission Control', hiddenXl: true },
              { id: 'god-mode', lucideIcon: Box, labelFr: 'God-Mode', labelEn: 'God-Mode', title: 'God-Mode Spatial Matrix', hidden2Xl: true },
            ]
            .filter(btn => isPremium || FREE_TIER_PAGES.includes(btn.id))
            .map((btn) => {
              const isActive = currentPage === btn.id;
              const LucideIcon = btn.lucideIcon;
              return (
                <button
                  key={btn.id}
                  onClick={() => onNavigate(btn.id as NavigationPage)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${btn.hidden2Xl ? 'hidden 2xl:flex' : btn.hiddenXl ? 'hidden xl:flex' : btn.hiddenSm ? 'hidden sm:flex' : ''} ${
                    isActive
                      ? isLightMode 
                        ? 'bg-slate-900 text-white shadow-sm font-semibold' 
                        : 'bg-[#0051c3] text-white font-semibold shadow-none'
                      : isLightMode 
                        ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/70 border border-transparent' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                  }`}
                  title={btn.title}
                >
                  {LucideIcon ? (
                    <LucideIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : (isLightMode ? 'text-slate-600' : 'text-zinc-400')}`} />
                  ) : (
                    <span className={`material-symbols-outlined text-[14px] ${isActive ? 'text-white' : (isLightMode ? 'text-slate-600' : 'text-zinc-400')}`}>
                      {btn.icon}
                    </span>
                  )}
                  <span>{lang === 'fr' ? btn.labelFr : btn.labelEn}</span>
                </button>
              );
            })}
          </div>

        {/* Database Sync Status */}
        <div className="hidden lg:block">
          <OfflineCacheStatus lang={lang} isLightMode={isLightMode} />
        </div>
        </div>

        {/* --- DROITE : UTILS & STATUS --- */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Download App QR Button */}
          <button 
            onClick={() => setShowDownloadModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isLightMode 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white'
            }`}
            title="Afficher le QR Code pour installer ou télécharger l'application"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'App Mobile' : 'Mobile App'}</span>
          </button>

          {/* Site Public Button */}
          <button 
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isLightMode 
                ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
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
                : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setShowDownloadModal(true)}
            className={`p-1.5 rounded-full border ${isLightMode ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
            title="QR Code App"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleLightMode}
            className={`p-1.5 rounded-full border ${isLightMode ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-zinc-800 bg-zinc-900 text-zinc-300'}`}
          >
            {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded-full border ${isLightMode ? 'border-slate-300 bg-slate-100 text-slate-800' : 'border-zinc-800 bg-zinc-900 text-zinc-300'}`}
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
          isLightMode ? 'bg-white border-slate-200 text-slate-900 shadow-lg' : 'border-zinc-800 bg-black text-white'
        }`}>
          {/* Dashboard Switch inside mobile menu */}
          <div className={`flex gap-2 p-1 rounded-xl border text-[10px] font-mono ${
            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <button
              onClick={() => onChangeDashboardMode('cafm')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                dashboardMode === 'cafm' 
                  ? isLightMode ? 'bg-white text-slate-900 font-bold shadow-sm' : 'bg-[#0051c3] text-white font-bold' 
                  : isLightMode ? 'text-slate-600' : 'text-zinc-400'
              }`}
            >
              CAFM GMAO
            </button>
            <button
              onClick={() => onChangeDashboardMode('web3')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                dashboardMode === 'web3' 
                  ? isLightMode ? 'bg-white text-slate-900 font-bold shadow-sm' : 'bg-[#0051c3] text-white font-bold' 
                  : isLightMode ? 'text-slate-600' : 'text-zinc-400'
              }`}
            >
              WEB3 & DEFI
            </button>
          </div>

          <div className="space-y-3">
            {activeGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className={`text-[9px] font-mono font-bold uppercase px-2 ${
                  isLightMode ? 'text-slate-500' : 'text-zinc-500'
                }`}>
                  {group.title}
                </div>
                {group.items.map((item: any) => {
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
                            ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300' 
                            : 'bg-zinc-900 text-white font-bold border border-zinc-700'
                          : isLightMode 
                            ? 'text-slate-700 hover:bg-slate-100' 
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xs ${isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : (isLightMode ? 'text-slate-500' : 'text-zinc-500')}`}>{item.icon}</span>
                      <span className={isActive ? (isLightMode ? 'text-slate-900 font-bold' : 'text-white font-bold') : (isLightMode ? 'text-slate-800' : 'text-zinc-400')}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className={`h-[1px] my-2 ${isLightMode ? 'bg-slate-200' : 'bg-zinc-800'}`} />
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 ${
              isLightMode ? 'text-slate-700 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-xs ${isLightMode ? 'text-slate-600' : 'text-zinc-400'}`}>arrow_back</span>
            {lang === 'fr' ? 'Retour au site public' : 'Back to Public Site'}
          </button>
        </div>
      )}

      {/* Main Content Workspace Container (Pristine Canvas) */}
      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 py-4 flex gap-3 lg:gap-4">
        
        {/* Left Side: Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-14' : 'w-56'} hidden lg:block shrink-0 transition-all duration-200 space-y-3`}>
          
          {/* Collapse/Expand Toggle Button & CAFM Mode */}
          <div className="flex items-center justify-between gap-1.5">
            {!isSidebarCollapsed && (
              <div className={`flex-1 p-0.5 rounded-lg border flex gap-1 text-[10px] font-mono ${
                isLightMode 
                  ? 'bg-slate-100 border-slate-300' 
                  : 'bg-zinc-950 border-zinc-800'
              }`}>
                <button
                  onClick={() => onChangeDashboardMode('cafm')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center transition-all ${
                    dashboardMode === 'cafm' 
                      ? isLightMode 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-300' 
                        : 'bg-[#0051c3] text-white' 
                      : isLightMode 
                        ? 'text-slate-600 hover:text-slate-900' 
                        : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  CAFM
                </button>
                <button
                  onClick={() => onChangeDashboardMode('web3')}
                  className={`flex-1 py-1 rounded-md font-semibold text-center transition-all ${
                    dashboardMode === 'web3' 
                      ? isLightMode 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-300' 
                        : 'bg-[#0051c3] text-white' 
                      : isLightMode 
                        ? 'text-slate-600 hover:text-slate-900' 
                        : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  WEB3
                </button>
              </div>
            )}
            
            {/* Collapse Toggle Button */}
            <button
              id="btn-collapse-sidebar-toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1 rounded-lg border transition-all flex items-center justify-center font-mono ${
                isLightMode 
                  ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900' 
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
              } ${isSidebarCollapsed ? 'w-full shadow-sm py-1.5' : ''}`}
              title={isSidebarCollapsed ? (lang === 'fr' ? 'Agrandir la barre latérale' : 'Expand sidebar') : (lang === 'fr' ? 'Réduire la barre latérale' : 'Collapse sidebar')}
              aria-label="Toggle sidebar width"
            >
              <span className={`material-symbols-outlined text-[16px] ${isLightMode ? 'text-slate-700' : 'text-zinc-300'}`}>
                {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
              {!isSidebarCollapsed && (
                <span className={`text-[10px] font-medium ml-1 hidden xl:inline ${isLightMode ? 'text-slate-700' : 'text-zinc-400'}`}>
                  {lang === 'fr' ? 'Réduire' : 'Collapse'}
                </span>
              )}
            </button>
          </div>

          {/* Render Groups and Items */}
          <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1 no-scrollbar">
            {activeGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-0.5">
                {!isSidebarCollapsed && (
                  <h3 className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 ${
                    isLightMode ? 'text-slate-500' : 'text-zinc-500'
                  }`}>
                    {group.title}
                  </h3>
                )}
                <nav className="space-y-0.5" aria-label="Sidebar Navigation">
                  {group.items.map((item: any) => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        title={item.label}
                        className={`w-full flex items-center gap-2 rounded-lg font-mono text-xs transition-all ${
                          isSidebarCollapsed 
                            ? 'justify-center p-2' 
                            : 'px-2.5 py-1.5'
                        } ${
                          isActive
                            ? isLightMode 
                              ? 'bg-slate-100 border border-slate-300 text-slate-900 font-semibold shadow-sm' 
                              : 'bg-zinc-900 border border-zinc-700 text-white font-semibold'
                            : isLightMode 
                              ? 'bg-transparent border border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-100' 
                              : 'bg-transparent border border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[15px] leading-none shrink-0 ${
                          isActive 
                            ? (isLightMode ? 'text-slate-900' : 'text-white') 
                            : (isLightMode ? 'text-slate-500' : 'text-zinc-400')
                        }`}>
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && (
                          <span className={`truncate text-left text-xs ${
                            isActive 
                              ? (isLightMode ? 'text-slate-950 font-semibold' : 'text-white font-semibold') 
                              : (isLightMode ? 'text-slate-700' : 'text-zinc-400')
                          }`}>
                            {item.label}
                          </span>
                        )}
                        {!isSidebarCollapsed && item.isLocked && (
                          <span className={`ml-auto material-symbols-outlined text-[14px] ${isLightMode ? 'text-amber-500' : 'text-amber-500'}`}>
                            lock
                          </span>
                        )}
                        {!isSidebarCollapsed && isActive && !item.isLocked && (
                          <span className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${
                            isLightMode ? 'bg-slate-900' : 'bg-white'
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
          <div className={`pt-2 border-t text-center space-y-1 ${isLightMode ? 'border-slate-200' : 'border-zinc-800'}`}>
            {!isSidebarCollapsed ? (
              <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${
                isLightMode 
                  ? 'text-slate-700 bg-slate-100 border-slate-300' 
                  : 'text-zinc-400 bg-zinc-950 border-zinc-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Edge CDG1 Paris
              </span>
            ) : (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className={`w-full flex justify-center p-1 ${isLightMode ? 'text-slate-700 hover:text-slate-950' : 'text-zinc-400 hover:text-white'}`}
                title="Agrandir la barre"
              >
                <span className="material-symbols-outlined text-[15px]">dock_to_right</span>
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
      <footer className={`border-t py-4 mt-8 transition-colors text-center text-[10px] font-mono ${
        isLightMode ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-zinc-900 bg-black text-zinc-500'
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
