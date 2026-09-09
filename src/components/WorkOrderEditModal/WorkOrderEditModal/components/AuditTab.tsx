import React from 'react';
import { UseWorkOrderReturn } from '../hooks/useWorkOrder';

export const AuditTab: React.FC<{ wo: UseWorkOrderReturn; lang?: 'fr' | 'en' }> = ({ wo, lang = 'fr' }) => {
  return (
    <div className="space-y-3 animate-in fade-in duration-150 font-mono">
      <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase">
        {lang === 'fr' ? 'Historique de Traçabilité & Modifications' : 'Traceability & Modification Audit Log'}
      </span>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {wo.auditLog.map((log) => (
          <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">{log.action}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">• {log.user}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">{log.details || log.comment || '-'}</p>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})
            </span>
          </div>
        ))}
        {wo.auditLog.length === 0 && (
          <p className="text-center text-slate-500 py-4 italic text-xs">
            {lang === 'fr' ? 'Aucune entrée dans le journal d\'audit.' : 'No entries in the audit log.'}
          </p>
        )}
      </div>
    </div>
  );
};
