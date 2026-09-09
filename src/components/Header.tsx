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
    <nav className="bg-zinc-950/98 border-b border-zinc-800 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 transition-all shadow-md font-sans">
      {/* GAUCHE : LOGO & MENU */}
      <div className="flex items-center gap-4 lg:gap-6">
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
            className="h-7 w-7 rounded-md object-contain border border-zinc-800 group-hover:border-zinc-600 transition-colors" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* MENU DÉROULANT */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-zinc-300">
          
          {/* Menu GMAO & Opérations (Tickets, Intervenants, Sites, Super Admin) */}
          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors" ref={opsDropdownRef}>
            <button 
              onClick={() => setOpsOpen(!opsOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs font-medium ${
                isOpsActive || opsOpen 
                  ? 'text-white bg-[#0051c3] border-[#0051c3] font-semibold' 
                  : 'text-zinc-300 bg-zinc-900 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">build_circle</span>
              <span>{lang === 'fr' ? 'GMAO & Opérations' : 'CMMS & Ops'}</span>
              <span className={`material-symbols-outlined text-[14px] transition-transform ${opsOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* GMAO & Ops Floating Popover Menu */}
            {opsOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-950 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800 mb-1 flex items-center justify-between">
                  <span>GMAO & Gestion Opérationnelle</span>
                  <span className="text-[9px] bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded font-mono">Live Sync</span>
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
                    className="w-full text-left p-2 rounded-lg hover:bg-zinc-900 border border-transparent transition-all flex items-start gap-2.5 group/item"
                  >
                    <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover/item:text-white group-hover/item:border-zinc-700 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 group-hover/item:text-white">{item.title}</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('features')}
            className={`hover:text-white transition-colors ${currentPage === 'features' ? 'text-white font-semibold' : ''}`}
          >
            {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
          </button>

          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors" ref={dropdownRef}>
            <button 
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className={`flex items-center gap-1 ${isSolutionsActive || solutionsOpen ? 'text-white font-semibold' : ''}`}
            >
              <span>{lang === 'fr' ? 'Solutions' : 'Solutions'}</span>
              <span className={`material-symbols-outlined text-[16px] transition-transform ${solutionsOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Solutions Floating Popover Menu */}
            {solutionsOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-zinc-950 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800 mb-1">
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
                    className="w-full text-left p-2 rounded-lg hover:bg-zinc-900 border border-transparent transition-all flex items-start gap-2.5 group/item"
                  >
                    <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover/item:text-white group-hover/item:border-zinc-700 transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[16px]">{sol.icon}</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200 group-hover/item:text-white">{sol.title}</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">{sol.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors" ref={cyberDropdownRef}>
            <button 
              onClick={() => setCyberOpen(!cyberOpen)}
              className={`flex items-center gap-1 ${isCyberActive || cyberOpen ? 'text-white font-semibold' : ''}`}
            >
              <span>Cockpits</span>
              <span className={`material-symbols-outlined text-[16px] transition-transform ${cyberOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* Cyber Cockpits Floating Popover Menu */}
            {cyberOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 max-h-[75vh] overflow-y-auto bg-zinc-950 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 no-scrollbar">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold border-b border-zinc-800 mb-1">
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
                      className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent transition-all flex items-center gap-2.5 group/item"
                    >
                      <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-[10px] text-zinc-400 group-hover/item:text-white shrink-0">
                        {cp.num}
                      </div>
                      <div className="flex-1 text-xs font-medium text-zinc-300 group-hover/item:text-white">
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
            className={`hover:text-white transition-colors ${currentPage === 'integrations' ? 'text-white font-semibold' : ''}`}
          >
            {lang === 'fr' ? 'Intégrations' : 'Integrations'}
          </button>
          
          <button 
            onClick={() => onNavigate('pricing')}
            className={`hover:text-white transition-colors ${currentPage === 'pricing' ? 'text-white font-semibold' : ''}`}
          >
            {lang === 'fr' ? 'Tarifs' : 'Pricing'}
          </button>
        </div>
      </div>

      {/* DROITE : ACTIONS & STATUS */}
      <div className="flex items-center gap-3">
        
        <div className="hidden sm:block">
          <PWAInstallButton lang={lang} />
        </div>

        {/* PANIER ICON */}
        <button 
          onClick={onOpenCart || (() => onNavigate('beecarbonat-pub'))}
          className="relative p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
          title="Panier d'achats"
        >
          <span className="material-symbols-outlined text-[18px] text-zinc-300">shopping_bag</span>
          <span className="absolute -top-1 -right-1 bg-[#0051c3] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {cartCount > 0 ? cartCount : 2}
          </span>
        </button>

        {/* STATUS TECH (HRV) */}
        <div 
          onClick={() => onNavigate('solutions-vitalai')}
          className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono cursor-pointer hover:border-zinc-700 transition-colors"
          title="Vital AI Biometrics"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <span>HRV: <span className="text-zinc-200 font-semibold">{biometrics?.hrvBaseline || 42}ms</span></span>
            <span className="text-zinc-700">|</span>
            <span>Rec: <span className="text-emerald-400 font-semibold">{biometrics?.recoveryScore || 38}%</span></span>
          </div>
        </div>

        {/* USER PROFILE & LANG */}
        <div className="flex items-center gap-2 pl-1">
          {activeUser ? (
            <div className="flex items-center gap-2">
              <div 
                className="relative cursor-pointer"
                onClick={() => onNavigate('workspace')}
                title={`${activeUser.name || activeUser.email} ${firebaseProfile?.isVerified ? '(Compte Vérifié)' : '(Non Vérifié)'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center text-zinc-200 font-bold text-xs">
                  {activeUser.photoURL ? (
                    <img src={activeUser.photoURL} alt={activeUser.name} className="w-full h-full object-cover" />
                  ) : (
                    (activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'A')
                  )}
                </div>

                {/* Verification indicator */}
                {firebaseProfile?.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-black flex items-center justify-center text-[7px] text-white z-10">
                    ✓
                  </div>
                )}
              </div>

              {!firebaseProfile?.isVerified && firebaseUser && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-medium hover:text-white transition-all"
                  title="Valider votre compte BeeCarbonat"
                >
                  <span>Vérifier</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-1 rounded-md text-zinc-500 hover:text-red-400 transition-colors hidden sm:block"
                title="Déconnexion"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="Connexion"
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
            </button>
          )}

          <button
            onClick={onToggleLang}
            className="hidden sm:block text-[10px] font-mono font-medium text-zinc-400 hover:text-white transition-colors"
            title="Changer de langue"
          >
            {lang.toUpperCase()}
          </button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-b border-zinc-800 bg-zinc-950 backdrop-blur-2xl px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
          
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 mb-1">
            <div className="text-[10px] font-mono font-semibold uppercase text-zinc-400 px-1 mb-1">
              {lang === 'fr' ? 'Modules Opérationnels & GMAO' : 'CMMS & Operations'}
            </div>
            <div className="grid grid-cols-1 gap-1">
              <button 
                onClick={() => { onNavigate('work-orders'); setMobileMenuOpen(false); }} 
                className="text-left px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-[#0051c3] hover:text-white text-zinc-300 text-xs font-medium flex items-center gap-2 transition-all group"
              >
                <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-white">assignment</span>
                {lang === 'fr' ? 'Gestion des Tickets (GMAO)' : 'Tickets & Work Orders'}
              </button>
              <button 
                onClick={() => { onNavigate('team-ops'); setMobileMenuOpen(false); }} 
                className="text-left px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-[#0051c3] hover:text-white text-zinc-300 text-xs font-medium flex items-center gap-2 transition-all group"
              >
                <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-white">group</span>
                {lang === 'fr' ? 'Gestion des Intervenants & Agents' : 'Field Operators & Teams'}
              </button>
              <button 
                onClick={() => { onNavigate('spaces'); setMobileMenuOpen(false); }} 
                className="text-left px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-[#0051c3] hover:text-white text-zinc-300 text-xs font-medium flex items-center gap-2 transition-all group"
              >
                <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-white">domain</span>
                {lang === 'fr' ? 'Gestion des Sites & Adresses' : 'Sites & Addresses Manager'}
              </button>
              <button 
                onClick={() => { onNavigate('system-config'); setMobileMenuOpen(false); }} 
                className="text-left px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-[#0051c3] hover:text-white text-zinc-300 text-xs font-medium flex items-center gap-2 transition-all group"
              >
                <span className="material-symbols-outlined text-[16px] text-zinc-400 group-hover:text-white">settings</span>
                {lang === 'fr' ? 'Configuration Super Admin Master' : 'Super Admin Master Config'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs font-medium">
            <button onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white">
              {lang === 'fr' ? 'Accueil' : 'Home'}
            </button>
            <button onClick={() => { onNavigate('workspace'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-white font-semibold">
              {lang === 'fr' ? 'Cockpit CAFM Global' : 'CAFM Global Cockpit'}
            </button>
            <button onClick={() => { onNavigate('features'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white">
              {lang === 'fr' ? 'Fonctionnalités' : 'Features'}
            </button>
            <button onClick={() => { onNavigate('solutions-vitalai'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white">
              Solutions & IA
            </button>
            <button onClick={() => { onNavigate('god-mode'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white">
              Cockpits Cyber
            </button>
            <button onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white">
              {lang === 'fr' ? 'Tarifs' : 'Pricing'}
            </button>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex flex-col gap-2">
            {/* Action buttons */}
          </div>
        </div>
      )}
    </nav>
  );
};
