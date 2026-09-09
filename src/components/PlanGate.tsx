import React from 'react';
import { usePlanGate } from '../hooks/usePlanGate';

interface PlanGateProps {
  feature: string;
  children: React.ReactNode;
  onNavigate?: (page: string) => void;
  lang?: 'fr' | 'en';
}

export const PlanGate: React.FC<PlanGateProps> = ({ feature, children, onNavigate, lang = 'fr' }) => {
  const { canAccess } = usePlanGate();
  
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[60vh] w-full rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 blur-sm pointer-events-none opacity-50 select-none">
        {children}
      </div>
      
      <div className="relative z-10 p-8 rounded-2xl border text-center max-w-xl mx-auto my-12 backdrop-blur-md transition-all shadow-xl bg-white/90 dark:bg-[#0a0a0a]/90 border-amber-200/60 dark:border-amber-500/25 shadow-amber-100/30 dark:shadow-black/80">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none rounded-2xl" />
        
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

        {onNavigate && (
          <button
            onClick={() => onNavigate('pricing')}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
          >
            {lang === 'fr' ? 'Voir les Offres' : 'View Pricing Plans'}
          </button>
        )}
      </div>
    </div>
  );
};
