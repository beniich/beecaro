import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  PlusCircle,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface PredictiveMaintenanceProps {
  onSelectAsset?: (assetId: string) => void;
  openNewTicketModal?: () => void;
  lang?: 'fr' | 'en';
}

const mockVibrationTrend = [
  { time: '00:00', vibration: 1.2, baseline: 1.5, threshold: 3.5 },
  { time: '04:00', vibration: 1.4, baseline: 1.5, threshold: 3.5 },
  { time: '08:00', vibration: 2.1, baseline: 1.5, threshold: 3.5 },
  { time: '12:00', vibration: 3.2, baseline: 1.5, threshold: 3.5 },
  { time: '16:00', vibration: 3.9, baseline: 1.5, threshold: 3.5 },
  { time: '20:00', vibration: 3.6, baseline: 1.5, threshold: 3.5 },
  { time: '24:00', vibration: 3.8, baseline: 1.5, threshold: 3.5 },
];

const mockDegradationDistribution = [
  { category: 'CVC / HVAC', healthy: 88, atRisk: 12 },
  { category: 'Électrique', healthy: 94, atRisk: 6 },
  { category: 'Plomberie', healthy: 82, atRisk: 18 },
  { category: 'Ascenseurs', healthy: 75, atRisk: 25 },
  { category: 'Solaire PV', healthy: 97, atRisk: 3 },
];

export const PredictiveMaintenance: React.FC<PredictiveMaintenanceProps> = ({
  openNewTicketModal,
  lang = 'fr'
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<string>('anom-1');
  const [autoDispatchStatus, setAutoDispatchStatus] = useState<Record<string, boolean>>({});

  const anomalies = [
    {
      id: 'anom-1',
      assetName: lang === 'fr' ? 'Pompe Centrifuge Primaire PC-02' : 'Centrifugal Water Pump PC-02',
      code: 'PLUMB-PC02',
      location: lang === 'fr' ? 'Sous-Sol - Local Technique B' : 'Basement Tech Room B',
      system: 'Plumbing / HVAC Loop',
      riskScore: 92,
      anomalyType: lang === 'fr' ? 'Vibration Harmonique & Cavitation' : 'Harmonic Vibration & Cavitation',
      estimatedTimeToFailure: lang === 'fr' ? '48 heures' : '48 hours',
      actionNeeded: lang === 'fr' ? 'Remplacement du roulement à billes SKF 6205' : 'Replace bearing SKF 6205',
      confidence: 96,
      status: 'critical'
    },
    {
      id: 'anom-2',
      assetName: lang === 'fr' ? 'Centrale Traitement Air CTA-04' : 'Air Handling Unit AHU-04',
      code: 'CTA-04-R',
      location: lang === 'fr' ? 'Toiture - Zone Nord' : 'Roof Sector North',
      system: 'HVAC Airflow',
      riskScore: 78,
      anomalyType: lang === 'fr' ? 'Encrassement Filtre & Surpression' : 'Filter Clogging & Delta-P Surge',
      estimatedTimeToFailure: lang === 'fr' ? '5 jours' : '5 days',
      actionNeeded: lang === 'fr' ? 'Changement filtre F7 plissé + réglage courroie' : 'Change F7 filter + belt tensioning',
      confidence: 89,
      status: 'warning'
    },
    {
      id: 'anom-3',
      assetName: lang === 'fr' ? 'Moteur Traction Ascenseur Passager 02' : 'Elevator 02 Traction Motor',
      code: 'ELEV-02-M',
      location: lang === 'fr' ? 'Machinerie Étage 34' : 'Machine Room Fl.34',
      system: 'Vertical Transport',
      riskScore: 68,
      anomalyType: lang === 'fr' ? 'Élévation Thermique Bobinage (+18°C)' : 'Coil Temperature Rise (+18°C)',
      estimatedTimeToFailure: lang === 'fr' ? '8 jours' : '8 days',
      actionNeeded: lang === 'fr' ? 'Contrôle thermographique & lubrification guidage' : 'Thermography check & lubrication',
      confidence: 91,
      status: 'warning'
    }
  ];

  const handleDispatch = (id: string) => {
    setAutoDispatchStatus(prev => ({ ...prev, [id]: true }));
    if (openNewTicketModal) {
      setTimeout(() => {
        openNewTicketModal();
      }, 600);
    }
  };

  return (
    <div id="predictive-maintenance-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/40">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-2">
              {lang === 'fr' ? 'Maintenance Prédictive & Diagnostics IA' : 'Predictive Maintenance & AI Diagnostics'}
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {lang === 'fr' ? '3 Risques Détectés' : '3 Anomalies'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {lang === 'fr' 
                ? 'Analyse spectrale continue, vibrations FFT et prévisions de défaillance MTBF' 
                : 'Continuous spectral FFT vibration analysis, thermal telemetry and MTBF forecasts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-3 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">{lang === 'fr' ? 'Précision Algorithmique' : 'AI Accuracy'}</div>
              <div className="text-emerald-400 font-bold">98.4% F1-Score</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">{lang === 'fr' ? 'Arrêts Évités' : 'Downtime Avoided'}</div>
              <div className="text-black dark:text-white font-bold">342 h (YTD)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Anomaly Feed & Deep Vibration Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Urgent Anomaly Cards */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {lang === 'fr' ? 'Anomalies Prioritaires Détectées' : 'Critical Asset Health Alerts'}
          </h3>

          <div className="space-y-3">
            {anomalies.map((anom) => {
              const isSelected = selectedAnomaly === anom.id;
              const isDispatched = autoDispatchStatus[anom.id];

              return (
                <div
                  key={anom.id}
                  onClick={() => setSelectedAnomaly(anom.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-slate-900 border-rose-500/50 shadow-xl shadow-rose-950/30 ring-1 ring-rose-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${
                        anom.status === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white">{anom.assetName}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>{anom.code}</span>
                          <span>•</span>
                          <span>{anom.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        anom.status === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {lang === 'fr' ? `Risque ${anom.riskScore}%` : `Risk ${anom.riskScore}%`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 bg-white dark:bg-slate-950/70 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-500">{lang === 'fr' ? 'Diagnostic :' : 'Diagnosis:'}</span>
                      <span className="font-semibold text-rose-300">{anom.anomalyType}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-500">{lang === 'fr' ? 'Temps avant panne estimé :' : 'Est. Time to Failure:'}</span>
                      <span className="font-mono text-amber-400 font-bold">{anom.estimatedTimeToFailure}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-500">{lang === 'fr' ? 'Action préconisée :' : 'Recommended Action:'}</span>
                      <span className="text-slate-200">{anom.actionNeeded}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {lang === 'fr' ? `Indice de confiance IA : ${anom.confidence}%` : `AI Confidence: ${anom.confidence}%`}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDispatch(anom.id);
                      }}
                      disabled={isDispatched}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        isDispatched
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-600 hover:bg-rose-500 text-black dark:text-white shadow-md shadow-rose-950/40'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{lang === 'fr' ? 'Ordre Généré' : 'Dispatched'}</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{lang === 'fr' ? 'Générer Ordre Immédiat' : 'Dispatch Work Order'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: FFT Harmonic Vibration & Degradation Chart */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vibration Telemetry Curve */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {lang === 'fr' ? 'Spectre Vibratoire 24h (mm/s)' : 'Harmonic Vibration Telemetry (mm/s)'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Pompe PC-02 vs Seuil ISO 10816-3</p>
              </div>
              <span className="text-rose-400 font-mono text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                +153% Over Baseline
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockVibrationTrend}>
                  <defs>
                    <linearGradient id="vibrationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 5]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="vibration" stroke="#f43f5e" strokeWidth={2} fill="url(#vibrationGradient)" name="Vibration (mm/s)" />
                  <Area type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" fill="none" name="Critical Threshold" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>Seuil Alarme : 3.5 mm/s</span>
              <span className="text-rose-400 font-bold">Actuel : 3.8 mm/s</span>
            </div>
          </div>

          {/* Asset Category Risk Distribution */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
              {lang === 'fr' ? 'Santé du Parc par Catégorie' : 'Equipment Category Health Index'}
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDegradationDistribution} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="healthy" stackId="a" fill="#10b981" name="Opérationnel (%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="atRisk" stackId="a" fill="#f43f5e" name="En Surveillance (%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>{lang === 'fr' ? 'Optimal' : 'Healthy'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>{lang === 'fr' ? 'Dégradation Détectée' : 'At Risk'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
