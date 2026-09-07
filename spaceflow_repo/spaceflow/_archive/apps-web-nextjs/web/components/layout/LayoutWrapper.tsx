"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 font-sans">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-zinc-400 hover:text-zinc-50 rounded-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-300">BEECARBONIT</span>
          </div>
          <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
        </header>

        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
