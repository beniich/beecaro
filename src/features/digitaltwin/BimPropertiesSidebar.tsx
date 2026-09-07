import React, { useState } from 'react';
import { BimElement } from '../../types/bim';
import { 
  Info, 
  Wrench, 
  Cpu, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Thermometer, 
  Wind, 
  Zap, 
  Droplets,
  ExternalLink,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface BimPropertiesSidebarProps {
  selectedElement: BimElement | null;
  onClose: () => void;
  onOpenTicket: (assetId?: string) => void;
  onInspectAsset: (assetId: string) => void;
  isLightMode?: boolean;
}

export const BimPropertiesSidebar: React.FC<BimPropertiesSidebarProps> = ({
  selectedElement,
  onClose,
  onOpenTicket,
  onInspectAsset,
  isLightMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'ifc' | 'cafm' | 'quantities'>('ifc');

  if (!selectedElement) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-6 text-center rounded-2xl border ${
        isLightMode ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-500'
      }`}>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-3 text-slate-400">
          <Layers className="w-8 h-8 opacity-60" />
        </div>
        <h4 className="text-sm font-bold text-slate-400 mb-1">Aucun élément sélectionné</h4>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Cliquez sur un mur, une gaine HVAC, une canalisation ou un équipement dans la maquette 3D pour inspecter ses propriétés IFC & GMAO.
        </p>
      </div>
    );
  }

  const getDisciplineIcon = () => {
    switch (selectedElement.discipline) {
      case 'hvac': return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'plumbing': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'electrical': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'equipment': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'structure': return <Layers className="w-4 h-4 text-emerald-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className={`h-full flex flex-col rounded-2xl border shadow-xl overflow-hidden ${
      isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-xl'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {getDisciplineIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                {selectedElement.ifcType}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                selectedElement.status === 'warning' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-slate-500/10 text-slate-400'
              }`}>
                {selectedElement.floor}
              </span>
            </div>
            <h3 className="text-sm font-bold mt-1 text-slate-900 dark:text-white line-clamp-2">
              {selectedElement.name}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ifc')}
          className={`pb-2.5 px-2 border-b-2 transition-all ${
            activeTab === 'ifc'
              ? 'border-emerald-500 text-emerald-500 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Propriétés IFC
        </button>
        <button
          onClick={() => setActiveTab('cafm')}
          className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'cafm'
              ? 'border-emerald-500 text-emerald-500 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span>GMAO & Terrain</span>
          {selectedElement.relatedAssetId && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('quantities')}
          className={`pb-2.5 px-2 border-b-2 transition-all ${
            activeTab === 'quantities'
              ? 'border-emerald-500 text-emerald-500 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Quantités & Dimensions
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs font-mono">
        {activeTab === 'ifc' && (
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">IFC GlobalId (GUID)</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                  {selectedElement.guid}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Système MEP</span>
                <span className="font-bold text-cyan-500 dark:text-cyan-400">
                  {selectedElement.systemName || 'Architecture Structurelle'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Matériau Principal</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {selectedElement.material || 'Standard IFC Material'}
                </span>
              </div>
            </div>

            {/* Custom Property Set (Psets) */}
            <div className="space-y-2">
              <h5 className="font-sans font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                Jeu de Propriétés (Pset_PropertySet)
              </h5>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {selectedElement.properties.map((prop, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950/40">
                    <span className="text-slate-500 font-medium">{prop.name}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{String(prop.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cafm' && (
          <div className="space-y-3">
            {selectedElement.relatedAssetId ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Équipement EAM Synchronisé
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                      Santé {selectedElement.maintenanceHealthScore || 92}%
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">
                    {selectedElement.relatedAssetName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Dernier Entretien</span>
                    <span className="text-xs font-bold text-slate-300">{selectedElement.lastInspectionDate || '15/08/2026'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Prochaine Révision</span>
                    <span className="text-xs font-bold text-emerald-400">{selectedElement.nextServiceDate || '15/11/2026'}</span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onOpenTicket(selectedElement.relatedAssetId)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-sans flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Créer un Ordre de Travail GMAO</span>
                  </button>

                  <button
                    onClick={() => onInspectAsset(selectedElement.relatedAssetId!)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Ouvrir Fiche Complète EAM</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center space-y-3 font-sans">
                <p className="text-xs text-slate-400">
                  Cet élément structurel IFC n'est pas encore associé à un code équipement de GMAO.
                </p>
                <button
                  onClick={() => onOpenTicket()}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 mx-auto border border-white/10"
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Associer un Actif GMAO</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quantities' && (
          <div className="space-y-2">
            <h5 className="font-sans font-bold text-[11px] text-slate-400 uppercase tracking-wider">
              Métrés & Caractéristiques Géométriques
            </h5>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {selectedElement.dimensions?.lengthM && (
                <div className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950/40">
                  <span className="text-slate-500">Longueur (m)</span>
                  <span className="font-bold text-slate-200">{selectedElement.dimensions.lengthM} m</span>
                </div>
              )}
              {selectedElement.dimensions?.sectionMm && (
                <div className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950/40">
                  <span className="text-slate-500">Section Gaine / Profilé</span>
                  <span className="font-bold text-cyan-400">{selectedElement.dimensions.sectionMm}</span>
                </div>
              )}
              {selectedElement.dimensions?.diameterMm && (
                <div className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950/40">
                  <span className="text-slate-500">Diamètre Nominal (DN)</span>
                  <span className="font-bold text-blue-400">DN{selectedElement.dimensions.diameterMm} mm</span>
                </div>
              )}
              {selectedElement.dimensions?.areaSqM && (
                <div className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950/40">
                  <span className="text-slate-500">Surface Totale</span>
                  <span className="font-bold text-slate-200">{selectedElement.dimensions.areaSqM} m²</span>
                </div>
              )}
              {selectedElement.technicalData?.airflowM3h && (
                <div className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950/40">
                  <span className="text-slate-500">Débit d'Air Aéraulique</span>
                  <span className="font-bold text-cyan-400">{selectedElement.technicalData.airflowM3h} m³/h</span>
                </div>
              )}
              {selectedElement.technicalData?.waterTempC && (
                <div className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950/40">
                  <span className="text-slate-500">Température Fluide</span>
                  <span className="font-bold text-orange-400">{selectedElement.technicalData.waterTempC}°C</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>ISO 16739 IFC4 Standard</span>
        <span className="text-emerald-400">Synchro CAFM 100%</span>
      </div>
    </div>
  );
};
