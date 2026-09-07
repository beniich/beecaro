import React, { useState, useRef, useEffect } from 'react';
import { NavigationPage, BiometricState, UserSession } from '../types/bizos';
import { BeeLogo } from './BeeLogo';
import logoImage from '../assets/images/beecarbonat_logo_1787760318477.jpg';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';
import { OfflineCacheStatus } from './OfflineCacheStatus';

import { PWAInstallButton } from './PWAInstallButton';
interface HeaderProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  biometrics: BiometricState;
  onOpenLogin: () => void;
  onOpenTrial: () => void;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  lang: 'fr' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  biometrics,
  onOpenLogin,
  onOpenTrial,
  currentUser,
  onLogout,
  onOpenCart,
  cartCount = 0,
  lang,
  onToggleLang
}) => {
  const { user: firebaseUser, profile: firebaseProfile, signOut: firebaseSignOut, customDomain } = useAuth();
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [cyberOpen, setCyberOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cyberDropdownRef = useRef<HTMLDivElement>(null);

  // Active user can be either Firebase user or local demo user
  const activeUser = firebaseUser ? {
    name: firebaseProfile?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    role: firebaseProfile?.role || 'user',
    photoURL: firebaseUser.photoURL || undefined
  } : currentUser;

  const handleLogout = async () => {
    if (firebaseUser) {
      await firebaseSignOut();
    }
    if (onLogout) {
      onLogout();
    }
  };

  const isSolutionsActive = currentPage.startsWith('solutions');
  const isCyberActive = [
    'threat-matrix', 'neural-engine', 'energy-nexus', 'fleet-command', 'database-monitor',
    'predictive-core', 'traffic-hub', 'cloud-pulse', 'audit-vault', 'mission-control', 'god-mode'
  ].includes(currentPage);
  const isOpsActive = [
    'work-orders', 'team-ops', 'spaces', 'system-config', 'workspace', 'maintenance', 'assets'
  ].includes(currentPage);
  const [opsOpen, setOpsOpen] = useState(false);
  const opsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
      if (cyberDropdownRef.current && !cyberDropdownRef.current.contains(event.target as Node)) {
        setCyberOpen(false);
      }
      if (opsDropdownRef.current && !opsDropdownRef.current.contains(event.target as Node)) {
        setOpsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-zinc-950/98 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      {/* GAUCHE : LOGO & MENU */}
      <div className="flex items-center gap-8">
        <div 
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer select-none group"
          title="BeeCarbonIt - Autonomous CAFM & ESG Platform"
        >
          <img 
            src={logoImage} 
            alt="Logo" 
            className="h-8 w-8 rounded-md object-contain border border-slate-800 group-hover:border-[#ff9a00]/50 transition-colors" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* MENU DÉROULANT */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          
          {/* Menu GMAO & Opérations (Tickets, Intervenants, Sites, Super Admin) */}
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors" ref={opsDropdownRef}>
            <button 
              onClick={() => setOpsOpen(!opsOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                isOpsActive || opsOpen 
                  ? 'text-black bg-[#ff9a00] border-[#ff9a00] font-bold shadow-[0_0_12px_rgba(255,154,0,0.4)]' 
                  : 'text-[#ff9a00] bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">build_circle</span>
              <span>{lang === 'fr' ? 'GMAO & Opérations' : 'CMMS & Ops'}</span>
              <span className={`material-symbols-outlined text-[16px] transition-transform ${opsOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* GMAO & Ops Floating Popover Menu */}
            {opsOpen && (
              <div className="absolute top-full left-0 mt-3 w-80 bg-zinc-950/98 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#ff9a00] font-bold border-b border-slate-800 mb-2 flex items-center justify-between">
                  <span>GMAO & Gestion Opérationnelle</span>
                  <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-mono">Live Sync</span>
                </div>
                {[
                  { id: 'work-orders', icon: 'assignment', title: lang === 'fr' ? 'Gestion des Tickets (GMAO)' : 'Work Orders & Tickets', desc: lang === 'fr' ? 'Ordres de travail, priorités & SLA' : 'Work orders, priority & SLA tracking' },
                  { id: 'team-ops', icon: 'group', title: lang === 'fr' ? 'Gestion des Intervenants & Agents' : 'Field Operators & Technicians', desc: lang === 'fr' ? 'Techniciens terrain, compétences & charge' : 'Technicians, load score & dispatch' },
                  { id: 'spaces', icon: 'domain', title: lang === 'fr' ? 'Gestion des Sites & Adresses' : 'Sites & Addresses Manager', desc: lang === 'fr' ? 'Bâtiments, accès, étages & surfaces' : 'Buildings, address, floors & zones' },
                  { id: 'system-config', icon: 'settings', title: lang === 'fr' ? 'Configuration Super Admin' : 'Super Admin Master Config', desc: lang === 'fr' ? 'Gestion globale des sites & intervenants' : 'Global management of sites & operators' },
                  { id: 'workspace', icon: 'grid_view', title: lang === 'fr' ? 'Cockpit CAFM Global' : 'CAFM Global Cockpit', desc: lang === 'fr' ? 'Pilotage technique et multi-sites' : 'Technical and multi-facility cockpit' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id as NavigationPage);
                      setOpsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900/90 hover:border-slate-800 border border-transparent transition-all flex items-start gap-3 group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover/item:text-[#ff9a00] group-hover/item:border-[#ff9a00]/50 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover/item:text-[#ff9a00]">{item.title}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('features')}
            className={`hover:text-white transition-colors ${currentPage === 'features' ? 'text-[#ff9a00] font-bold' : ''}`}
          >
            {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
          </button>

          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors" ref={dropdownRef}>
            <button 
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className={`flex items-center gap-1 ${isSolutionsActive || solutionsOpen ? 'text-[#ff9a00] font-bold' : ''}`}
            >
              <span>{lang === 'fr' ? 'Solutions' : 'Solutions'}</span>
              <span className={`material-symbols-outlined text-[18px] transition-transform ${solutionsOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Solutions Floating Popover Menu */}
            {solutionsOpen && (
              <div className="absolute top-full left-0 mt-3 w-72 bg-zinc-950/98/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800 mb-2">
                  Suites .bee
                </div>
                {[
                  { id: 'solutions-vitalai', icon: 'vital_signs', title: 'VitalAI OS', desc: 'Charge cognitive & bio-sync' },
                  { id: 'solutions-inboxai', icon: 'mail', title: 'InboxAI', desc: 'Tri sémantique email' },
                  { id: 'solutions-meetai', icon: 'record_voice_over', title: 'MeetAI', desc: 'Transcription & notes' },
                  { id: 'solutions-callcopilot', icon: 'podcasts', title: 'CallCopilot', desc: 'Support vocal temps réel' }
                ].map(sol => (
                  <button
                    key={sol.id}
                    onClick={() => {
                      onNavigate(sol.id as NavigationPage);
                      setSolutionsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900/80 hover:border-slate-800 border border-transparent transition-all flex items-start gap-3 group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-950/98 border border-slate-800 flex items-center justify-center text-slate-400 group-hover/item:text-[#ff9a00] group-hover/item:border-[#ff9a00]/50 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{sol.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover/item:text-[#ff9a00]">{sol.title}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{sol.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors" ref={cyberDropdownRef}>
            <button 
              onClick={() => setCyberOpen(!cyberOpen)}
              className={`flex items-center gap-1 ${isCyberActive || cyberOpen ? 'text-[#ff9a00] font-bold' : ''}`}
            >
              <span>Cockpits</span>
              <span className={`material-symbols-outlined text-[18px] transition-transform ${cyberOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Cyber Cockpits Floating Popover Menu */}
            {cyberOpen && (
              <div className="absolute top-full left-0 mt-3 w-80 max-h-[75vh] overflow-y-auto bg-zinc-950/98/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-slate-700">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800 mb-2">
                  10 Modules Cyber
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'threat-matrix', num: 'V1', title: 'Security Threat Matrix' },
                    { id: 'neural-engine', num: 'V2', title: 'Neural Engine Architect' },
                    { id: 'energy-nexus', num: 'V3', title: 'Global Energy Nexus' },
                    { id: 'fleet-command', num: 'V4', title: 'Global Fleet Command' },
                    { id: 'database-monitor', num: 'V5', title: 'Database & Cache' },
                    { id: 'predictive-core', num: 'V6', title: 'Predictive Core Analysis' },
                    { id: 'traffic-hub', num: 'V8', title: 'API Gateway Traffic Hub' },
                    { id: 'cloud-pulse', num: 'V9', title: 'Multi-Cloud Infra' },
                    { id: 'audit-vault', num: 'V10', title: 'Immutable Audit Vault' },
                    { id: 'god-mode', num: '3D', title: 'God-Mode System View' },
                  ].map((cp) => (
                    <button
                      key={cp.id}
                      onClick={() => {
                        onNavigate(cp.id as NavigationPage);
                        setCyberOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-900 border border-transparent transition-all flex items-center gap-3 group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-950/98 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400 group-hover/item:text-[#ff9a00] group-hover/item:border-[#ff9a00]/50 shrink-0">
                        {cp.num}
                      </div>
                      <div className="flex-1 text-xs font-bold text-slate-300 group-hover/item:text-white">
                        {cp.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('integrations')}
            className={`hover:text-white transition-colors ${currentPage === 'integrations' ? 'text-[#ff9a00] font-bold' : ''}`}
          >
            {lang === 'fr' ? 'Intégrations' : 'Integrations'}
          </button>
          
          <button 
            onClick={() => onNavigate('pricing')}
            className={`hover:text-white transition-colors ${currentPage === 'pricing' ? 'text-[#ff9a00] font-bold' : ''}`}
          >
            {lang === 'fr' ? 'Tarifs' : 'Pricing'}
          </button>
        </div>
      </div>

      {/* DROITE : ACTIONS & STATUS */}
      <div className="flex items-center gap-4">
        
        <div className="hidden sm:block">
          <PWAInstallButton lang={lang} />
        </div>

        {/* PANIER ICON */}
        <button 
          onClick={onOpenCart || (() => onNavigate('beecarbonat-pub'))}
          className="relative p-2 rounded-full bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors"
          title="Panier d'achats"
        >
          <span className="material-symbols-outlined text-[20px] text-white">shopping_bag</span>
          <span className="absolute -top-1 -right-1 bg-[#ff9a00] text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_8px_rgba(255,85,0,0.5)]">
            {cartCount > 0 ? cartCount : 2}
          </span>
        </button>

        {/* STATUS TECH (HRV) */}
        <div 
          onClick={() => onNavigate('solutions-vitalai')}
          className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono cursor-pointer hover:bg-slate-800 transition-colors"
          title="Vital AI Biometrics"
        >
          <div className="flex flex-col">
            <span className="text-slate-500">HRV: <span className="text-orange-400">{biometrics?.hrvBaseline || 42}ms</span></span>
            <span className="text-slate-500">Recovery: <span className="text-emerald-400">{biometrics?.recoveryScore || 38}%</span></span>
          </div>
        </div>

        {/* USER PROFILE & LANG */}
        <div className="flex items-center gap-3 pl-1">
          {activeUser ? (
            <div className="flex items-center gap-2">
              <div 
                onClick={() => onNavigate('workspace')}
                className="relative w-8 h-8 rounded-full bg-[#ff9a00] border-2 border-slate-800 overflow-hidden cursor-pointer flex items-center justify-center text-black font-black text-xs shadow-[0_0_8px_rgba(255,85,0,0.5)]"
                title={`${activeUser.name || activeUser.email} ${firebaseProfile?.isVerified ? '(Compte Vérifié)' : '(Non Vérifié)'}`}
              >
                {activeUser.photoURL ? (
                  <img src={activeUser.photoURL} alt={activeUser.name} className="w-full h-full object-cover" />
                ) : (
                  (activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'A')
                )}

                {/* Verification indicator */}
                {firebaseProfile?.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-black flex items-center justify-center text-[8px] text-white">
                    ✓
                  </div>
                )}
              </div>

              {!firebaseProfile?.isVerified && firebaseUser && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-500/25 transition-all"
                  title="Valider votre compte BizOS"
                >
                  <span>Vérifier</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-1 rounded-full text-slate-600 hover:text-red-500 transition-colors hidden sm:block"
                title="Déconnexion"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
              title="Connexion"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          )}

          <button
            onClick={onToggleLang}
            className="hidden sm:block text-[11px] font-mono font-bold text-slate-500 hover:text-white transition-colors"
            title="Changer de langue"
          >
            {lang.toUpperCase()}
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-b border-slate-800 bg-zinc-950/98 backdrop-blur-2xl px-5 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
          
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-2">
            <div className="text-[10px] font-mono font-bold uppercase text-[#ff9a00] px-2 mb-1">
              {lang === 'fr' ? 'Modules Opérationnels & GMAO' : 'CMMS & Operations'}
            </div>
            <div className="grid grid-cols-1 gap-1">
              <button 
                onClick={() => { onNavigate('work-orders'); setMobileMenuOpen(false); }} 
                className="text-left px-3 py-2 rounded-lg bg-zinc-900/80 hover:bg-[#ff9a00] hover:text-black text-amber-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">assignment</span>
                {lang === 'fr' ? '🎫 Gestion des Tickets (GMAO)' : '🎫 Tickets & Work Orders'}
              </button>
              <button 
                onClick={() => { onNavigate('team-ops'); setMobileMenuOpen(false); }} 
                className="text-left px-3 py-2 rounded-lg bg-zinc-900/80 hover:bg-[#ff9a00] hover:text-black text-orange-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                {lang === 'fr' ? '👷 Gestion des Intervenants & Agents' : '👷 Field Operators & Teams'}
              </button>
              <button 
                onClick={() => { onNavigate('spaces'); setMobileMenuOpen(false); }} 
                className="text-left px-3 py-2 rounded-lg bg-zinc-900/80 hover:bg-[#ff9a00] hover:text-black text-sky-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">domain</span>
                {lang === 'fr' ? '🏢 Gestion des Sites & Adresses' : '🏢 Sites & Addresses Manager'}
              </button>
              <button 
                onClick={() => { onNavigate('system-config'); setMobileMenuOpen(false); }} 
                className="text-left px-3 py-2 rounded-lg bg-zinc-900/80 hover:bg-[#ff9a00] hover:text-black text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                {lang === 'fr' ? '⚙️ Configuration Super Admin Master' : '⚙️ Super Admin Master Config'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm font-medium">
            <button onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white">
              {lang === 'fr' ? 'Accueil' : 'Home'}
            </button>
            <button onClick={() => { onNavigate('workspace'); setMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-[#ff9a00]">
              {lang === 'fr' ? '📊 Cockpit CAFM Global' : '📊 CAFM Global Cockpit'}
            </button>
            <button onClick={() => { onNavigate('features'); setMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white">
              {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
            </button>
            <button onClick={() => { onNavigate('solutions-vitalai'); setMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white">
              Solutions & IA
            </button>
            <button onClick={() => { onNavigate('god-mode'); setMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white">
              Cockpits Cyber
            </button>
            <button onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white">
              {lang === 'fr' ? 'Tarifs' : 'Pricing'}
            </button>
          </div>

          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            {/* Action buttons removed as requested */}
          </div>
        </div>
      )}
    </nav>
  );
};
