import React, { useState } from 'react';
import { 
  X, Wrench, Download, Save, Wifi, WifiOff, 
  FileText, CheckSquare, Layers, Activity, History 
} from 'lucide-react';
import { WorkOrder } from '../../types';
import { useWorkOrder } from './hooks/useWorkOrder';
import { usePdfGenerator } from './hooks/usePdfGenerator';
import { PRIORITY_COLORS } from './utils/constants';
import { TabNavigation } from './components/TabNavigation';
import { StatusStepper } from './components/StatusStepper';
import { ProgressBar } from './components/ProgressBar';
import { GeneralTab } from './components/GeneralTab';
import { ProcedureTab } from './components/ProcedureTab';
import { PartsTab } from './components/PartsTab';
import { ResolutionTab } from './components/ResolutionTab';
import { AuditTab } from './components/AuditTab';

interface Props {
  isOpen: boolean;
  workOrder: WorkOrder | null;
  onClose: () => void;
  onUpdated: (wo: WorkOrder) => void;
  lang?: 'fr' | 'en';
}

export const WorkOrderEditModal: React.FC<Props> = ({ 
  isOpen, 
  workOrder, 
  onClose, 
  onUpdated, 
  lang = 'fr' 
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');

  const wo = useWorkOrder(workOrder, onUpdated);
  const pdf = usePdfGenerator(wo.data);

  if (!isOpen || !workOrder) return null;

  const isOnline = wo.isOnline();
  const completedSteps = wo.procedureSteps.filter(s => s.completed).length;
  const totalSteps = wo.procedureSteps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const tabs = [
    { id: 'general', label: lang === 'fr' ? '1. Général' : '1. General', icon: FileText },
    { id: 'procedure', label: `${lang === 'fr' ? '2. Procédure' : '2. Procedure'} (${completedSteps}/${totalSteps})`, icon: CheckSquare },
    { id: 'parts', label: `${lang === 'fr' ? '3. Pièces' : '3. Parts'} (${wo.partsUsed.length})`, icon: Layers },
    { id: 'resolution', label: lang === 'fr' ? '4. Clôture' : '4. Close', icon: Activity },
    { id: 'history', label: lang === 'fr' ? '5. Audit' : '5. Audit', icon: History },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-white dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-black dark:text-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col my-auto max-h-[92vh]">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                  {workOrder.ticketNumber || workOrder.id}
                </span>
                <h3 className="text-base font-bold uppercase tracking-tight font-sans">
                  {lang === 'fr' ? 'Procédure & Modification de Ticket' : 'Work Order Procedure & Editor'}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${PRIORITY_COLORS[wo.data.priority || 'medium']}`}>
                  {wo.data.priority}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {workOrder.buildingName || 'Spider Tower'} • {workOrder.floor || 'Floor 1'} • {workOrder.assetName || 'Équipement Principal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={pdf.generate} 
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF</span>
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success notification toast */}
        {wo.successMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-5 py-2.5 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <span>✓</span>
            {wo.successMsg}
          </div>
        )}

        {/* Status Stepper & Progress */}
        <div className="bg-slate-50 dark:bg-slate-900/60 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <StatusStepper currentStatus={wo.data.status} onChange={wo.setStatus} />
          <ProgressBar completed={completedSteps} total={totalSteps} percent={progress} />
        </div>

        {/* Tab Navigation */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'general' && <GeneralTab wo={wo} />}
          {activeTab === 'procedure' && <ProcedureTab wo={wo} />}
          {activeTab === 'parts' && <PartsTab wo={wo} />}
          {activeTab === 'resolution' && <ResolutionTab wo={wo} />}
          {activeTab === 'history' && <AuditTab wo={wo} />}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" /> En ligne (Synchronisé)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-3.5 h-3.5" /> Hors-ligne (File d'attente locale)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold transition-colors"
            >
              Fermer
            </button>
            <button 
              type="button"
              onClick={wo.handleSave} 
              disabled={wo.isSaving} 
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
            >
              <Save className={`w-4 h-4 ${wo.isSaving ? 'animate-spin' : ''}`} />
              {wo.isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
