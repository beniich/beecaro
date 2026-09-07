import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  Gauge, 
  Activity, 
  Sliders, 
  Power,
  RefreshCw,
  TrendingDown,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface WaterHydroSyncProps {
  lang?: 'fr' | 'en';
}

const mockWaterFlow = [
  { time: '06:00', flowRateM3h: 12.4, expectedM3h: 12.0 },
  { time: '08:00', flowRateM3h: 24.8, expectedM3h: 22.5 },
  { time: '10:00', flowRateM3h: 31.2, expectedM3h: 26.0 },
  { time: '12:00', flowRateM3h: 38.5, expectedM3h: 30.0 }, // anomaly peak
  { time: '14:00', flowRateM3h: 34.1, expectedM3h: 28.0 },
  { time: '16:00', flowRateM3h: 27.9, expectedM3h: 25.0 },
  { time: '18:00', flowRateM3h: 19.4, expectedM3h: 18.0 },
];

export const WaterHydroSync: React.FC<WaterHydroSyncProps> = ({ lang = 'fr' }) => {
  const [sectors, setSectors] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('sector-4');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch real sectors on load
  useEffect(() => {
    fetch('/api/water/sectors')
      .then((res) => res.json())
      .then((data) => {
        setSectors(data);
        const hasActive = data.find((s: any) => s.id === selectedSector) || data[0];
        if (hasActive) {
          setSelectedSector(hasActive.id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching water sectors:', err);
        setLoading(false);
      });
  }, []);

  const updateSectorAttribute = async (sectorId: string, updates: any) => {
    // 1. Optimistic updates for incredible responsiveness
    setSectors((prev) =>
      prev.map((s) => (s.id === sectorId ? { ...s, ...updates } : s))
    );
    // 2. Persist to Neon Postgres backend
    try {
      await fetch(`/api/water/sectors/${sectorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Error saving water sector state to backend:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-xs text-slate-500">
        {lang === 'fr' ? 'Chargement de la télémétrie hydraulique...' : 'Loading hydraulic mesh telemetries...'}
      </div>
    );
  }

  const currentSectorObj = sectors.find((s) => s.id === selectedSector) || sectors[0];
  const sector4Obj = sectors.find((s) => s.id === 'sector-4') || currentSectorObj;

  return (
    <div id="water-hydro-sync-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/40">
            <Droplets className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-2">
              {lang === 'fr' ? 'Surveillance Hydraulique & Détection de Fuites' : 'Water - Hydro Sync & Leak Telemetry'}
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {lang === 'fr' ? 'Réseau Connecté' : 'Mesh Live'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {lang === 'fr'
                ? 'Supervision temps réel des débitmètres électromagnétiques, pressostats et vannes motorisées'
                : 'Real-time telemetry of electromagnetic flowmeters, pressure transducers and automated valves'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-3 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">{lang === 'fr' ? 'Économies Réalisées' : 'Water Saved'}</div>
              <div className="text-cyan-400 font-bold">1,840 m³ (YTD)</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase">{lang === 'fr' ? 'Taux Recyclage' : 'Recycling Rate'}</div>
              <div className="text-emerald-400 font-bold">42.8%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Map + Telemetry Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Isometric Pipeline SVG Diagram */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                {lang === 'fr' ? 'Schéma Synoptique du Réseau Hydraulique' : 'Hydraulic Synoptic Network Map'}
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Pression Générale : 4.1 bar</span>
            </div>

            {/* SVG Visualizer with glowing pipelines */}
            <div className="relative w-full aspect-[16/9] bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 p-4 flex items-center justify-center overflow-hidden">
              {/* Background grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              <svg viewBox="0 0 600 320" className="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {/* City grid lines */}
                <path d="M50 280 L300 160 L550 280" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                <path d="M100 240 L300 140 L500 240" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" fill="none" />

                {/* Primary Pipes */}
                <path d="M60 80 L250 180 L360 120 L520 220" stroke={sector4Obj?.valveOpen ? "#06b6d4" : "#475569"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M250 180 L250 280 L420 290" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M360 120 L480 80" stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                {/* Anomaly Highlight on Sector 4 */}
                {sector4Obj?.status === 'warning' && (
                  <>
                    <circle cx="360" cy="120" r="18" fill="#f43f5e" fillOpacity="0.25" className="animate-ping" />
                    <circle cx="360" cy="120" r="10" fill="#f43f5e" />
                    <text x="380" y="115" fill="#fca5a5" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      {lang === 'fr' ? 'Micro-Fuite Secteur 4' : 'Leak Sector 4'}
                    </text>
                  </>
                )}

                {/* Nodes */}
                <circle cx="60" cy="80" r="6" fill="#06b6d4" />
                <text x="50" y="65" fill="#94a3b8" fontSize="10" fontFamily="monospace">Arrivée Eau</text>

                <circle cx="250" cy="180" r="6" fill="#06b6d4" />
                <text x="260" y="185" fill="#94a3b8" fontSize="10" fontFamily="monospace">Vanne Principale V-01</text>

                <circle cx="520" cy="220" r="6" fill="#10b981" />
                <text x="470" y="245" fill="#6ee7b7" fontSize="10" fontFamily="monospace">Tour Nord</text>
              </svg>
            </div>
          </div>

          {/* Sector 4 Micro-leak alert box */}
          {sector4Obj && (
            <div className={`mt-4 p-3.5 rounded-xl bg-white dark:bg-slate-950/80 border flex items-center justify-between gap-4 ${
              sector4Obj.status === 'warning' ? 'border-rose-500/30' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${sector4Obj.status === 'warning' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {sector4Obj.status === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black dark:text-white">
                    {sector4Obj.status === 'warning'
                      ? (lang === 'fr' ? 'Détection Anomalie Débit Secteur 4 (Boucle CVC)' : 'Flow Anomaly Detected in Sector 4')
                      : (lang === 'fr' ? 'Secteur 4 CVC : Statut Optimal' : 'Sector 4 HVAC: Optimal Status')
                    }
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {sector4Obj.status === 'warning'
                      ? (lang === 'fr' ? 'Débit anormalement élevé (+28% vs consigne). Chute de pression locale à 2.8 bar.' : 'Unusual flow rate (+28% above normal). Local pressure drop to 2.8 bar.')
                      : (lang === 'fr' ? 'Aucune fuite détectée. Les débits de retour sont nominaux.' : 'No leak detected. Return flow rates are nominal.')
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const nextValveState = !sector4Obj.valveOpen;
                  const updates: any = { valveOpen: nextValveState };
                  if (!nextValveState) {
                    updates.status = 'optimal'; // mitigation resolves warning state
                    updates.leakMitigated = true;
                    updates.flow = 12.0; // nominal flow
                    updates.pressure = 4.1; // normal pressure
                  } else {
                    updates.status = 'warning';
                    updates.leakMitigated = false;
                    updates.flow = 38.5;
                    updates.pressure = 2.8;
                  }
                  updateSectorAttribute('sector-4', updates);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  !sector4Obj.valveOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40'
                }`}
              >
                {!sector4Obj.valveOpen 
                  ? (lang === 'fr' ? 'Ouvrir Vanne V-04' : 'Open Valve V-04') 
                  : (lang === 'fr' ? 'Isoler Vanne V-04' : 'Isolate Valve V-04')}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sector Breakdown & Live Flow Chart */}
        <div className="lg:col-span-5 space-y-6">
          {/* Flow Rate Curve */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {lang === 'fr' ? 'Débit Instantané (m³/h)' : 'Instant Flow Rate (m³/h)'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Mesure continue vs Consigne nominale</p>
              </div>
              <span className="text-cyan-400 font-mono text-xs font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Live {currentSectorObj?.flow ?? 38.5} m³/h
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWaterFlow.map(f => {
                  if (f.time === '12:00' && currentSectorObj?.flow !== undefined) {
                    return { ...f, flowRateM3h: currentSectorObj.flow };
                  }
                  return f;
                })}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="flowRateM3h" stroke="#06b6d4" strokeWidth={2} fill="url(#waterGradient)" name="Débit Réel (m³/h)" />
                  <Area type="monotone" dataKey="expectedM3h" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" fill="none" name="Consigne (m³/h)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Selection List */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
              {lang === 'fr' ? 'Secteurs & Capteurs de Pression' : 'Water Distribution Sectors'}
            </h3>

            <div className="space-y-2">
              {sectors.map((sec) => {
                const isSelected = selectedSector === sec.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSector(sec.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500/50 shadow-md shadow-cyan-950/30 text-white'
                        : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-2 h-2 rounded-full ${
                        sec.status === 'optimal' ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
                      }`} />
                      <span className="font-semibold">{sec.name}</span>
                    </div>

                    <div className="flex items-center space-x-3 font-mono text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">{sec.pressure} bar</span>
                      <span className="text-cyan-400 font-bold">{sec.flow} m³/h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
