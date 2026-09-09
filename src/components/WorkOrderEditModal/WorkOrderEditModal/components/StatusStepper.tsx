import React from 'react';
import { WorkOrder } from '../../../types';

interface StatusStepperProps {
  currentStatus: WorkOrder['status'];
  onChange: (status: WorkOrder['status']) => void;
  lang?: 'fr' | 'en';
}

const STATUSES_FR = [
  { key: 'open', label: 'Ouvert' },
  { key: 'in_progress', label: 'En Cours' },
  { key: 'pending_parts', label: 'En Attente' },
  { key: 'resolved', label: 'Résolu' },
  { key: 'closed', label: 'Clôturé' }
] as const;

const STATUSES_EN = [
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'pending_parts', label: 'Pending Parts' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' }
] as const;

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, onChange, lang = 'fr' }) => {
  const statuses = lang === 'fr' ? STATUSES_FR : STATUSES_EN;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase mr-1">
        {lang === 'fr' ? 'Statut :' : 'Status :'}
      </span>
      {statuses.map((s, idx) => {
        const isSelected = currentStatus === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange(s.key as WorkOrder['status'])}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1 border ${
              isSelected
                ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-[9px] opacity-60">{idx + 1}.</span>
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
};
