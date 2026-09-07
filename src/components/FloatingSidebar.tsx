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
    <aside className="fixed left-4 top-24 bottom-6 w-64 bg-[#130f22]/70 backdrop-blur-2xl border border-[#ff9d2b]/20 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,157,43,0.1)] flex flex-col overflow-hidden z-40 transition-all hover:border-[#ff9d2b]/40 hover:bg-[#130f22]/85">
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-4 space-y-8">
        {menuCategories.map((category, idx) => (
          <div key={idx}>
            <h3 className="text-[10px] font-mono text-[#ff9d2b]/70 font-bold tracking-widest uppercase mb-3 pl-2">
              {category.title}
            </h3>
            <ul className="space-y-1">
              {category.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-sm font-medium ${
                        isActive
                          ? 'bg-[#ff9d2b]/15 text-[#ffc06e] border border-[#ff9d2b]/40 shadow-[inset_0_0_15px_rgba(255,157,43,0.15)]'
                          : 'text-[#cdc3d0] hover:text-[#fff] hover:bg-[#251d38]/50 border border-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      
      {/* Bottom Floating Telemetry */}
      <div className="p-4 border-t border-[#ff9d2b]/20 bg-[#0d0a17]/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-[#34d399] uppercase tracking-wider">
              {lang === 'fr' ? 'En Ligne' : 'Online'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#cdc3d0]">{lang === 'fr' ? 'SYSTÈME SYNCHRO' : 'SYSTEM SYNCHRONIZED'}</span>
        </div>
      </div>
      
      {/* Custom Scrollbar CSS embedded */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 157, 43, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 157, 43, 0.4);
        }
      `}</style>
    </aside>
  );
};
