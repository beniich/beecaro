import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Wrench, Plus, CheckCircle2, AlertTriangle, Calendar, User, Building2 } from 'lucide-react';
import { WorkOrder, Asset } from '../types';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newOrder: Partial<WorkOrder>) => void;
  preselectedAsset?: Asset | null;
  lang?: 'fr' | 'en';
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  preselectedAsset,
  lang = 'fr'
}) => {
  const [title, setTitle] = useState(
    preselectedAsset
      ? lang === 'fr'
        ? `Inspection Diagnostique : ${preselectedAsset.name}`
        : `Diagnostic Inspection: ${preselectedAsset.name}`
      : ''
  );
  const [description, setDescription] = useState(
    preselectedAsset
      ? lang === 'fr'
        ? `Inspection de maintenance déclenchée pour l'équipement ${preselectedAsset.code} (${preselectedAsset.name}) au niveau ${preselectedAsset.floor}.`
        : `Initiated maintenance inspection for asset ${preselectedAsset.code} (${preselectedAsset.name}) on ${preselectedAsset.floor}.`
      : ''
  );
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

  const [currentWorkOrderCount, setCurrentWorkOrderCount] = useState(0);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');

  useEffect(() => {
    if (isOpen) {
      api.getWorkOrders().then(data => {
        if (Array.isArray(data)) {
          setCurrentWorkOrderCount(data.length);
        }
      });

      try {
        const saved = localStorage.getItem('beecarbonat_user');
        if (saved) {
          const userObj = JSON.parse(saved);
          const rawPlan = (userObj.plan || '').toLowerCase();
          const role = (userObj.role || '').toUpperCase();
          if (rawPlan === 'enterprise' || rawPlan === 'unlimited' || role === 'SUPERADMIN') {
            setUserPlan('enterprise');
          } else if (rawPlan === 'pro') {
            setUserPlan('pro');
          } else {
            setUserPlan('free');
          }
        } else {
          setUserPlan('free');
        }
      } catch {
        setUserPlan('free');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLimitReached = (() => {
    if (userPlan === 'free' && currentWorkOrderCount >= 8) return true;
    if (userPlan === 'pro' && currentWorkOrderCount >= 25) return true;
    return false;
  })();

  const limitMax = userPlan === 'free' ? 8 : 25;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLimitReached) return;

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
              {lang === 'fr' ? 'Créer un Ordre de Travail' : 'Dispatch New Work Order'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLimitReached ? (
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>
            <h4 className="text-sm font-mono font-bold uppercase text-black dark:text-white">
              {lang === 'fr' ? 'Limite de tickets atteinte' : 'Ticket Limit Reached'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-xs leading-relaxed">
              {lang === 'fr' 
                ? `Votre plan actuel (${userPlan.toUpperCase()}) est limité à ${limitMax} tickets. Vous avez atteint ce seuil avec vos ${currentWorkOrderCount} tickets actifs.`
                : `Your current plan (${userPlan.toUpperCase()}) is limited to ${limitMax} tickets. You have reached this limit with your ${currentWorkOrderCount} active tickets.`}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
              {lang === 'fr'
                ? "Veuillez mettre à niveau votre abonnement dans la section Tarifs pour débloquer de nouveaux tickets."
                : "Please upgrade your subscription in the Pricing section to unlock more tickets."}
            </p>
            <div className="pt-4 flex w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs rounded-xl font-mono border border-slate-300 dark:border-slate-700 transition-colors"
              >
                {lang === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[70vh] text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  {lang === 'fr' ? 'Intitulé de l\'Intervention' : 'Work Order Title'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={lang === 'fr' ? 'ex: Fuite CVC niveau 2' : 'e.g. HVAC Leak Floor 2'}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  {lang === 'fr' ? 'Bâtiment' : 'Building Location'}
                </label>
                <select
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  {lang === 'fr' ? 'Priorité de l\'Intervention' : 'Urgency Level'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).slice(0, 3).map((p) => {
                    const labels: Record<string, Record<string, string>> = {
                      low: { fr: 'Basse', en: 'Low' },
                      medium: { fr: 'Moyenne', en: 'Medium' },
                      high: { fr: 'Haute', en: 'High' },
                      critical: { fr: 'Critique', en: 'Critical' }
                    };
                    return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p as any)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                        priority === p
                          ? 'bg-amber-600 border-amber-500 text-black dark:text-white font-extrabold'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {labels[p][lang]}
                    </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  {lang === 'fr' ? 'Catégorie d\'Activité' : 'Activity Type'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="preventive">{lang === 'fr' ? 'Préventive' : 'Preventative'}</option>
                  <option value="corrective">{lang === 'fr' ? 'Corrective (Dépannage)' : 'Corrective'}</option>
                  <option value="safety">{lang === 'fr' ? 'Audit Sécurité' : 'Safety Audit'}</option>
                  <option value="calibration">{lang === 'fr' ? 'Métrologie / Calibration' : 'Calibration'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'fr' ? 'Technicien Assigné d\'Office' : 'Assigned Technician'}
              </label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Alexandre Mercer">Alexandre Mercer ({lang === 'fr' ? 'Mobilité / Électromécanique' : 'Mobility'})</option>
                <option value="Elena Rostova">Elena Rostova ({lang === 'fr' ? 'Thermique / CVC' : 'Thermal/HVAC'})</option>
                <option value="Dr. Tariq Al-Mansoor">Dr. Tariq Al-Mansoor ({lang === 'fr' ? 'Énergie / Haute Tension' : 'Power'})</option>
                <option value="Carlos Mendez">Carlos Mendez ({lang === 'fr' ? 'Intervention Rapide' : 'Rapid Response'})</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'fr' ? 'Description détaillée & Symptômes' : 'Detailed Description & Symptoms'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === 'fr' ? 'Décrivez les anomalies observées, les pièces requises ou consignes de sécurité...' : 'Describe anomaly symptoms, parts required, or safety precautions...'}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white font-bold shadow-lg shadow-emerald-950/40 transition-all"
              >
                {lang === 'fr' ? 'Créer & Assigner l\'Ordre' : 'Create & Dispatch Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
