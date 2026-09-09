import React, { useState } from 'react';
import { Plus, Trash2, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { UseWorkOrderReturn } from '../hooks/useWorkOrder';

export const ProcedureTab: React.FC<{ wo: UseWorkOrderReturn; lang?: 'fr' | 'en' }> = ({ wo, lang = 'fr' }) => {
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    wo.addStep(newTitle);
    setNewTitle('');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold">
            {lang === 'fr' ? 'Protocole de Maintenance & Sécurité Opérationnelle' : 'Maintenance Protocol & Operational Safety'}
          </p>
          <p className="opacity-90 font-mono text-[11px]">
            {lang === 'fr' 
              ? "Validez chaque étape au fur et à mesure de l'intervention. Les validations sont horodatées et consignées dans le journal d'audit."
              : "Verify and complete each procedure step as work progresses. Validations are timestamped and recorded in the audit log."}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 font-mono">
        {wo.procedureSteps.map(step => (
          <div
            key={step.id}
            className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              step.completed 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => wo.toggleStep(step.id)}
                className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                  step.completed 
                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-sm shadow-emerald-500/30' 
                    : 'border-slate-600 hover:border-amber-400 bg-slate-800'
                }`}
              >
                {step.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    step.completed ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {lang === 'fr' ? `Étape ${step.stepNumber}` : `Step ${step.stepNumber}`}
                  </span>
                  <span className={`text-xs font-semibold ${step.completed ? 'line-through opacity-80' : 'text-black dark:text-white'}`}>
                    {step.title}
                  </span>
                  {step.requiredValidation && (
                    <span className="text-[9px] bg-red-950/80 text-red-400 border border-red-800/60 px-1.5 py-0.2 rounded font-bold uppercase">
                      {lang === 'fr' ? 'Requis' : 'Required'}
                    </span>
                  )}
                </div>

                {step.completed && (
                  <p className="text-[10px] text-emerald-400/80 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'fr' 
                      ? `Validé le ${step.completedAt || 'Récemment'} par ${step.completedBy || wo.data.assignedTechnician?.name || 'Technicien'}`
                      : `Validated on ${step.completedAt || 'Recently'} by ${step.completedBy || wo.data.assignedTechnician?.name || 'Technician'}`}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => wo.deleteStep(step.id)}
              className="text-slate-500 dark:text-slate-500 hover:text-red-400 p-1 transition-colors"
              title={lang === 'fr' ? 'Supprimer cette étape' : 'Delete this step'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="pt-2 flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={lang === 'fr' ? "Ajouter une nouvelle étape de procédure technique..." : "Add a new technical procedure step..."}
          className="flex-1 form-input"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Ajouter' : 'Add Step'}
        </button>
      </form>
    </div>
  );
};
