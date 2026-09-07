"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import clsx from 'clsx';
import {
  LayoutDashboard, Package, MapPin, ClipboardList, Wrench, Users,
  CheckCircle2, Zap, Layers, Box, Activity, Globe, Menu, X, ChevronRight, HardDrive, Wifi
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets',      icon: Package,         label: 'Assets' },
  { to: '/spaces',      icon: MapPin,          label: 'Spaces' },
  { to: '/work-orders', icon: ClipboardList,   label: 'Work Orders' },
  { to: '/maintenance', icon: Wrench,          label: 'Maintenance' },
  { to: '/team',        icon: Users,           label: 'Team Operations' },
];

const innovationPillars = [
  { to: '/intervention',          icon: CheckCircle2, label: 'FieldTech Mobile & OT' },
  { to: '/energy',                icon: Zap,          label: 'Energy & ESG Copilot' },
  { to: '/bim',                   icon: Layers,       label: 'BIM & 3D Viewer' },
  { to: '/digital-twin',          icon: Box,          label: 'Digital Twin' },
  { to: '/predictive-maintenance', icon: Activity,    label: 'Predictive AI & Health' },
  { to: '/tenants',               icon: Globe,        label: 'Occupants & Tenant Care' },
];

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean, onCloseMobile: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();

  const linkClass = (to: string) =>
    clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest font-mono transition-all duration-200 group relative',
      pathname === to || pathname.startsWith(to + '/')
        ? 'bg-brand-orange text-black shadow-[0_0_15px_rgba(243,128,32,0.3)] font-semibold'
        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
    );

  const renderLinks = (items: typeof navItems, isCyan = false) => (
    items.map((item) => (
      <Link key={item.to} href={item.to} className={linkClass(item.to)} onClick={onCloseMobile}>
        <item.icon className={clsx("w-5 h-5 shrink-0", isCyan && pathname !== item.to ? "text-cyan-400" : "")} />
        {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
        {collapsed && !mobileOpen && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-zinc-100 text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-zinc-700">
            {item.label}
          </div>
        )}
      </Link>
    ))
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300',
          'md:relative md:translate-x-0',
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:w-64',
          collapsed && !mobileOpen ? 'md:w-20' : ''
        )}
      >
        {/* Mobile close button */}
        <button onClick={onCloseMobile} className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-50 md:hidden">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className={clsx("p-6 border-b border-zinc-800/40 relative", collapsed && !mobileOpen && "px-4")}>
          {!mobileOpen && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute top-4 right-[-14px] bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-50 rounded-full p-1 shadow-lg z-50 hidden md:block"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
          <div className={clsx("flex items-center gap-3", collapsed && !mobileOpen && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-orange-500 flex flex-shrink-0 items-center justify-center font-bold text-white text-sm">B</div>
            {(!collapsed || mobileOpen) && (
              <h1 className="font-bold text-zinc-50 font-sans tracking-tight text-base whitespace-nowrap">BEECARBONIT</h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {renderLinks(navItems)}

          {(!collapsed || mobileOpen) && (
            <div className="pt-4 pb-1">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-orange/90 px-3 truncate">5 Strategic Pillars</p>
            </div>
          )}
          {renderLinks(innovationPillars, true)}
        </nav>

        {/* User profile */}
        <div className={clsx("p-4 border-t border-zinc-800 flex items-center gap-3", collapsed && !mobileOpen && "justify-center")}>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
          {(!collapsed || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-50 font-mono truncate">{user?.fullName ?? 'Utilisateur'}</p>
              <p className="text-xs text-zinc-500 font-mono tracking-wider truncate">Serverless Mode</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
