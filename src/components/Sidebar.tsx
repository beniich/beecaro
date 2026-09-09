import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Wrench, 
  Cpu, 
  Leaf, 
  FileText, 
  QrCode, 
  Radio,
  Bot, 
  Settings,
  Activity,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind,
  Lightbulb,
  Globe,
  Boxes,
  Building2,
  CreditCard
} from 'lucide-react';
import { BeeLogo } from './BeeLogo';
import { ThemeToggle } from './ThemeToggle';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  openQrScanner: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  lang?: 'fr' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  openQrScanner,
  isMobileOpen = false,
  onCloseMobile,
  lang = 'fr'
}) => {
  const navSections = [
    {
      title: lang === 'fr' ? '1. OPÉRATIONS & FLUIDES' : '1. SMART UTILITIES & BMS',
      items: [
        { id: 'overview' as NavigationTab, label: lang === 'fr' ? 'Vue d\'ensemble & Pilotage' : 'Overview & Cockpit', icon: LayoutDashboard, badge: 'Live' },
        { id: 'lighting' as NavigationTab, label: lang === 'fr' ? 'Énergie & Éclairage' : 'Energy & Lighting', icon: Lightbulb },
        { id: 'water-sync' as NavigationTab, label: lang === 'fr' ? 'Eau & HydroSync' : 'Water HydroSync', icon: Droplets, badge: 'Alert' },
      ]
    },
    {
      title: lang === 'fr' ? '2. GMAO & GESTION TECHNIQUE' : '2. ASSET LIFECYCLE & CMMS',
      items: [
        { id: 'assets' as NavigationTab, label: lang === 'fr' ? 'Équipements & Parc EAM' : 'Asset Topology & EAM', icon: Cpu },
        { id: 'cmms' as NavigationTab, label: lang === 'fr' ? 'Ordres de Travail (GMAO)' : 'CMMS & Work Orders', icon: Wrench, badge: '4 Act' },
        { id: 'predictive' as NavigationTab, label: lang === 'fr' ? 'Maintenance Prédictive' : 'Predictive AI', icon: Activity, badge: 'IA' },
        { id: 'spaces' as NavigationTab, label: lang === 'fr' ? 'Espaces & Occupation' : 'Spaces & Desks', icon: Building2 },
        { id: 'inventory' as NavigationTab, label: lang === 'fr' ? 'Stocks & Pièces de Rechange' : 'Spare Parts', icon: Boxes },
      ]
    },
    {
      title: lang === 'fr' ? '3. STRATÉGIE CLIMAT & ESG' : '3. CLIMATE STRATEGY & ESG',
      items: [
        { id: 'esg-sustainability' as NavigationTab, label: lang === 'fr' ? 'Bilan Carbone Scopes 1-3' : 'ESG & Carbon CSRD', icon: Leaf, badge: '-19.6%' },
        { id: 'carbon-market' as NavigationTab, label: lang === 'fr' ? 'Marché des Crédits' : 'Carbon Market', icon: Globe },
        { id: 'air-quality' as NavigationTab, label: lang === 'fr' ? 'Qualité de l\'Air (QAI)' : 'Air Quality AQI', icon: Wind },
        { id: 'ai-assistant' as NavigationTab, label: lang === 'fr' ? 'Copilote IA Optimisation' : 'ESG AI Copilot', icon: Bot, badge: 'Smart' },
      ]
    },
    {
      title: lang === 'fr' ? '4. JUMEAU NUMÉRIQUE & BIM' : '4. DIGITAL TWIN & SPATIAL',
      items: [
        { id: 'digital-twin' as NavigationTab, label: lang === 'fr' ? 'Jumeau 3D & Visionneuse BIM' : '3D Twin & BIM IFC', icon: Layers, badge: '3D' },
      ]
    },
    {
      title: lang === 'fr' ? '5. CONNECTIVITÉ & GOUVERNANCE' : '5. CONNECTIVITY & GOVERNANCE',
      items: [
        { id: 'leases' as NavigationTab, label: lang === 'fr' ? 'Baux & Gestion Locataires' : 'Tenants & Leases', icon: FileText },
        { id: 'pricing' as NavigationTab, label: lang === 'fr' ? 'Offres SaaS & ROI' : 'Pricing & ROI', icon: CreditCard },
        { id: 'settings' as NavigationTab, label: lang === 'fr' ? 'Configuration & Zero-Trust' : 'Settings & Master Config', icon: Settings },
      ]
    }
  ];

  const handleItemClick = (tabId: NavigationTab) => {
    onTabChange(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-white dark:bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white dark:bg-slate-950/95 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-300 backdrop-blur-xl ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 flex-shrink-0">
          <div
            className="flex items-center overflow-hidden cursor-pointer"
            onClick={() => handleItemClick('overview')}
          >
            <BeeLogo size="sm" showText={!collapsed || isMobileOpen} tagline="CAFM & Operations" />
          </div>

          {/* Close button on mobile */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Launch NFC / QR Button */}
        <div className="p-2.5 pb-1 flex-shrink-0 space-y-1">
          <button
            id="btn-quick-qr-scan"
            onClick={() => {
              openQrScanner();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-center space-x-2 py-1.5 px-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-semibold tracking-wide uppercase ${
              collapsed && !isMobileOpen ? 'px-0' : ''
            }`}
            title={lang === 'fr' ? 'Scanner Tag NFC / QR Équipement' : 'Scan Physical Asset NFC / QR Tag'}
          >
            <Radio className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0 animate-pulse" />
            {(!collapsed || isMobileOpen) && (
              <span>{lang === 'fr' ? 'Scan NFC / QR' : 'NFC & QR Scan'}</span>
            )}
          </button>

          <button
            id="btn-beecarbonat-ext"
            onClick={() => handleItemClick('traffic-hub')}
            className={`w-full flex items-center justify-center space-x-2 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-xs font-mono font-medium tracking-wider uppercase ${
              collapsed && !isMobileOpen ? 'px-0' : ''
            }`}
            title="BeeCarbonat Suite"
          >
            <Zap className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            {(!collapsed || isMobileOpen) && (
              <span className="flex items-center gap-1.5">
                BeeCarbonat 
                <span className="text-[9px] bg-blue-500/20 text-blue-500 dark:text-blue-400 px-1 py-0.5 rounded leading-none">BETA</span>
              </span>
            )}
          </button>

          {/* TELEMETRY INTERFACE */}
          <div className={`p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center gap-2 transition-all ${
            collapsed && !isMobileOpen ? 'justify-center' : ''
          }`}>
            <div className="relative flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[9px] font-mono font-bold text-slate-800 dark:text-zinc-300 tracking-wider uppercase">
                    CORE LINK
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <span className="text-[8px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                  100% ONLINE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List with sections */}
        <nav className="flex-1 px-2.5 py-1.5 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-0.5">
              <div
                className={`px-2 pb-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 ${
                  collapsed && !isMobileOpen ? 'text-center' : ''
                }`}
              >
                {collapsed && !isMobileOpen ? '••' : sec.title}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-transparent'
                    }`}
                    title={item.label}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Icon
                        className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                          isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      />
                      {(!collapsed || isMobileOpen) && <span className="truncate text-xs">{item.label}</span>}
                    </div>
                    {(!collapsed || isMobileOpen) && item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Theme Toggle */}
        {(!collapsed || isMobileOpen) && (
          <div className="p-2 border-t border-slate-200 dark:border-zinc-800 flex justify-center bg-slate-50 dark:bg-zinc-950">
            <ThemeToggle />
          </div>
        )}
        {/* Collapse Toggle & User Info */}
        <div className="p-2.5 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-zinc-950">
          {(!collapsed || isMobileOpen) ? (
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold text-xs">
                SF
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {lang === 'fr' ? 'SpaceFlow Admin' : 'SpaceFlow Admin'}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 truncate">
                  {lang === 'fr' ? 'GMAO & Smart Building' : 'CAFM & Digital Twin'}
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold text-xs">
              SF
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded-lg text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors ml-auto"
            title={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
