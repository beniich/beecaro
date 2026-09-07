import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Sun, 
  Moon, 
  Sliders, 
  Clock, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Power,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface LightingCityPulseProps {
  lang?: 'fr' | 'en';
}

const mockLightingProfile = [
  { time: '06:00', intensityPct: 20, luxNatural: 120 },
  { time: '08:00', intensityPct: 60, luxNatural: 450 },
  { time: '12:00', intensityPct: 40, luxNatural: 950 },
  { time: '16:00', intensityPct: 75, luxNatural: 380 },
  { time: '19:00', intensityPct: 90, luxNatural: 80 },
  { time: '22:00', intensityPct: 30, luxNatural: 0 },
  { time: '02:00', intensityPct: 15, luxNatural: 0 },
];

export const LightingCityPulse: React.FC<LightingCityPulseProps> = ({ lang = 'fr' }) => {
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('zone-1');
  const [globalBrightness, setGlobalBrightness] = useState<number>(75);
  const [colorTemperatureK, setColorTemperatureK] = useState<number>(4000);
  const [circadianAutoMode, setCircadianAutoMode] = useState<boolean>(true);
  const [lightingPowered, setLightingPowered] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch real lighting zones on component mount
  useEffect(() => {
    fetch('/api/lighting/zones')
      .then((res) => res.json())
      .then((data) => {
        setZones(data);
        const active = data.find((z: any) => z.id === selectedZone) || data[0];
        if (active) {
          setSelectedZone(active.id);
          setGlobalBrightness(active.brightness ?? 75);
          setColorTemperatureK(active.colorTemp ?? 4000);
          setCircadianAutoMode(active.circadianMode ?? true);
          setLightingPowered(active.powerStatus ?? true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading lighting zones:', err);
        setLoading(false);
      });
  }, []);

  // Update backend and local state for any attribute change
  const updateZoneAttribute = async (updates: any) => {
    // 1. Update local state instantly for extreme responsiveness
    setZones((prev) =>
      prev.map((z) => (z.id === selectedZone ? { ...z, ...updates } : z))
    );
    // 2. Persist to Neon Postgres backend
    try {
      await fetch(`/api/lighting/zones/${selectedZone}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Error saving lighting state to backend:', err);
    }
  };

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
    const z = zones.find((x) => x.id === zoneId);
    if (z) {
      setGlobalBrightness(z.brightness ?? 75);
      setColorTemperatureK(z.colorTemp ?? 4000);
      setCircadianAutoMode(z.circadianMode ?? true);
      setLightingPowered(z.powerStatus ?? true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-xs text-slate-500">
        {lang === 'fr' ? 'Chargement des données DALI-2 Zhaga...' : 'Loading DALI-2 Zhaga grid systems...'}
      </div>
    );
  }

  return (
    <div id="lighting-city-pulse-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
            <Lightbulb className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-2">
              {lang === 'fr' ? 'Éclairage Intelligent & City Pulse' : 'Lighting - City Pulse & Smart Luminaire Grid'}
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DALI-2 / Zhaga Mesh
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {lang === 'fr'
                ? 'Gestion dynamique de la gradation circadienne, asservissement luxmètres et détection de présence'
                : 'Dynamic circadian dimming, daylight harvesting sensors and occupancy-triggered lighting'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-3 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">{lang === 'fr' ? 'Économie Énergie' : 'Energy Savings'}</div>
              <div className="text-amber-400 font-bold">-46.2% vs Std</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Points Lumineux</div>
              <div className="text-black dark:text-white font-bold">799 LED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Zones List */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            {lang === 'fr' ? 'Zones d\'Éclairage Pilotées' : 'Managed Luminaire Zones'}
          </h3>

          <div className="space-y-2">
            {zones.map((z) => {
              const isSelected = selectedZone === z.id;
              return (
                <div
                  key={z.id}
                  onClick={() => handleZoneSelect(z.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/50 shadow-md shadow-amber-950/30 text-white'
                      : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold">{z.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{z.luminaires} luminaires</span>
                        <span>•</span>
                        <span className="text-amber-400/90">{z.protocol}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{z.consumptionKw} kW</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center/Right Column: Circadian Controls & Daylight Curve */}
        <div className="lg:col-span-8 space-y-6">
          {/* Circadian Dimming & Lux Controls */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                {lang === 'fr' ? 'Paramètres d\'Intensité & Température de Couleur' : 'Intensity & Color Temp Modulation'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const nextVal = !lightingPowered;
                    setLightingPowered(nextVal);
                    updateZoneAttribute({ powerStatus: nextVal });
                  }}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono ${
                    lightingPowered ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{lightingPowered ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">{lang === 'fr' ? 'Intensité Lumineuse :' : 'Brightness Level:'}</span>
                  <span className="text-amber-300 font-bold">{globalBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={globalBrightness}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setGlobalBrightness(val);
                    updateZoneAttribute({ brightness: val });
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">{lang === 'fr' ? 'Température Circadienne :' : 'Color Temperature:'}</span>
                  <span className="text-amber-300 font-bold">{colorTemperatureK} K</span>
                </div>
                <input
                  type="range"
                  min="2700"
                  max="6500"
                  step="100"
                  value={colorTemperatureK}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setColorTemperatureK(val);
                    updateZoneAttribute({ colorTemp: val });
                  }}
                  className="w-full h-2 bg-gradient-to-r from-amber-500 via-yellow-200 to-sky-300 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-white dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  {lang === 'fr' 
                    ? 'Synchronisation Rythme Circadien & Daylight Harvesting' 
                    : 'Circadian Rhythm Sync & Natural Daylight Harvesting'}
                </span>
              </div>
              <button
                onClick={() => {
                  const nextVal = !circadianAutoMode;
                  setCircadianAutoMode(nextVal);
                  updateZoneAttribute({ circadianMode: nextVal });
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  circadianAutoMode ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {circadianAutoMode ? 'IA CIRCADIEN ACTIF' : 'MANUEL'}
              </button>
            </div>
          </div>

          {/* 24h Profile Chart */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
              {lang === 'fr' ? 'Courbe d\'Intensité 24h vs Lumière Naturelle (Lux)' : '24h Dimming Profile vs Ambient Natural Lux'}
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockLightingProfile}>
                  <defs>
                    <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="intensityPct" stroke="#f59e0b" strokeWidth={2} fill="url(#lightGradient)" name="Intensité LED (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
