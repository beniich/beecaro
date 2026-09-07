import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Wrench, Plus, CheckCircle2, AlertTriangle, Calendar, User, Building2 } from 'lucide-react';
import { WorkOrder, Asset } from '../types';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newOrder: Partial<WorkOrder>) => void;
  preselectedAsset?: Asset | null;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedAsset
}) => {
  const [title, setTitle] = useState(preselectedAsset ? `Diagnostic Inspection: ${preselectedAsset.name}` : '');
  const [description, setDescription] = useState(preselectedAsset ? `Initiated maintenance inspection for asset ${preselectedAsset.code} (${preselectedAsset.name}) on ${preselectedAsset.floor}.` : '');
  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingId, setBuildingId] = useState(preselectedAsset?.buildingId || '');

  useEffect(() => {
    api.getBuildings().then(data => {
      if (data && data.length > 0) {
        setBuildings(data);
        if (!preselectedAsset) {
          setBuildingId(data[0].id);
        }
      }
    });
  }, [preselectedAsset]);
  const [priority, setPriority] = useState<WorkOrder['priority']>('medium');
  const [category, setCategory] = useState<WorkOrder['category']>('preventive');
  const [technicianName, setTechnicianName] = useState('Alexandre Mercer');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const bld = buildings.find(b => b.id === buildingId) || buildings[0] || { id: 'bld-1', name: 'BeeCarbonat Tower HQ' };

    onSubmit({
      id: `wo-${Date.now()}`,
      ticketNumber: `WO-2026-0${Math.floor(850 + Math.random() * 100)}`,
      title,
      description,
      assetId: preselectedAsset?.id,
      assetName: preselectedAsset?.name,
      buildingId: bld?.id || 'bld-1',
      buildingName: bld?.name || 'BeeCarbonat Tower HQ',
      floor: preselectedAsset?.floor || 'Floor 1',
      priority,
      category,
      status: 'open',
      assignedTechnician: {
        name: technicianName,
        avatar: '',
        role: 'Field Maintenance Specialist'
      },
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
      estimatedHours: 3.5
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
              Dispatch New Work Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Work Order Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chiller Condenser Pump Seal Replacement"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="emergency">Emergency</option>
                <option value="esg_audit">ESG Audit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Target Facility</label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">Assign Technician</label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Alexandre Mercer">Alexandre Mercer (Mobility)</option>
                <option value="Elena Rostova">Elena Rostova (Thermal/HVAC)</option>
                <option value="Dr. Tariq Al-Mansoor">Dr. Tariq Al-Mansoor (Power)</option>
                <option value="Carlos Mendez">Carlos Mendez (Rapid Response)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Detailed Description & Symptoms</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe anomaly symptoms, parts required, or safety precautions..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white font-bold shadow-lg shadow-emerald-950/40 transition-all"
            >
              Create & Dispatch Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
