import React from 'react';
import { NavigationPage } from '../types/bizos';

interface FloatingSidebarProps {
  currentPage: NavigationPage | string;
  onNavigate: (page: NavigationPage | string) => void;
  lang: 'fr' | 'en';
}

export const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  currentPage,
  onNavigate,
  lang,
}) => {
  const menuCategories = [
    {
      title: lang === 'fr' ? 'CYBER COCKPITS (VARIANTS 1-10)' : 'CYBER COCKPITS (VARIANTS 1-10)',
      items: [
        { id: 'threat-matrix', label: 'V1. Security Threat Matrix', icon: 'security' },
        { id: 'neural-engine', label: 'V2. Neural Engine Architect', icon: 'hub' },
        { id: 'energy-nexus', label: 'V3. Global Energy Nexus', icon: 'bolt' },
        { id: 'fleet-command', label: 'V4. Global Fleet Command', icon: 'radar' },
        { id: 'database-monitor', label: 'V5. Database & Cache', icon: 'database' },
        { id: 'predictive-core', label: 'V6. Predictive Core Analysis', icon: 'speed' },
        { id: 'traffic-hub', label: 'V8. API Gateway Traffic Hub', icon: 'alt_route' },
        { id: 'cloud-pulse', label: 'V9. Multi-Cloud Infrastructure', icon: 'cloud' },
        { id: 'audit-vault', label: 'V10. Immutable Audit Vault', icon: 'verified_user' },
      ],
    },
    {
      title: lang === 'fr' ? 'BEE OS' : 'BEE OS',
      items: [
        { id: 'home', label: lang === 'fr' ? 'Accueil' : 'Home', icon: 'home' },
        { id: 'features', label: lang === 'fr' ? 'Fonctionnalités' : 'Features', icon: 'auto_awesome' },
        { id: 'solutions-vitalai', label: lang === 'fr' ? 'Solutions & IA' : 'Solutions & AI', icon: 'psychology' },
        { id: 'integrations', label: lang === 'fr' ? 'Intégrations' : 'Integrations', icon: 'hub' },
        { id: 'pricing', label: lang === 'fr' ? 'Tarifs' : 'Pricing', icon: 'sell' },
        { id: 'beecarbonat-pub', label: lang === 'fr' ? 'Pub & Panier' : 'Ad Studio & Cart', icon: 'campaign' },
      ],
    },
    {
      title: lang === 'fr' ? 'OPÉRATIONS & MAINTENANCE' : 'OPERATIONS & MAINTENANCE',
      items: [
        { id: 'workspace', label: lang === 'fr' ? 'Tableau de bord' : 'Executive Cockpit', icon: 'dashboard' },
        { id: 'lighting', label: 'Lighting - City Pulse', icon: 'lightbulb' },
        { id: 'water', label: 'Water - Hydro Sync', icon: 'water_drop' },
        { id: 'waste', label: 'Waste - Circular Flow', icon: 'recycling' },
        { id: 'assets', label: lang === 'fr' ? 'Équipements (Assets)' : 'Assets Registry', icon: 'inventory_2' },
        { id: 'scanner', label: 'QR Code Scanner', icon: 'qr_code_scanner' },
        { id: 'spaces', label: lang === 'fr' ? 'Espaces & Occupation' : 'Spaces & Occupancy', icon: 'domain' },
        { id: 'work-orders', label: lang === 'fr' ? 'Ordres de Travail' : 'Work Orders', icon: 'assignment' },
        { id: 'maintenance', label: 'Maintenance', icon: 'build' },
      ],
    },
    {
      title: lang === 'fr' ? 'CLIMAT & ESG STRATÉGIQUE' : 'CLIMATE & ESG',
      items: [
        { id: 'market', label: 'Carbon Credits', icon: 'public' },
        { id: 'air-quality', label: 'Air Quality & AQI', icon: 'air' },
        { id: 'impact', label: 'Impact Report', icon: 'nature_people' },
      ],
    },
  ];

  return (
    <aside className="fixed left-3 top-20 bottom-4 w-60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg flex flex-col overflow-hidden z-40 transition-all">
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-3 px-2.5 space-y-4">
        {menuCategories.map((category, idx) => (
          <div key={idx}>
            <h3 className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 font-bold tracking-widest uppercase mb-1.5 pl-1.5">
              {category.title}
            </h3>
            <ul className="space-y-0.5">
              {category.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id as any)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                      <span className="truncate text-xs">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      {/* Bottom Floating Telemetry */}
      <div className="p-2.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
              {lang === 'fr' ? 'En Ligne' : 'Online'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">{lang === 'fr' ? 'SYNCHRONISÉ' : 'SYNCHRONIZED'}</span>
        </div>
      </div>
      
      {/* Custom Scrollbar CSS embedded */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
        }
      `}</style>
    </aside>
  );
};
