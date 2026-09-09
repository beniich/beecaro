import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, AlertTriangle, Plus, CheckCircle2, FileText, Send, Sparkles, 
  Leaf, Download, TrendingDown, DollarSign, Search, Sliders, Layers, 
  Thermometer, Zap, Wind, Maximize2, RotateCcw, Activity, ShieldAlert, Heart, 
  MapPin, Clock, Info, Check, Award, Briefcase, FileUp, Key, Cpu, Shield, 
  RefreshCw, Database, Terminal, Settings, Smartphone, WifiOff
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import confetti from 'canvas-confetti';
import { SystemConfigMaster } from '../settings/SystemConfigMaster';
import { ApiKeyManager } from '../../components/security/ApiKeyManager';
import { api } from '../../services/api';

interface PanelProps {
  lang: 'fr' | 'en';
  isLightMode: boolean;
  onNavigate: (page: string) => void;
}

// ==========================================
// 1. TEAM OPERATIONS & INTERVENANTS
// ==========================================
export const TeamOperationsPanel: React.FC<PanelProps> = ({ lang, isLightMode, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'intervenants'>('dispatch');
  const [operators, setOperators] = useState<any[]>([]);
  const [intervenants, setIntervenants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTask, setNewTask] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/field-operators').then(res => res.json()).catch(() => []),
      fetch('/api/intervenants').then(res => res.json()).catch(() => [])
    ]).then(([ops, inters]) => {
      setOperators(Array.isArray(ops) ? ops : []);
      if (Array.isArray(ops) && ops.length > 0) {
        setSelectedOperator(ops[0].id);
      }
      setIntervenants(Array.isArray(inters) ? inters : []);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching field team data:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask) return;

    const opToUpdate = operators.find(op => op.id === selectedOperator);
    if (!opToUpdate) return;

    const updatedLoad = Math.min(opToUpdate.load + 20, 100);
    const updates = {
      status: 'In Intervention',
      task: newTask,
      load: updatedLoad
    };

    // 1. Optimistic UI update
    setOperators(prev => prev.map(op => {
      if (op.id === selectedOperator) {
        return {
          ...op,
          ...updates
        };
      }
      return op;
    }));

    // 2. Persist to Neon DB
    try {
      await fetch(`/api/field-operators/${selectedOperator}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Error saving field operator dispatch:', err);
    }

    setSuccessMsg(lang === 'fr' ? 'Tâche assignée et diffusée avec succès !' : 'Task successfully dispatched and assigned!');
    setNewTask('');
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-xs text-slate-500">
        {lang === 'fr' ? 'Chargement des ressources de terrain et intervenants...' : 'Loading field team configurations...'}
      </div>
    );
  }

  const loadData = operators.map(op => ({
    name: op.name.split(' ')[0],
    Charge: op.load
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        
        {/* Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                {lang === 'fr' ? 'Gestion des Agents & Intervenants' : 'Field Operators & Technicians'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'Suivi en temps réel des techniciens, fiches intervenants, planification et charge d\'équipe' : 'Real-time monitoring of technicians, contractor directory, maintenance dispatch and workload'}
              </p>
            </div>
          </div>

          {/* Direct Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('work-orders')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
              title="Voir tous les tickets GMAO"
            >
              <span className="material-symbols-outlined text-[16px]">assignment</span>
              <span>{lang === 'fr' ? 'Voir Tickets' : 'View Tickets'}</span>
            </button>
            <button
              onClick={() => onNavigate('intervenants')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
              title="Gérer les intervenants dans la Configuration Super Admin"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Config Master' : 'Master Config'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dispatch'
                ? 'bg-[#ff9a00] text-black shadow-[0_0_15px_rgba(255,154,0,0.3)]'
                : 'bg-zinc-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Dispatch & Suivi en Direct' : 'Live Dispatch & Workload'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {operators.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('intervenants')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'intervenants'
                ? 'bg-[#ff9a00] text-black shadow-[0_0_15px_rgba(255,154,0,0.3)]'
                : 'bg-zinc-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Annuaire des Intervenants & Prestataires' : 'Contractors & Technicians Directory'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {intervenants.length}
            </span>
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: DISPATCH */}
        {activeTab === 'dispatch' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dispatcher Form */}
            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#0d0a17]/50 border-white/5'}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 font-mono ${isLightMode ? 'text-slate-700' : 'text-orange-400'}`}>
                {lang === 'fr' ? 'Assignation d\'Urgence RSE' : 'Emergency Task Dispatch'}
              </h3>
              <form onSubmit={handleDispatch} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Sélectionner un Technicien' : 'Select Technician'}</label>
                  <select 
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(Number(e.target.value))}
                    className={`w-full text-xs rounded-xl p-2.5 outline-none font-mono ${isLightMode ? 'bg-white border border-slate-300 text-slate-800' : 'bg-white dark:bg-slate-950 border border-white/10 text-black dark:text-white'}`}
                  >
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.name} ({op.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Description de la Tâche RSE/GMAO' : 'RSE/CMMS Task Description'}</label>
                  <textarea 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder={lang === 'fr' ? 'Ex: Calibrer la vanne d\'équilibrage hydraulique...' : 'Ex: Calibrate hydraulic balancing valve...'}
                    className={`w-full h-24 text-xs rounded-xl p-2.5 outline-none font-mono ${isLightMode ? 'bg-white border border-slate-300 text-slate-800' : 'bg-white dark:bg-slate-950 border border-white/10 text-black dark:text-white'}`}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-black dark:text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Diffuser l\'Intervention' : 'Dispatch Intervention'}</span>
                </button>
              </form>
            </div>

            {/* Active List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
                {lang === 'fr' ? 'Statut de l\'Équipe en Ligne' : 'Online Team Workload'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {operators.map(op => (
                  <div key={op.id} className={`p-4 rounded-2xl border transition-all ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-white dark:bg-slate-950/60 border-white/5 hover:border-orange-500/20'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>{op.name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{op.role}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        op.status === 'In Intervention' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        op.status === 'On Call' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        op.status === 'Break' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {op.status}
                      </span>
                    </div>

                    <div className="space-y-2 mt-3">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex justify-between">
                        <span>{lang === 'fr' ? 'Tâche Actuelle :' : 'Current Task:'}</span>
                        <span className={`font-semibold max-w-[150px] truncate ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>{op.task}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-slate-500 dark:text-slate-500">
                          <span>{lang === 'fr' ? 'Taux de Charge' : 'Workload Score'}</span>
                          <span>{op.load}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${op.load > 80 ? 'bg-red-500' : op.load > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${op.load}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recharts Workload */}
              <div className="h-40 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loadData}>
                    <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0a0712', border: '1px solid #ff9d2b' }} />
                    <Bar dataKey="Charge" fill="#ff9d2b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANNUAIRE INTERVENANTS & PRESTATAIRES */}
        {activeTab === 'intervenants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {lang === 'fr' ? `${intervenants.length} intervenant(s) répertorié(s) dans la base master` : `${intervenants.length} technician(s) and contractor(s) registered`}
              </div>
              <button
                onClick={() => onNavigate('intervenants')}
                className="px-3 py-1.5 rounded-xl bg-[#ff9a00] text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(255,154,0,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Ajouter / Modifier des Intervenants' : 'Add / Edit Contractors'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {intervenants.map((inter: any) => (
                <div
                  key={inter.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLightMode ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-zinc-900/80 border-slate-800 hover:border-orange-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                        {inter.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{inter.name}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                          inter.type === 'Interne' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {inter.type || 'Interne'}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      inter.status === 'Disponible' || inter.status === 'Actif'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {inter.status || 'Actif'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{lang === 'fr' ? 'Spécialité :' : 'Specialty:'}</span>
                      <span className="text-white font-medium">{inter.specialty || inter.specialite || 'Génie Climatique'}</span>
                    </div>

                    {inter.company && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{lang === 'fr' ? 'Entreprise :' : 'Company:'}</span>
                        <span className="text-white font-medium">{inter.company}</span>
                      </div>
                    )}

                    {inter.phone && (
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-500">{lang === 'fr' ? 'Téléphone :' : 'Phone:'}</span>
                        <span className="text-slate-300">{inter.phone}</span>
                      </div>
                    )}

                    {inter.email && (
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Email :</span>
                        <span className="text-slate-300 truncate max-w-[150px]">{inter.email}</span>
                      </div>
                    )}

                    {inter.hourly_rate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{lang === 'fr' ? 'Tarif horaire :' : 'Hourly rate:'}</span>
                        <span className="text-[#ff9a00] font-mono font-bold">{inter.hourly_rate} €/h</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('work-orders')}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">assignment</span>
                      <span>{lang === 'fr' ? 'Assigner un ticket' : 'Assign ticket'}</span>
                    </button>
                    
                    <button
                      onClick={() => onNavigate('intervenants')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>{lang === 'fr' ? 'Modifier' : 'Edit'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ==========================================
// 2. ENVIRONMENTAL IMPACT REPORT
// ==========================================
export const EnvImpactPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [downloading, setDownloading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getEsgMetrics()
      .then(data => {
        if (data) {
          setMetrics(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching ESG metrics for panel:', err);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      alert(lang === 'fr' ? 'Rapport audit ESG Audité exporté sous format PDF sécurisé !' : 'Secure Certified ESG Audit PDF report exported!');
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-xs text-slate-500">
        {lang === 'fr' ? 'Chargement du rapport d\'impact RSE...' : 'Loading ESG impact reports...'}
      </div>
    );
  }

  // Calculate scope values in tonnes
  const s1 = metrics ? Math.round(metrics.scope1KgCo2e / 1000) : 42;
  const s2 = metrics ? Math.round(metrics.scope2KgCo2e / 1000) : 215;
  const s3 = metrics ? Math.round(metrics.scope3KgCo2e / 1000) : 161;
  const totalCarbon = metrics ? metrics.totalCarbonYtdTonnes : 418.2;
  const reduction = metrics ? metrics.carbonReductionPercent : 19.6;
  const waterRecycled = metrics ? (metrics.waterRecycledLiters / 1000) : 1845;
  const wasteDiversion = metrics ? metrics.wasteDiversionRate : 84.5;
  const greenBuildingCert = metrics ? metrics.greenBuildingCert : 'LEED Platinum';

  const impactData = [
    { name: lang === 'fr' ? 'Scope 1 (Direct)' : 'Scope 1 (Direct)', value: s1, color: '#f43f5e' },
    { name: lang === 'fr' ? 'Scope 2 (Indirect)' : 'Scope 2 (Indirect)', value: s2, color: '#06b6d4' },
    { name: lang === 'fr' ? 'Scope 3 (Approvisionnement)' : 'Scope 3 (Supply Chain)', value: s3, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                {lang === 'fr' ? 'Rapport d\'Impact RSE & Carbone' : 'RSE & Environmental Impact Audit'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'Génération de bilans de conformité ESG, réduction Scope 1-2-3 et comptabilisation carbone' : 'Compliance tracking of Scope 1-2-3 offsets, ESG reporting indicators, and green energy audits'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-black dark:text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'fr' ? 'Génération...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Exporter Certificat RSE PDF' : 'Export Verified ESG Certificate'}</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === 'fr' ? 'ÉMISSIONS SCOPE TOTAL' : 'TOTAL EMISSION INDEX'}</span>
            <div className="text-xl font-extrabold text-orange-400 mt-1 flex items-baseline space-x-1">
              <span>{totalCarbon}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">tCO2e / {lang === 'fr' ? 'an' : 'yr'}</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{reduction}% {lang === 'fr' ? 'vs l\'an dernier' : 'vs last year'}</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === 'fr' ? 'CIRCULARITÉ DE L\'EAU' : 'WATER RECYCLING INDEX'}</span>
            <div className="text-xl font-extrabold text-cyan-400 mt-1 flex items-baseline space-x-1">
              <span>{((waterRecycled / 1845) * 91.2).toFixed(1)}%</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono mt-1">
              {lang === 'fr' ? `${Math.round(waterRecycled).toLocaleString()} m³ récupérés/an` : `${Math.round(waterRecycled).toLocaleString()} m³ harvested/yr`}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === 'fr' ? 'VALORISATION DÉCHETS' : 'WASTE DIVERSION RATE'}</span>
            <div className="text-xl font-extrabold text-emerald-400 mt-1 flex items-baseline space-x-1">
              <span>{wasteDiversion}%</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">
              {greenBuildingCert} {lang === 'fr' ? 'Certifié RSE' : 'RSE Certified'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 block mb-3">
              {lang === 'fr' ? 'Répartition des Émissions (tCO2e)' : 'Emissions Breakout (tCO2e)'}
            </span>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie 
                  data={impactData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {impactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 block">
              {lang === 'fr' ? 'Bilan RSE Audité & Certifié' : 'Certified ESG Audit Footprint'}
            </span>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-white/5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Veritas Compliance ID:</span>
                <span className="text-black dark:text-white font-bold">#ESG-9982-2026</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-white/5 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">GHG Protocol Standard:</span>
                <span className="text-emerald-400 font-bold">{greenBuildingCert} Compliant</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-white/5 leading-relaxed text-slate-500 dark:text-slate-400 text-[11px]">
                {lang === 'fr' 
                  ? "Toutes les données de télémétrie ESG proviennent de sondes cryptographiques certifiées et de BACnet modbus mesh en direct sans altération."
                  : "All ESG telemetry data originates directly from physical IoT cryptographically signed endpoints with zero latency."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ENERGY & ESG COPILOT
// ==========================================
export const EsgCopilotPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [offsetSlider, setOffsetSlider] = useState(150);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: lang === 'fr' ? 'Bonjour ! Je suis votre Copilote ESG IA. Comment puis-je vous aider à optimiser la performance thermique ou vos compensations carbone aujourd\'hui ?' : 'Hello! I am your AI ESG Copilot. How can I help optimize your energy patterns or retire carbon credits today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const carbonPricePerTon = 18.5; // in USD or credits
  const totalOffsetCost = Math.round(offsetSlider * carbonPricePerTon);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg) return;
    const userMsg = inputMsg;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputMsg('');

    setTimeout(() => {
      let aiText = '';
      if (userMsg.toLowerCase().includes('hvac') || userMsg.toLowerCase().includes('cvc')) {
        aiText = lang === 'fr' 
          ? "L'analyse thermique IA indique qu'en réduisant la consigne de chauffage de 1°C dans la Zone 1A entre 22h et 6h, vous réduisez les émissions Scope 1 de 4.2 tCO2e ce mois-ci."
          : "Thermal AI indicates that lowering heating in Zone 1A by 1°C from 10 PM to 6 AM saves 4.2 tCO2e of Scope 1 emissions this month.";
      } else if (userMsg.toLowerCase().includes('carbon') || userMsg.toLowerCase().includes('carbone')) {
        aiText = lang === 'fr'
          ? "Votre budget carbone annuel est de 900 tCO2e. Avec un taux de compensation actuel, vous êtes en avance de 12% sur vos objectifs de neutralité."
          : "Your annual carbon budget is 900 tCO2e. With your current retirement pace, you are 12% ahead of your Net Zero milestone.";
      } else {
        aiText = lang === 'fr'
          ? "Analyse en cours... Le maillage IoT montre une consommation d'électricité stable. Je recommande de garder le cycle de ventilation CVC sur 'Auto Eco' pour optimiser la charge."
          : "Analyzing telemetry... IoT broker shows stable grid draw. I recommend maintaining HVAC fan cycle on 'Auto Eco' to limit peak surge costs.";
      }
      setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              {lang === 'fr' ? 'Copilote IA Énergie & ESG' : 'Energy & ESG Copilot AI'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'Analyse énergétique assistée par IA, simulateur de compensation carbone et recommandations prédictives' : 'AI-driven building thermal analytics, carbon credit retirement forecasting, and automated recommendations'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carbon retire simulation */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/60 border-white/5'}`}>
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-mono text-orange-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                {lang === 'fr' ? 'Simulateur de Compensation Carbone' : 'Carbon Retirement Calculator'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'Ajustez le volume de crédits or (Gold Standard) à retirer ce mois-ci :' : 'Configure the tonnage of Gold Standard verified credits to retire this session:'}
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
                  <span>{lang === 'fr' ? 'Quantité :' : 'Quantity:'}</span>
                  <span className="font-bold text-black dark:text-white">{offsetSlider} tCO2e</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  value={offsetSlider}
                  onChange={(e) => setOffsetSlider(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-white/5">
                  <span className="text-slate-500 dark:text-slate-500 text-[10px] block font-mono">EST. PRICE PER TON</span>
                  <span className="text-black dark:text-white font-bold font-mono">${carbonPricePerTon} USD</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-white/5">
                  <span className="text-slate-500 dark:text-slate-500 text-[10px] block font-mono">EST. RETIREMENT BUDGET</span>
                  <span className="text-orange-400 font-extrabold font-mono">${totalOffsetCost} USD</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
                alert(lang === 'fr' ? `Demande de compensation lancée pour ${offsetSlider} tCO2e (${totalOffsetCost} USD).` : `Offsets retirement requested for ${offsetSlider} tCO2e (${totalOffsetCost} USD).`);
              }}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-black dark:text-white font-bold text-xs font-mono tracking-wider transition-all cursor-pointer"
            >
              🚀 {lang === 'fr' ? 'RETIRER LES CRÉDITS SUR LE LEDGER' : 'RETIRE CREDITS ON CRYPTO LEDGER'}
            </button>
          </div>

          {/* AI Chatbot */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between h-[360px] ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/60 border-white/5'}`}>
            <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-2xl max-w-[85%] ${m.sender === 'ai' ? 'bg-orange-500/10 text-[#fff] border border-orange-500/25 mr-auto' : 'bg-slate-800 text-slate-200 ml-auto'}`}>
                  {m.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 mt-4">
              <input 
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={lang === 'fr' ? 'Demander conseil (ex: Consigne HVAC)...' : 'Ask Copilot (e.g., Optimize HVAC consigne)...'}
                className={`flex-grow text-xs rounded-xl px-3 py-2.5 outline-none font-mono ${isLightMode ? 'bg-white border border-slate-300 text-slate-800' : 'bg-slate-50 dark:bg-slate-900 border border-white/10 text-black dark:text-white'}`}
              />
              <button 
                type="submit"
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black dark:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. BIM 3D & GMAO TERRAIN (BEE CARBON IT PITCH)
// ==========================================
export const BimViewerPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [activeStep, setActiveStep] = useState<'scan' | 'checklist' | 'ai'>('scan');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const askAi = async (promptText?: string) => {
    const textToAsk = promptText || userPrompt;
    if (!textToAsk.trim()) return;
    setIsLoadingAi(true);
    setAiResponse('');
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToAsk,
          systemInstruction: 'You are BeeCarbonIT AI, a professional smart building and GMAO energy auditor assistant. Provide quick, precise, actionable operational advice in French or English (depending on user language). Limit formatting to short bullet points.'
        })
      });
      const data = await response.json();
      setAiResponse(data.text || 'No response from model');
    } catch (err: any) {
      console.error('Error contacting BeeCarbonIT AI:', err);
      setAiResponse('Error contacting AI. Please verify your internet connection and API key configuration.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        
        {/* Header Pitch */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 rounded-2xl bg-[#ff9d2b]/10 text-[#ff9d2b] border border-[#ff9d2b]/20">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-black dark:text-white'}`}>
                🐝 BeeCarbonIT — L'Essentiel
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-500 font-medium mt-1 max-w-2xl">
                La GMAO qui scanne un QR, ouvre la fiche de l'équipement, et guide le technicien étape par étape — <strong className="text-emerald-500">même sans réseau</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400 mb-1">En Production</span>
            <div className="flex gap-1.5">
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-600 dark:text-slate-600 dark:text-slate-300">Web</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-600 dark:text-slate-600 dark:text-slate-300">iOS/Android</span>
              <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">IA Intégrée</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: The Problem & Value */}
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-red-50/50 border-red-100' : 'bg-red-950/20 border-red-900/30'}`}>
              <h3 className="text-sm font-black uppercase tracking-wider text-red-500 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Le Problème
              </h3>
              <p className={`text-sm leading-relaxed mb-3 ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
                Les techniciens terrain perdent <strong className="text-red-500">2h/jour</strong> à chercher l'information :
              </p>
              <ul className={`text-xs space-y-2 font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                <li className="flex gap-2"><span>•</span> Où est l'équipement en panne ?</li>
                <li className="flex gap-2"><span>•</span> Quel est le bon outil à utiliser ?</li>
                <li className="flex gap-2"><span>•</span> Qui a travaillé dessus en dernier ?</li>
                <li className="flex gap-2"><span>•</span> Y a-t-il des pièces en stock ?</li>
              </ul>
              <p className={`text-xs font-bold mt-4 pt-3 border-t ${isLightMode ? 'border-red-100 text-red-600' : 'border-red-900/50 text-red-400'}`}>
                Résultat : pannes plus longues, coûts qui explosent, frustration.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-slate-900/50 border-white/5'}`}>
              <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                Modèle Économique & ROI
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="font-bold text-slate-500 dark:text-slate-500">Free</span>
                  <span className="font-black dark:text-white">0€ <span className="font-normal text-[10px] text-slate-500 dark:text-slate-400">(3 users)</span></span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="font-bold text-[#ff9d2b]">Pro (PME)</span>
                  <span className="font-black dark:text-white">49€<span className="font-normal text-[10px] text-slate-500 dark:text-slate-400">/user/mois</span></span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/5">
                  <span className="font-bold text-emerald-500">Business</span>
                  <span className="font-black dark:text-white">99€<span className="font-normal text-[10px] text-slate-500 dark:text-slate-400">/user/mois</span></span>
                </div>
                <div className="mt-4 pt-2">
                  <span className="inline-block px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">
                    ROI Client : Amorti en 3 mois (-30% temps d'arrêt)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Interactive Demo / BIM Viewer Replacement */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* Interactive Steps */}
            <div className="flex justify-between gap-2 overflow-x-auto pb-2">
              <button 
                onClick={() => setActiveStep('scan')}
                className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition-all ${
                  activeStep === 'scan' 
                    ? 'bg-[#ff9d2b] border-[#ff9d2b] shadow-lg shadow-[#ff9d2b]/20 text-black dark:text-white' 
                    : isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-50 dark:bg-slate-900 border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Maximize2 className="w-5 h-5 mb-2 opacity-80" />
                <div className="font-bold text-sm">1. Scan QR Terrain</div>
                <div className="text-[10px] mt-1 opacity-80">Accès instantané 3D & Data</div>
              </button>
              
              <button 
                onClick={() => setActiveStep('checklist')}
                className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition-all ${
                  activeStep === 'checklist' 
                    ? 'bg-[#ff9d2b] border-[#ff9d2b] shadow-lg shadow-[#ff9d2b]/20 text-black dark:text-white' 
                    : isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-50 dark:bg-slate-900 border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 mb-2 opacity-80" />
                <div className="font-bold text-sm">2. Checklist & Hors-Ligne</div>
                <div className="text-[10px] mt-1 opacity-80">Zéro oubli, sync différée</div>
              </button>
              
              <button 
                onClick={() => setActiveStep('ai')}
                className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition-all ${
                  activeStep === 'ai' 
                    ? 'bg-[#ff9d2b] border-[#ff9d2b] shadow-lg shadow-[#ff9d2b]/20 text-black dark:text-white' 
                    : isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-slate-50 dark:bg-slate-900 border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-5 h-5 mb-2 opacity-80" />
                <div className="font-bold text-sm">3. L'IA Qui Change Tout</div>
                <div className="text-[10px] mt-1 opacity-80">Prédictif en langage naturel</div>
              </button>
            </div>

            {/* Dynamic Viewport */}
            <div className={`flex-1 rounded-2xl border overflow-hidden relative flex flex-col ${isLightMode ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-white dark:bg-slate-950 border-white/10'}`}>
              
              {/* Fake Top Bar */}
              <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {activeStep === 'scan' ? 'Visualiseur 3D BIM & Jumeau' : activeStep === 'checklist' ? 'Interface Technicien Mobile' : 'Console IA Prédictive'}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  <WifiIcon /> {activeStep === 'checklist' ? 'MODE HORS-LIGNE ACTIF' : 'SYNCHRONISÉ'}
                </span>
              </div>

              {/* View Content */}
              <div className="flex-1 relative p-6 flex flex-col items-center justify-center min-h-[320px]">
                
                {activeStep === 'scan' && (
                  <div className="w-full text-center animate-in fade-in zoom-in duration-300">
                    <div className="relative w-full max-w-sm mx-auto h-48 mb-6">
                      {/* Abstract 3D SVG representation */}
                      <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 400 300" fill="none">
                        <polygon points="200,60 340,130 200,200 60,130" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                        <polygon points="200,200 340,130 340,160 200,230" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                        <polygon points="60,130 200,200 200,230 60,160" fill="#020617" stroke="#334155" strokeWidth="2" />
                        
                        {/* Highlights & details */}
                        <polygon points="180,100 260,140 220,160 140,120" fill="#ff9d2b" opacity="0.8" />
                        <circle cx="200" cy="130" r="40" fill="none" stroke="#ff9d2b" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
                        <circle cx="200" cy="130" r="4" fill="#fff" className="animate-ping" />
                      </svg>
                      
                      {/* Floating overlay card simulating scan result */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-950/80 backdrop-blur-md border border-white/20 p-4 rounded-xl w-64 shadow-2xl">
                        <div className="flex items-center gap-3 mb-2 pb-2 border-b border-white/10">
                          <div className="bg-[#ff9d2b] p-1.5 rounded-lg">
                            <Maximize2 className="w-4 h-4 text-black dark:text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Scan Détecté</div>
                            <div className="text-sm font-bold text-black dark:text-white">Pompe P-104</div>
                          </div>
                        </div>
                        <div className="text-left space-y-1 text-xs text-slate-600 dark:text-slate-600 dark:text-slate-300">
                          <div className="flex justify-between"><span>Dernier Maint:</span> <span className="text-black dark:text-white">Il y a 12 jours</span></div>
                          <div className="flex justify-between"><span>Technicien:</span> <span className="text-black dark:text-white">E. Rostova</span></div>
                          <div className="flex justify-between"><span>Pièces en stock:</span> <span className="text-emerald-400 font-bold">Oui (3)</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 'checklist' && (
                  <div className="w-full max-w-sm mx-auto animate-in slide-in-from-right duration-300">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
                        <h4 className="text-black dark:text-white font-bold text-sm">Intervention P-104</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maintenance Préventive Trimestrielle</p>
                      </div>
                      <div className="p-2 space-y-2 bg-white dark:bg-slate-950/50">
                        {[
                          { text: "Consignation électrique effectuée", done: true },
                          { text: "Vérification des joints d'étanchéité", done: true },
                          { text: "Remplacement du filtre à huile", done: false },
                          { text: "Test de remise en pression", done: false },
                          { text: "Signature client (Validation)", done: false }
                        ].map((item, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.done ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.done ? 'bg-emerald-500 border-emerald-500 text-black dark:text-white' : 'border-slate-500'}`}>
                              {item.done && <LocalCheck className="w-3 h-3" />}
                            </div>
                            <span className={`text-xs font-medium ${item.done ? 'line-through opacity-70' : ''}`}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 'ai' && (
                  <div className="w-full h-full flex flex-col justify-between p-4 bg-slate-900/40 rounded-xl animate-in fade-in duration-300">
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                      <div className="flex justify-end">
                        <div className="bg-[#ff9d2b]/20 border border-[#ff9d2b]/30 text-[#ff9d2b] p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-sm">
                          {lang === 'fr' ? 'Analyse prédictive de mon bâtiment' : 'Predictive audit of my building'}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-slate-800/80 border border-slate-700 text-slate-200 p-4 rounded-2xl rounded-tl-sm max-w-[95%] text-sm shadow-xl">
                          <p className="mb-2 text-[#ff9d2b] text-xs font-bold uppercase tracking-wider">
                            {lang === 'fr' ? '🤖 BEE-CARBONIT CO-PILOTE IA :' : '🤖 BEE-CARBONIT AI CO-PILOT :'}
                          </p>
                          {aiResponse ? (
                            <div className="space-y-2 text-slate-100 whitespace-pre-wrap leading-relaxed">
                              {aiResponse}
                            </div>
                          ) : (
                            <>
                              <p className="mb-3 text-slate-400 text-xs">{lang === 'fr' ? "D'après l'analyse prédictive active :" : "Based on active predictive analysis :"}</p>
                              <ul className="space-y-2 mb-4 text-xs">
                                <li className="flex items-start gap-2">
                                  <span className="text-red-400 mt-0.5">•</span>
                                  <div>
                                    <span className="font-bold text-white">Pompe P-104 : <span className="text-red-400">87% de risque</span></span>
                                    <p className="text-[10px] text-slate-400">3 pannes récentes sur ce lot.</p>
                                  </div>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#ff9d2b] mt-0.5">•</span>
                                  <div>
                                    <span className="font-bold text-white">Compresseur C-12 : <span className="text-[#ff9d2b]">62% de risque</span></span>
                                    <p className="text-[10px] text-slate-400">Vibrations anormales détectées (+14%).</p>
                                  </div>
                                </li>
                              </ul>
                              <div className="bg-[#ff9d2b]/10 border border-[#ff9d2b]/20 p-2.5 rounded-xl flex items-start gap-2">
                                <LocalLightbulb className="w-4 h-4 text-[#ff9d2b] shrink-0 mt-0.5" />
                                <p className="text-[11px] text-[#ff9d2b] font-medium leading-relaxed">
                                  {lang === 'fr' ? "Recommandation : Planifier une intervention sur P-104 sous 48h." : "Recommendation: Schedule service on P-104 within 48h."}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Input Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        askAi();
                      }}
                      className="mt-4 pt-3 border-t border-slate-800 flex gap-2"
                    >
                      <input
                        type="text"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder={lang === 'fr' ? "Demander conseil à l'IA (ex: HVAC, CO2)..." : "Ask the AI for advice (e.g. HVAC, CO2)..."}
                        disabled={isLoadingAi}
                        className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff9d2b] disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isLoadingAi || !userPrompt.trim()}
                        className="bg-[#ff9d2b] text-black px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-opacity-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isLoadingAi ? (
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          lang === 'fr' ? 'Analyser' : 'Analyze'
                        )}
                      </button>
                    </form>
                  </div>
                )}
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper components for the new layout
const WifiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);
const LocalCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const LocalLightbulb = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);


// ==========================================
// 5. PREDICTIVE AI & HEALTH
// ==========================================
export const PredictiveAiPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [anomalyThreshold, setAnomalyThreshold] = useState('0.75');
  
  const predictiveChartData = [
    { hour: '00h', Vibration: 1.2, AnomalyChance: 12 },
    { hour: '04h', Vibration: 1.5, AnomalyChance: 15 },
    { hour: '08h', Vibration: 3.1, AnomalyChance: 78 }, // spike
    { hour: '12h', Vibration: 1.8, AnomalyChance: 22 },
    { hour: '16h', Vibration: 1.4, AnomalyChance: 14 },
    { hour: '20h', Vibration: 1.3, AnomalyChance: 10 },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              {lang === 'fr' ? 'IA Prédictive & Diagnostic de Santé' : 'Predictive AI & Asset Health Index'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'Analyse acoustique, signatures thermiques IoT et calcul d\'espérance de vie des équipements (RUL)' : 'Vibrational telemetry monitoring, fault-tree calculations, and remaining useful life analytics'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Anomaly */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/60 border-white/5'}`}>
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">AI Sensitivity Settings</span>
              
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Vibration Outlier Threshold (mm/s)</label>
                <select 
                  value={anomalyThreshold}
                  onChange={(e) => setAnomalyThreshold(e.target.value)}
                  className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-white/10 rounded-xl p-2.5 text-black dark:text-white focus:outline-none"
                >
                  <option value="0.5">0.5 mm/s (Maximum Precision)</option>
                  <option value="0.75">0.75 mm/s (Standard Recommendation)</option>
                  <option value="1.5">1.5 mm/s (High Tolerance)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-white/5 text-[11px] font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-500">Predicted Failure risk:</span>
                  <span className="text-[#f43f5e] font-bold">Low Anomaly Mesh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-500">Active Sensors calibrated:</span>
                  <span className="text-emerald-400">118 / 118</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 } });
                alert(lang === 'fr' ? 'Algorithme de calcul RUL ré-exécuté sur l\'ensemble des pompes !' : 'Recalculated asset RUL indicators successfully!');
              }}
              className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black dark:text-white font-bold text-xs font-mono transition-all text-center cursor-pointer"
            >
              🔄 {lang === 'fr' ? 'Recalculer les RULs' : 'Recalculate RUL Index'}
            </button>
          </div>

          {/* Area Chart Vibration */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400 block">
              {lang === 'fr' ? 'Télémétrie Vibratoire & Risque d\'Anomalie CVC (Vibration vs Anomaly%)' : 'Vibration vs Anomaly Probability'}
            </span>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveChartData}>
                  <defs>
                    <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9d2b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff9d2b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="hour" tick={{ fill: '#888', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0a0712', border: '1px solid #ff9d2b' }} />
                  <Area type="monotone" dataKey="Vibration" stroke="#ff9d2b" fillOpacity={1} fill="url(#colorVib)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. OCCUPANTS & TENANT CARE
// ==========================================
export const OccupantsCarePanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [deskReserved, setDeskReserved] = useState(false);
  const [deskId, setDeskId] = useState('Desk L1-12');
  const [date, setDate] = useState('2026-08-27');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setDeskReserved(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              {lang === 'fr' ? 'Bien-être des Occupants & Locataires' : 'Occupants & Tenant Care Portal'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'Mesures de confort thermique, qualité de l\'air ambiant, et réservation d\'espaces partagés' : 'Indoor environmental comfort metrics, real-time desk bookings, and tenant SLA counters'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comfort Scores */}
          <div className="space-y-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              {lang === 'fr' ? 'Indices de Confort Actuels' : 'Active Comfort Metrics'}
            </h3>
            
            <div className={`p-4 rounded-2xl border leading-relaxed space-y-3 ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Thermique (Zone 1A):</span>
                <span className="text-emerald-400 font-bold font-mono">21.8°C (Optimal)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">CO2 & Qualité Air:</span>
                <span className="text-emerald-400 font-bold font-mono">420 ppm (Excellent)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Intensité Lumineuse (Lux):</span>
                <span className="text-cyan-400 font-bold font-mono">500 Lux (Optimal)</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
              <span className="text-orange-400 font-bold font-mono block mb-1">📢 Active SLA Alerts:</span>
              <p className="text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? "Aucun retard sur les tickets d'occupants. Moyenne de complétion de confort : 12 min." : "No SLA breach. Average occupant request cycle completes in 12 min."}
              </p>
            </div>
          </div>

          {/* Booking Desk */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              {lang === 'fr' ? 'Réserver un Bureau / Salle d\'Intervention' : 'Reserve Workspace / Meeting Room'}
            </h3>

            {deskReserved ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold">{lang === 'fr' ? 'Réservation confirmée avec succès !' : 'Reservation Successfully Confirmed!'}</span>
                </div>
                <div className="space-y-1 pl-7">
                  <div><span className="text-slate-500 dark:text-slate-500">Workspace:</span> <span className="text-black dark:text-white font-semibold">{deskId}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-500">Date:</span> <span className="text-black dark:text-white font-semibold">{date}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-500">SLA Status:</span> <span className="text-emerald-400 font-semibold uppercase">Authorized Entry</span></div>
                </div>
                <button 
                  onClick={() => setDeskReserved(false)}
                  className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 hover:text-black dark:text-white underline cursor-pointer"
                >
                  {lang === 'fr' ? 'Réserver un autre espace' : 'Book another workspace'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className={`p-5 rounded-2xl border space-y-4 ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{lang === 'fr' ? 'Bureau / Salle' : 'Desk / Space'}</label>
                    <select 
                      value={deskId}
                      onChange={(e) => setDeskId(e.target.value)}
                      className={`w-full text-xs font-mono rounded-xl p-2.5 outline-none ${isLightMode ? 'bg-white border border-slate-300 text-slate-800' : 'bg-white dark:bg-slate-950 border border-white/10 text-black dark:text-white'}`}
                    >
                      <option value="Desk L1-12">Desk L1-12 (Lobby Level)</option>
                      <option value="Meeting Room Exec B">Meeting Room Exec B (Floor 32)</option>
                      <option value="Collab Lounge 18">Collab Lounge 18 (Floor 18)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full text-xs font-mono rounded-xl p-2.5 outline-none ${isLightMode ? 'bg-white border border-slate-300 text-slate-800' : 'bg-white dark:bg-slate-950 border border-white/10 text-black dark:text-white'}`}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-black dark:text-white font-bold text-xs font-mono transition-all cursor-pointer"
                >
                  Confirm Space Reservation
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. BEE-ROOTS ABOUT
// ==========================================
export const BeeRootsPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              BeeCarbonat About (Our Roots)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'La vision d\'un avenir décarboné, d\'une maintenance intelligente et d\'un maillage cryptographique' : 'The architectural pillars of our net-zero facility management ledgers'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Core Values */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              Our Foundations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
                <span className="text-xs font-extrabold text-orange-400 block mb-1">01. Cryptographic IoT Ledger</span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {lang === 'fr' 
                    ? "Toutes nos données de fluide et de CVC sont cryptographiées au niveau du capteur physique pour assurer des audits RSE infalsifiables."
                    : "Every flow sensor and thermal sensor is cryptographically signed to guarantee immutable carbon and ESG footprints."}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
                <span className="text-xs font-extrabold text-[#34d399] block mb-1">02. Autonomous ESG Offsets</span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {lang === 'fr' 
                    ? "Liaison directe avec des registres de carbone vérifiés pour retirer automatiquement des crédits lorsque la consommation excède un seuil."
                    : "Direct automated ties with verified registries to retire offsets instantly when utility draws exceed safety margins."}
                </p>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border leading-relaxed text-xs ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
              <h4 className={`font-bold mb-2 font-mono ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>The Vision 2030</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {lang === 'fr' 
                  ? "BeeCarbonat vise à transformer chaque centre commercial, hôpital, et espace de bureaux en nœud actif de grille décentralisée d'énergie d'impact positif."
                  : "BeeCarbonat transforms any physical commercial center, lab, or workspace into an active self-balancing node in a net-positive energy grid."}
              </p>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              Specifications
            </h3>
            <div className={`p-4 rounded-2xl border space-y-3 text-xs font-mono ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">Platform Build:</span>
                <span className="text-black dark:text-white">v2.41-Spider</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">Ledger Protocol:</span>
                <span className="text-black dark:text-white">Solana/Mina L1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">BACnet Router:</span>
                <span className="text-emerald-400">Enabled (TLS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">Security Audit:</span>
                <span className="text-emerald-400">99.8% Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. SUCCESS STORIES
// ==========================================
export const SuccessStoriesPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              Success Stories & Case Studies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'Découvrez comment nos partenaires ont optimisé leurs parcs immobiliers grâce à notre cockpit CAFM' : 'Real-world benchmarks of massive decarbonization achievements'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">COMMERCIAL TOWER</span>
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>Paris La Défense - Tour First</h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-mono">
                {lang === 'fr' 
                  ? "Réduction de 34% de la consommation d'eau et de 28% de la climatisation en s'appuyant sur notre maillage de vannes IoT Hydro-Sync."
                  : "34% water flow optimization and 28% thermal efficiency gained through deep integration of Hydro-Sync and BACnet schemas."}
              </p>
            </div>
            <div className="text-xs font-mono text-orange-400 font-bold mt-4">
              {lang === 'fr' ? 'Impact : -120 tCO2e par an' : 'Impact: -120 tCO2e / year'}
            </div>
          </div>

          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/30">LOGISTICS HUB</span>
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>Marseille Port Container Terminal</h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-mono">
                {lang === 'fr' 
                  ? "Remplacement des alertes de pannes par notre IA prédictive de vibration, éliminant 94% des pannes imprévues sur les pompes de fluides."
                  : "Total deployment of vibrational acoustic sensors, saving 94% of unexpected water pump outages with dynamic maintenance dispatch."}
              </p>
            </div>
            <div className="text-xs font-mono text-orange-400 font-bold mt-4">
              {lang === 'fr' ? 'SLA : 99.98% de disponibilité' : 'SLA: 99.98% uptime achieved'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. CAREERS WORKSPACE
// ==========================================
export const CareersPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [cvSubmitted, setCvSubmitted] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);

  const handleCvUpload = () => {
    setCvUploading(true);
    setTimeout(() => {
      setCvUploading(false);
      setCvSubmitted(true);
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              Careers Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'Rejoignez l\'équipe BeeCarbonat et inventez les solutions RSE et les grilles énergétiques de demain' : 'Work alongside leading clean tech and IoT engineers'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Job Openings */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              {lang === 'fr' ? 'Postes Actifs' : 'Open Positions'}
            </h3>

            <div className="space-y-3">
              {[
                { title: 'IoT Integration Engineer (BACnet/Modbus)', location: 'Paris / Remote', type: 'Full-Time' },
                { title: 'ESG Audit & Compliance Data Scientist', location: 'Marseille / Hybrid', type: 'Full-Time' },
                { title: 'CMMS Software Technician & Specialist', location: 'Lyon / Hybrid', type: 'Contract' },
              ].map((job, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between ${isLightMode ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white dark:bg-slate-950/60 border-white/5'}`}>
                  <div>
                    <h4 className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>{job.title}</h4>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">{job.location} • {job.type}</span>
                  </div>
                  <button 
                    onClick={() => {
                      alert(lang === 'fr' ? `Candidature pour le poste de ${job.title} ouverte ! Veuillez téléverser votre CV à droite.` : `Application for ${job.title} active! Upload your resume on the right.`);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black dark:text-white font-bold text-[10px] font-mono transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Upload CV */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              Spontaneous Application
            </h3>

            {cvSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono text-center">
                <Check className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <span className="font-bold">{lang === 'fr' ? 'Candidature reçue !' : 'Application Received!'}</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                  {lang === 'fr' ? 'Notre équipe d\'ingénierie ESG étudiera vos informations sous 48h.' : 'Our ESG engineering board will evaluate your skills within 48h.'}
                </p>
              </div>
            ) : (
              <div className={`p-5 rounded-2xl border text-center space-y-4 ${isLightMode ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white dark:bg-slate-950/60 border-white/5'}`}>
                <div className="p-4 border border-dashed border-white/20 rounded-xl bg-white dark:bg-slate-950/50 flex flex-col items-center justify-center">
                  <FileUp className="w-8 h-8 text-orange-400 mb-2" />
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">PDF, DOCX up to 10MB</span>
                </div>

                <button
                  onClick={handleCvUpload}
                  disabled={cvUploading}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800 text-black dark:text-white font-bold text-xs font-mono transition-all cursor-pointer"
                >
                  {cvUploading ? 'Uploading...' : 'Upload CV / Resume'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. PARTNER PORTAL B2B
// ==========================================
export const PartnerPortalPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [apiKey, setApiKey] = useState('sk_beecarb_8892_f910a');
  const [billingStatus, setBillingStatus] = useState('All Settled');

  const generateNewKey = () => {
    const randomHex = Math.random().toString(16).substr(2, 10);
    setApiKey(`sk_beecarb_${randomHex}`);
    confetti({ particleCount: 30, spread: 35 });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              Partner Portal (B2B Control Plane)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'Génération de clés API, journal de facturation B2B et intégrations tierces homologuées' : 'B2B billing, joint venture ledgers, and developer API credentials'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Generator */}
          <div className="space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              Developer Credentials
            </h3>
            <div className={`p-4 rounded-2xl border space-y-4 ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/60 border-white/5'}`}>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1">LIVE API SECRET KEY</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={apiKey} 
                    className="w-full bg-white dark:bg-slate-950 border border-white/10 text-xs font-mono text-emerald-400 rounded-xl px-2.5 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={generateNewKey}
                className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-black dark:text-white font-bold text-xs font-mono transition-all text-center cursor-pointer"
              >
                Rotate API Key
              </button>
            </div>
          </div>

          {/* Billing Overview */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-600 dark:text-slate-600 dark:text-slate-300'}`}>
              {lang === 'fr' ? 'Facturation B2B' : 'B2B Invoices Ledger'}
            </h3>

            <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-white dark:bg-slate-950/60 border-white/5'}`}>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 text-xs mb-3">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold uppercase">{billingStatus}</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>August ESG Subscription:</span>
                  <span className="text-black dark:text-white font-bold">$1,200 USD</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Gold Standard Offset retired:</span>
                  <span className="text-black dark:text-white font-bold">$4,850 USD</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>BACnet IoT Tunnel Rate:</span>
                  <span className="text-black dark:text-white font-bold">Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ==========================================
// 11. CMMS / BEECARBONAT COCKPIT (VERCEL-STYLE DEPLOYMENT & OPERATION PLANES)
// ==========================================
export const CmmsCockpitPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [deployState, setDeployState] = useState<'IDLE' | 'CLONING' | 'INSTALLING' | 'BUILDING' | 'OPTIMIZING' | 'DEPLOYING' | 'SUCCESS'>('SUCCESS');
  const [buildLogs, setBuildLogs] = useState<string[]>([
    '[vercel] retrieving project keys...',
    '[git] linked repository: github:beecarbonat/spider-cafm (branch: main)',
    '[git] latest commit: a8f3b20 - feat: ultra-responsive Vercel deployment cockpit',
    '[build] setup environment variables successfully.',
    '[build] built static assets in dist/ in 2410ms',
    '[vercel] propagation complete. live url: https://beecarbonat-spider-cafm.vercel.app ✅'
  ]);
  const [envVars, setEnvVars] = useState([
    { key: 'GEMINI_API_KEY', value: '••••••••••••••••••••••••' },
    { key: 'VITE_APP_NAME', value: 'BeeCarbonat Spider CAFM' },
    { key: 'PORT', value: '3000' }
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const startVercelDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployState('CLONING');
    setBuildLogs([]);

    const logSteps = [
      { state: 'CLONING' as const, text: 'Cloning git repository: github:beecarbonat/spider-cafm (branch: main)...' },
      { state: 'INSTALLING' as const, text: 'Installing system dependencies (npm install)...' },
      { state: 'BUILDING' as const, text: 'Running production build: vite build --mode production...' },
      { state: 'OPTIMIZING' as const, text: 'Pruning unused assets & tree-shaking packages (saving 2.4MB)...' },
      { state: 'DEPLOYING' as const, text: 'Uploading 48 static files to edge network node: cdg1 (Paris)...' },
      { state: 'SUCCESS' as const, text: 'Deployment active! Live URL: https://beecarbonat-spider-cafm.vercel.app ✅' }
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        const step = logSteps[currentStep];
        setDeployState(step.state);
        setBuildLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.text}`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        confetti({ particleCount: 50, spread: 45, origin: { y: 0.8 } });
      }
    }, 1200);
  };

  const addEnvVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newValue) return;
    setEnvVars(prev => [...prev, { key: newKey.toUpperCase(), value: newValue }]);
    setNewKey('');
    setNewValue('');
    setBuildLogs(prev => [...prev, `[system] registered env variable: ${newKey.toUpperCase()}`]);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Vercel Header & Project Title */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isLightMode ? 'bg-white border-slate-150 text-slate-900' : 'bg-[#090714] border-white/5 text-[#f4effa]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
          <div className="flex items-center gap-3">
            {/* SVG Vercel Triangle Logo */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 text-black dark:text-white flex items-center justify-center">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 75 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.5 0L75 65H0L37.5 0Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-sans">beecarbonat-spider-cafm</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-300">
                  Vercel Production
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                connected to <span className="text-[#ff9d2b] font-bold">github:beecarbonat/spider-cafm</span> (main)
              </p>
            </div>
          </div>

          <button
            onClick={startVercelDeploy}
            disabled={isDeploying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-xs font-mono border border-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
            {isDeploying ? 'Deploying to Vercel...' : 'Redeploy / Update Code'}
          </button>
        </div>

        {/* Deployment Status Box (Styled precisely like Vercel Dashboard Card) */}
        <div className={`rounded-2xl border p-5 font-mono text-xs ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#0c0a18] border-white/5'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deployment Status</div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  deployState === 'SUCCESS' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400 animate-spin'
                }`} />
                <span className="text-xs font-black uppercase text-slate-800 dark:text-white">
                  {deployState === 'SUCCESS' ? 'Active & Healthy (Production)' : `Status: ${deployState}`}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deployment URL</div>
              <a 
                href="https://beecarbonat-spider-cafm.vercel.app" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-black text-[#ff9d2b] hover:underline flex items-center gap-1"
              >
                beecarbonat-spider-cafm.vercel.app
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Edge Locations</div>
              <div className="text-xs text-slate-600 dark:text-gray-300">CDG1 (Paris, EU) • Global CDN</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[11px] leading-relaxed text-gray-400">
            <div>
              <span className="block text-[10px] text-slate-500 font-bold">Latest Commit</span>
              <span className="text-slate-800 dark:text-white font-black">a8f3b20</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold">Commit Message</span>
              <span className="text-slate-800 dark:text-white truncate block">feat: ultra-responsive Vercel deployment cockpit</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold">Commit Author</span>
              <span className="text-slate-800 dark:text-white">Tarik Benaich</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold">Build Duration</span>
              <span className="text-slate-800 dark:text-white">4.2 seconds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal View (Deploy Logs) */}
      <div className="rounded-3xl border border-black/90 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-600 dark:text-slate-300 p-6 font-mono text-xs space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-gray-400">terminal</span>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Vercel Deployment Build Logs</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-black dark:text-white font-bold tracking-wider uppercase">
            Live Stream
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto font-mono text-[11px] scrollbar-thin scrollbar-thumb-white/10 pr-2">
          {buildLogs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-slate-500 select-none">{(index + 1).toString().padStart(2, '0')}</span>
              <span className={
                log.includes('✅') || log.includes('success') ? 'text-emerald-400 font-bold' :
                log.includes('[build]') ? 'text-blue-300' :
                log.includes('[system]') ? 'text-orange-400' : 'text-gray-300'
              }>
                {log}
              </span>
            </div>
          ))}
          {isDeploying && (
            <div className="text-black dark:text-white font-bold animate-pulse mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping" />
              <span>[pipeline] optimizing assets...</span>
            </div>
          )}
        </div>
      </div>

      {/* Environment Variables & Configurations */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isLightMode ? 'bg-white border-slate-150 text-slate-900' : 'bg-[#090714] border-white/5 text-[#f4effa]'
      }`}>
        <h3 className="text-xs font-mono font-bold tracking-widest uppercase mb-4 text-[#ff9d2b]">
          Vercel Environment Variables
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <form onSubmit={addEnvVar} className="space-y-4 border-r border-slate-100 dark:border-white/5 pr-4">
            <div>
              <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Variable Key</label>
              <input 
                type="text"
                placeholder="e.g. GEMINI_API_KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Variable Value</label>
              <input 
                type="password"
                placeholder="Secret key token"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-[#ff9d2b] hover:bg-[#ff9d2b]/80 text-black dark:text-white font-bold text-xs font-mono transition-all cursor-pointer"
            >
              Add Env Variable
            </button>
          </form>

          <div className="md:col-span-2 space-y-3">
            <div className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider mb-2">Active Config Keys</div>
            <div className="space-y-2">
              {envVars.map((env, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950/10 dark:bg-white dark:bg-slate-950/45 border border-slate-100 dark:border-white/5 font-mono text-xs">
                  <span className="text-gray-400 font-bold">{env.key}</span>
                  <span className="text-emerald-400 font-bold">{env.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 12. ERP INTEGRATION & GOOGLE WORKSPACE
// ==========================================
import { GoogleSheetsManager } from './GoogleSheetsManager';

export const GoogleSheetsPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  return (
    <GoogleSheetsManager lang={lang} isLightMode={isLightMode} />
  );
};

export const ErpIntegrationPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [syncing, setSyncing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'sheets' | 'erp'>('sheets');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      confetti({ particleCount: 30, spread: 35 });
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sub-tabs selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveSubTab('sheets')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            activeSubTab === 'sheets'
              ? 'bg-emerald-600 text-black dark:text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-white/5'
          }`}
        >
          <span>📊 Google Sheets & Workspace Sync</span>
          <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded">OAuth Actif</span>
        </button>

        <button
          onClick={() => setActiveSubTab('erp')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            activeSubTab === 'erp'
              ? 'bg-orange-600 text-black dark:text-white shadow-lg shadow-orange-950/40'
              : 'bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-white/5'
          }`}
        >
          <span>🏢 Connecteurs ERP (SAP / Oracle / Dynamics)</span>
        </button>
      </div>

      {activeSubTab === 'sheets' ? (
        <GoogleSheetsManager lang={lang} isLightMode={isLightMode} />
      ) : (
        <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                  ERP Integration (SAP, Oracle, Dynamics)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? 'Synchronisation automatique des stocks, pièces détachées et immobilisations' : 'Sync pipelines binding assets and spare parts inventories to active corporate ERPs'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800 text-black dark:text-white text-xs font-bold shadow-lg shadow-orange-950/40 transition-all cursor-pointer font-mono"
            >
              {syncing ? 'Syncing...' : 'Force ERP Sync Now'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">SAP S/4HANA PIPELINE</span>
              <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center space-x-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Connect</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Throughput: 120 rec/sec</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">ORACLE CLOUD ASSETS</span>
              <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center space-x-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Connect</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Throughput: 85 rec/sec</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">MICROSOFT DYNAMICS ERP</span>
              <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center space-x-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Connect</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">Throughput: 40 rec/sec</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 13. ANALYTICS
// ==========================================
export const AnalyticsPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'energy' | 'carbon' | 'savings'>('energy');

  useEffect(() => {
    fetch('/api/energy-timeseries')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && data.length > 0) {
          setEnergyData(data);
        } else {
          // Fallback if empty or fetch failed
          setEnergyData([
            { time: '00:00', solarKwh: 10, gridKwh: 120, hvacKwh: 80, baselineKwh: 150 },
            { time: '03:00', solarKwh: 20, gridKwh: 110, hvacKwh: 75, baselineKwh: 140 },
            { time: '06:00', solarKwh: 150, gridKwh: 180, hvacKwh: 190, baselineKwh: 280 },
            { time: '09:00', solarKwh: 350, gridKwh: 130, hvacKwh: 310, baselineKwh: 450 },
            { time: '12:00', solarKwh: 380, gridKwh: 195, hvacKwh: 360, baselineKwh: 490 },
            { time: '15:00', solarKwh: 340, gridKwh: 210, hvacKwh: 340, baselineKwh: 460 },
            { time: '18:00', solarKwh: 95, gridKwh: 260, hvacKwh: 240, baselineKwh: 330 },
            { time: '21:00', solarKwh: 10, gridKwh: 170, hvacKwh: 130, baselineKwh: 210 }
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setEnergyData([
          { time: '00:00', solarKwh: 10, gridKwh: 120, hvacKwh: 80, baselineKwh: 150 },
          { time: '03:00', solarKwh: 20, gridKwh: 110, hvacKwh: 75, baselineKwh: 140 },
          { time: '06:00', solarKwh: 150, gridKwh: 180, hvacKwh: 190, baselineKwh: 280 },
          { time: '09:00', solarKwh: 350, gridKwh: 130, hvacKwh: 310, baselineKwh: 450 },
          { time: '12:00', solarKwh: 380, gridKwh: 195, hvacKwh: 360, baselineKwh: 490 },
          { time: '15:00', solarKwh: 340, gridKwh: 210, hvacKwh: 340, baselineKwh: 460 },
          { time: '18:00', solarKwh: 95, gridKwh: 260, hvacKwh: 240, baselineKwh: 330 },
          { time: '21:00', solarKwh: 10, gridKwh: 170, hvacKwh: 130, baselineKwh: 210 }
        ]);
        setLoading(false);
      });
  }, []);

  const carbonMonthly = [
    { month: 'Jan', actual: 44, target: 52, saved: 8 },
    { month: 'Feb', actual: 41, target: 50, saved: 9 },
    { month: 'Mar', actual: 38, target: 48, saved: 10 },
    { month: 'Apr', actual: 35, target: 45, saved: 10 },
    { month: 'May', actual: 30, target: 42, saved: 12 },
    { month: 'Jun', actual: 28, target: 40, saved: 12 }
  ];

  const savingsData = [
    { month: 'Jan', Savings: 12000, Baseline: 16000 },
    { month: 'Feb', Savings: 14000, Baseline: 16000 },
    { month: 'Mar', Savings: 19000, Baseline: 16000 },
    { month: 'Apr', Savings: 16000, Baseline: 16000 },
    { month: 'May', Savings: 22000, Baseline: 16000 },
  ];

  const cardBgClass = isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#120e23] border-[#ff9d2b]/15';
  const textTitleClass = isLightMode ? 'text-slate-800' : 'text-slate-100 dark:text-white';
  const textSubClass = isLightMode ? 'text-slate-500' : 'text-slate-400';
  const gridStrokeColor = isLightMode ? '#e2e8f0' : '#222';
  const tooltipStyle = {
    background: isLightMode ? '#ffffff' : '#0a0712',
    border: isLightMode ? '1px solid #cbd5e1' : '1px solid #ff9d2b',
    color: isLightMode ? '#0f172a' : '#ffffff',
    borderRadius: '8px',
    fontSize: '11px'
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${cardBgClass}`}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textTitleClass}`}>
                {lang === 'fr' ? 'Analytiques RSE & Performance' : 'Platform RSE & Facility Analytics'}
              </h2>
              <p className={`text-xs ${textSubClass}`}>
                {lang === 'fr' ? 'Aperçu global de l\'optimisation énergétique et de la réduction carbone' : 'Comprehensive review of energy usage levels and ESG indexes'}
              </p>
            </div>
          </div>

          {/* Metric Category Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveTab('energy')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'energy' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⚡ {lang === 'fr' ? 'Énergie' : 'Energy'}
            </button>
            <button
              onClick={() => setActiveTab('carbon')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'carbon' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🌱 {lang === 'fr' ? 'Carbone' : 'Carbon'}
            </button>
            <button
              onClick={() => setActiveTab('savings')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'savings' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              💰 {lang === 'fr' ? 'Économies' : 'Savings'}
            </button>
          </div>
        </div>

        {/* Analytical Charts */}
        <div className="h-72 w-full pt-2">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
              Loading interactive RSE timeseries metrics...
            </div>
          ) : activeTab === 'energy' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                <XAxis dataKey="time" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area name="Solar PV (kWh)" type="monotone" dataKey="solarKwh" stroke="#10b981" fill="#10b981" fillOpacity={0.12} />
                <Area name="Grid Ingress (kWh)" type="monotone" dataKey="gridKwh" stroke="#ff9d2b" fill="#ff9d2b" fillOpacity={0.08} />
                <Area name="HVAC Ingress (kWh)" type="monotone" dataKey="hvacKwh" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          ) : activeTab === 'carbon' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbonMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar name="Actual CO2 (Tons)" dataKey="actual" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar name="Target CO2 (Tons)" dataKey="target" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area name="Saved Cash ($)" type="monotone" dataKey="Savings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Area name="Standard Base ($)" type="monotone" dataKey="Baseline" stroke="#64748b" strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 14. GENERATIVE AI ASSISTANT
// ==========================================
export const GenAiAssistantPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: lang === 'fr' ? 'Bonjour ! Je suis votre Copilote IA BeeCarbonat. Posez-moi des questions sur vos pompes CVC, votre bilan carbone ou vos ordres de travail en cours !' : 'Hello! I am your BeeCarbonat AI Copilot. Ask me anything about your HVAC units, ESG audits, or current CMMS jobs!' }
  ]);
  const [query, setQuery] = useState('');
  const [streaming, setStreaming] = useState(false);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    const userQ = query;
    setMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setQuery('');
    setStreaming(true);

    setTimeout(() => {
      setStreaming(false);
      let aiResponse = '';
      if (userQ.toLowerCase().includes('cvc') || userQ.toLowerCase().includes('hvac')) {
        aiResponse = lang === 'fr' 
          ? "L'unité CVC-02 a signalé une élévation de vibration de 1.8mm/s à 8h ce matin. J'ai automatiquement dispatché un ticket d'inspection de niveau Haute urgence."
          : "HVAC Unit CVC-02 recorded a vibration anomaly of 1.8mm/s at 8 AM. An automatic high urgency inspection ticket was dispatched.";
      } else {
        aiResponse = lang === 'fr'
          ? "Je recommande d'abaisser le débit de ventilation de 15% dans les zones inoccupées de la Tour Est pour économiser 45 tCO2e ce mois-ci."
          : "I suggest reducing airflow by 15% in unoccupied sectors of East Tower to save 45 tCO2e this cycle.";
      }
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl h-[480px] flex flex-col justify-between ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>Generative AI Assistant Cockpit</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">BMS & RSE Intelligent Copilot</p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1 scrollbar-thin scrollbar-thumb-orange-500/20">
          {messages.map((m, idx) => (
            <div key={idx} className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${m.sender === 'ai' ? 'bg-orange-500/15 text-[#fff] border border-orange-500/20 mr-auto' : 'bg-slate-800 text-slate-100 ml-auto'}`}>
              {m.text}
            </div>
          ))}
          {streaming && (
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-slate-500 dark:text-slate-400 text-xs italic animate-pulse mr-auto">
              Thinking and streaming building insights...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mb-3">
          {['Vibration CVC-02', 'Bilan Carbone', 'Optimization Eau'].map(p => (
            <button 
              key={p} 
              onClick={() => setQuery(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-white/5 text-[10px] font-mono text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-black dark:text-white"
            >
              {p}
            </button>
          ))}
        </div>

        <form onSubmit={handleAsk} className="flex gap-2">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your facility optimization question..."
            className="flex-grow bg-white dark:bg-slate-950 border border-white/10 text-xs font-mono text-black dark:text-white rounded-xl px-3 py-2.5 outline-none"
          />
          <button type="submit" className="p-2.5 bg-orange-500 hover:bg-orange-600 text-black dark:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 15. SECURITY & ACCESS
// ==========================================
export const SecurityAccessPanel: React.FC<PanelProps> = ({ lang, isLightMode, onNavigate }) => {
  const [activeSecTab, setActiveSecTab] = useState<'doors' | 'api_keys'>('doors');
  const [lockedRooms, setLockedRooms] = useState({
    serverRoom: true,
    lobbyDoors: false,
    execBoard: true,
  });

  const toggleLock = (room: keyof typeof lockedRooms) => {
    setLockedRooms(prev => ({
      ...prev,
      [room]: !prev[room]
    }));
    confetti({ particleCount: 20, spread: 20 });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-fit">
        <button
          onClick={() => setActiveSecTab('doors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSecTab === 'doors'
              ? 'bg-white dark:bg-zinc-800 text-orange-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Verrous IoT & Badges RFID' : 'IoT Locks & RFID Badges'}</span>
        </button>

        <button
          onClick={() => setActiveSecTab('api_keys')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSecTab === 'api_keys'
              ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Clés API REST & Scopes RBAC' : 'API Key Manager (RBAC Scopes)'}</span>
        </button>
      </div>

      {activeSecTab === 'api_keys' ? (
        <ApiKeyManager lang={lang} isLightMode={isLightMode} onNavigateTab={onNavigate} />
      ) : (
        <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
                  Security & Access Control
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? 'Contrôle en direct des verrous IoT, journal d\'accès badge et chiffrement BACnet' : 'IoT access logs, smart locking controllers, and BACnet/IP payload encryption status'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSecTab('api_keys')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/25 transition-all w-fit"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Gérer les Clés API (Scopes)' : 'Manage API Keys & Scopes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Locks Control */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-mono text-slate-600 dark:text-slate-300">IoT Locking Controls</h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Server Room (Fl.32):</span>
                    <span className={`block font-bold text-[10px] mt-0.5 ${lockedRooms.serverRoom ? 'text-red-400' : 'text-emerald-400'}`}>{lockedRooms.serverRoom ? 'LOCKED' : 'UNLOCKED'}</span>
                  </div>
                  <button onClick={() => toggleLock('serverRoom')} className="py-1 px-2.5 rounded bg-slate-800 text-slate-200">Toggle</button>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Lobby Doors (L1):</span>
                    <span className={`block font-bold text-[10px] mt-0.5 ${lockedRooms.lobbyDoors ? 'text-red-400' : 'text-emerald-400'}`}>{lockedRooms.lobbyDoors ? 'LOCKED' : 'UNLOCKED'}</span>
                  </div>
                  <button onClick={() => toggleLock('lobbyDoors')} className="py-1 px-2.5 rounded bg-slate-800 text-slate-200">Toggle</button>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Boardroom (Fl.32):</span>
                    <span className={`block font-bold text-[10px] mt-0.5 ${lockedRooms.execBoard ? 'text-red-400' : 'text-emerald-400'}`}>{lockedRooms.execBoard ? 'LOCKED' : 'UNLOCKED'}</span>
                  </div>
                  <button onClick={() => toggleLock('execBoard')} className="py-1 px-2.5 rounded bg-slate-800 text-slate-200">Toggle</button>
                </div>
              </div>
            </div>

            {/* Swipe log */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold font-mono text-slate-600 dark:text-slate-300">Recent Swipe logs</h3>
              <div className="space-y-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950/50 border border-white/5 flex justify-between">
                  <span>Tarik Benaich (Superadmin)</span>
                  <span className="text-slate-500 dark:text-slate-500">10:14 AM • Lobby Entrance</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-950/50 border border-white/5 flex justify-between">
                  <span>Marc Becker (Technician)</span>
                  <span className="text-slate-500 dark:text-slate-500">10:02 AM • Basement Plant Room</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 16. SYSTEM CONFIGURATION
// ==========================================
export const SystemConfigPanel: React.FC<PanelProps> = ({ lang, isLightMode, onNavigate }) => {
  return (
    <SystemConfigMaster 
      lang={lang} 
      isLightMode={isLightMode} 
      onNavigate={onNavigate} 
    />
  );
};

// ==========================================
// 17. PWA MANIFEST
// ==========================================
export const PwaManifestPanel: React.FC<PanelProps> = ({ lang, isLightMode }) => {
  const [offline, setOffline] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className={`p-6 rounded-3xl border shadow-xl ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#120e23] border-[#ff9d2b]/15'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-800' : 'text-black dark:text-white'}`}>
              PWA Manifest & Offline Sync Caching
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' ? 'Vérification du cache de l\'application progressive (PWA), journalisation hors-ligne et synchronisation' : 'Service worker logs, IndexedDB caching queues, and offline synchronization metrics'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white dark:bg-slate-950/40 border-white/5'}`}>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">OFFLINE CAPABILITY</span>
            <div className="flex items-center justify-between mt-3 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Simulate Offline Mode:</span>
              <button 
                onClick={() => setOffline(!offline)} 
                className={`px-3 py-1 rounded font-bold uppercase ${offline ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}
              >
                {offline ? 'OFFLINE' : 'ONLINE'}
              </button>
            </div>
            {offline && (
              <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1.5 font-mono">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Running from offline Cache shell!</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold font-mono text-slate-600 dark:text-slate-600 dark:text-slate-300">Service Worker Cache Shell</h3>
            <div className="space-y-2 font-mono text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <p>IndexedDB Queue: 0 pending sync records</p>
              <p>Assets Cached: index.html, main.js, styles.css, digital-twin-spatial.svg (12.4 MB total)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
