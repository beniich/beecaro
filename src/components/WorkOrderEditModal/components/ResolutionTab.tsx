import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { UseWorkOrderReturn } from '../hooks/useWorkOrder';

export const ResolutionTab: React.FC<{ wo: UseWorkOrderReturn }> = ({ wo }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div>
        <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-xs">
          Analyse de la Cause Racine (Root Cause Failure Analysis)
        </label>
        <textarea
          rows={2}
          value={wo.data.rootCause || ''}
          onChange={(e) => wo.setRootCause(e.target.value)}
          placeholder="Ex: Usure prématurée du roulement due à un défaut d'alignement axial lors de la mise en service."
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono text-xs">
          Compte-Rendu d'Intervention & Recommandations Préventives
        </label>
        <textarea
          rows={4}
          value={wo.data.resolutionNotes || ''}
          onChange={(e) => wo.setResolutionNotes(e.target.value)}
          placeholder="Détaillez les réparations effectuées, tests de redémarrage, réglages de consignes..."
          className="form-input"
        />
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-600 dark:text-slate-300">Conformité et Certification ESG</span>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold">
          ISO 50001 / BREEAM APPRÊTÉ
        </span>
      </div>
    </div>
  );
};
