import React from 'react';
import { X, Cpu, QrCode, Wrench, ShieldCheck, Activity, Calendar, Zap } from 'lucide-react';
import { Asset } from '../types';
import { StatusBadge } from './StatusBadge';
import { ComplaintQrGenerator } from '../features/qr/ComplaintQrGenerator';

interface AssetDetailModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (asset: Asset) => void;
  lang?: 'fr' | 'en';
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  isOpen,
  onClose,
  onCreateTicket,
  lang = 'fr'
}) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{asset.code}</span>
              <h3 className="text-sm font-bold text-black dark:text-white">{asset.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs font-sans">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              {asset.buildingName} • {asset.floor} ({asset.zone})
            </span>
            <StatusBadge status={asset.status} />
          </div>

          {/* Telemetry Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 font-mono">
            <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold block">
              Live Sensor Telemetry Stream
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Health Score</span>
                <span className="text-emerald-400 font-bold text-sm">{asset.healthScore}%</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Power / Load</span>
                <span className="text-cyan-400 font-bold text-sm">{asset.powerConsumptionKw} kW</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Efficiency</span>
                <span className="text-amber-400 font-bold text-sm">{asset.telemetry.efficiencyRatio}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div>Runtime: <strong>{(asset.telemetry.runtimeHours).toLocaleString()} hrs</strong></div>
              <div>Vibration: <strong>{asset.telemetry.vibrationMmS ?? 0} mm/s</strong></div>
            </div>
          </div>

          {/* Dynamic Complaint QR Tag Component */}
          <ComplaintQrGenerator
            lang={lang}
            initialTargetType="asset"
            initialTargetName={asset.name}
            initialTargetId={asset.code || asset.id}
            compact={true}
          />

          {/* Manufacturer & Warranty */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500">Manufacturer:</span>
              <span>{asset.manufacturer}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500">Model:</span>
              <span>{asset.model}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500">Serial Number:</span>
              <span>{asset.serialNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-500">Next Scheduled Overhaul:</span>
              <span className="text-emerald-400 font-bold">{asset.nextService}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
          <button
            onClick={() => {
              onClose();
              onCreateTicket(asset);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center space-x-1.5"
          >
            <Wrench className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Créer Ordre de Travail' : 'Dispatch Work Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
