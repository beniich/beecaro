import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Radio, 
  Database, 
  Activity, 
  Layers, 
  ArrowLeft,
  ChevronDown,
  UserCheck,
  Shield,
  CheckCircle2,
  Lock,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { BeeLogo } from '../BeeLogo';
import { NavigationPage } from '../../types/bizos';
import { useAuth } from '../../contexts/AuthContext';

interface CyberCockpitNavProps {
  currentCockpit: 
    | 'mission-control' 
    | 'god-mode' 
    | 'threat-matrix' 
    | 'sustainability-matrix'
    | 'neural-engine' 
    | 'energy-nexus' 
    | 'fleet-command' 
    | 'database-monitor'
    | 'predictive-core'
    | 'traffic-hub'
    | 'cloud-pulse'
    | 'audit-vault';
  title?: string;
  onNavigate?: (page: NavigationPage) => void;
  adminName?: string;
}

export const CyberCockpitNav: React.FC<CyberCockpitNavProps> = ({
  currentCockpit,
  title,
  onNavigate,
  adminName
}) => {
  const { user, profile, signOut } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeRole = profile?.role || 'admin';
  const displayName = adminName || profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Doe');
  const userEmail = profile?.email || user?.email || 'beniich.contact@gmail.com';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cockpits: { id: NavigationPage; label: string; num: string; tag?: string }[] = [
    { id: 'threat-matrix', label: 'Threat Matrix', num: 'V1', tag: 'CRITICAL' },
    { id: 'neural-engine', label: 'Neural Engine', num: 'V2' },
    { id: 'energy-nexus', label: 'Energy Nexus', num: 'V3' },
    { id: 'fleet-command', label: 'Fleet Command', num: 'V4' },
    { id: 'database-monitor', label: 'DB & Cache', num: 'V5' },
    { id: 'predictive-core', label: 'Predictive Core', num: 'V6', tag: 'CRITICAL' },
    { id: 'sustainability-matrix', label: 'Sustainability Matrix', num: 'V7' },
    { id: 'traffic-hub', label: 'Traffic Hub', num: 'V8' },
    { id: 'cloud-pulse', label: 'Multi-Cloud', num: 'V9' },
    { id: 'audit-vault', label: 'Audit Vault', num: 'V10' },
    { id: 'mission-control', label: 'Mission HQ', num: 'HQ' },
  ];

  return (
    <header className="h-14 border-b border-slate-800 bg-[#000000]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-40 relative shrink-0 select-none">
      {/* Left: Bee Logo + Title */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-1">
        <button
          onClick={() => onNavigate?.('spaceflow')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#ff9a00] transition-all group shrink-0"
          title="Back to CAFM Operations"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <BeeLogo size="sm" showText={false} />
          <span className="font-mono font-black text-white text-sm sm:text-base tracking-tight hidden sm:inline uppercase">
            BeeCarbonat
          </span>
        </button>

        <span className="text-slate-800 font-light hidden md:inline">|</span>

        {title && (
          <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-wide shrink-0 hidden lg:inline uppercase">
            {title}
          </span>
        )}

        {/* Cockpit Tabs Switcher */}
        <nav className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-xl border border-slate-800">
          {cockpits.map((cp) => {
            const isActive = currentCockpit === cp.id;
            return (
              <button
                key={cp.id}
                onClick={() => onNavigate?.(cp.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all shrink-0 uppercase tracking-tight ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-[0_0_14px_rgba(255,85,0,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span className={`text-[10px] px-1 py-0.2 rounded font-black ${
                  isActive ? 'bg-black/30 text-white' : 'bg-slate-900 text-slate-400'
                }`}>
                  {cp.num}
                </span>
                <span className="hidden 2xl:inline">{cp.label}</span>
                {cp.tag && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick actions + Admin Profile Dropdown */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate?.('spaceflow')}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-[#0a0a0a] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 hover:border-[#ff9a00] hover:text-white transition-all"
        >
          <span>CAFM Suite</span>
        </button>

        {/* User Profile & Role Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#ff9a00] font-mono font-black text-xs">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-mono font-bold text-white truncate max-w-[110px]">
                {displayName}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-black tracking-wider">
                {activeRole}
              </span>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 hidden sm:inline transition-transform duration-150 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile & Role Selection Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="pb-2.5 border-b border-slate-800">
                <div className="text-xs font-mono font-bold text-white truncate">{displayName}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{userEmail}</div>
                <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black border border-slate-800">
                  <Shield className="w-3.5 h-3.5 text-[#ff9a00]" />
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                    RBAC Role: <span className="text-[#ff9a00]">{activeRole}</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <button
                  onClick={() => onNavigate?.('settings')}
                  className="text-slate-400 hover:text-white uppercase font-bold"
                >
                  Config
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setProfileDropdownOpen(false);
                  }}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 uppercase font-bold"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
