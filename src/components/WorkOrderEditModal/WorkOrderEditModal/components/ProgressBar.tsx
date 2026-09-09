import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  percent: number;
  lang?: 'fr' | 'en';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, percent, lang = 'fr' }) => {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
      <div className="text-right">
        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block uppercase">
          {lang === 'fr' ? 'Progression Procédure' : 'Procedure Progress'}
        </span>
        <span className="text-xs font-mono font-bold text-amber-400">
          {completed}/{total} {lang === 'fr' ? 'étapes' : 'steps'} ({percent}%)
        </span>
      </div>
      <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div 
          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
