import React, { useState } from 'react';
import { 
  Wind, 
  Activity, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  TrendingDown, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface AirQualityProps {
  lang?: 'fr' | 'en';
}

const mockAqiHistory = [
  { time: '08:00', aqi: 24, co2: 520, pm25: 8 },
  { time: '10:00', aqi: 32, co2: 680, pm25: 12 },
  { time: '12:00', aqi: 45, co2: 890, pm25: 16 },
  { time: '14:00', aqi: 38, co2: 740, pm25: 14 },
  { time: '16:00', aqi: 28, co2: 610, pm25: 10 },
  { time: '18:00', aqi: 22, co2: 480, pm25: 7 },
];

const sourcePollutionData = [
  { name: 'Véhicules & Extérieur', value: 35, color: '#f59e0b' },
  { name: 'Ventilation & CVC', value: 20, color: '#06b6d4' },
  { name: 'Activité Humaine & CO2', value: 45, color: '#10b981' },
];

export const AirQuality: React.FC<AirQualityProps> = ({ lang = 'fr' }) => {
  const [airRenewalRate, setAirRenewalRate] = useState<number>(85);
  const [damperAutoMode, setDamperAutoMode] = useState<boolean>(true);

  return (
    <div id="air-quality-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-950/40">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-2">
              {lang === 'fr' ? 'Qualité de l\'Air Intérieur (QAI) & Débits CVC' : 'Indoor Air Quality (IAQ) & Airflow'}
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AQI 28 — {lang === 'fr' ? 'Excellent' : 'Good'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {lang === 'fr'
                ? 'Capteurs NDIR CO2, laser optique PM1/2.5/10, COV totaux et asservissement registres d\'air'
                : 'NDIR CO2 sensor mesh, optical PM1/2.5/10, VOC monitoring and damper ventilation control'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-3 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">CO2 Moyen</div>
              <div className="text-emerald-400 font-bold">590 ppm</div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">PM2.5</div>
              <div className="text-teal-400 font-bold">9.2 µg/m³</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Indice AQI Global</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">28 / 500</div>
          <span className="text-[10px] text-emerald-500 font-mono">✓ Conforme standard WELL & RESET</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Concentration CO2</span>
          <div className="text-2xl font-black text-black dark:text-white mt-1">620 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ppm</span></div>
          <span className="text-[10px] text-emerald-400 font-mono">Seuil max : 1,000 ppm</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Composés Organiques (COV)</span>
          <div className="text-2xl font-black text-black dark:text-white mt-1">118 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ppb</span></div>
          <span className="text-[10px] text-emerald-400 font-mono">Niveau optimal</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Taux Renouvellement Air</span>
          <div className="text-2xl font-black text-teal-400 mt-1">{airRenewalRate}%</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">3.4 volumes / heure</span>
        </div>
      </div>

      {/* Main Charts & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CO2 & AQI Trend Chart */}
        <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {lang === 'fr' ? 'Évolution CO2 (ppm) et Particules Fines (PM2.5)' : 'CO2 (ppm) & PM2.5 Hourly Trends'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Impact de l'occupation des étages et de la ventilation adaptative</p>
            </div>
            <span className="text-teal-400 font-mono text-xs bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              Modulation CTA Automatique
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAqiHistory}>
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 10, fill: '#10b981' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{ fontSize: 10, fill: '#06b6d4' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} name="CO2 (ppm)" dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="pm25" stroke="#06b6d4" strokeWidth={2} name="PM2.5 (µg/m³)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: IAQ Damper Control & Source Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Ventilation Control Widget */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              {lang === 'fr' ? 'Pilotage Registres CVC' : 'Ventilation Damper Control'}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Ouverture Registre Air Neuf :</span>
                  <span className="text-teal-300 font-bold">{airRenewalRate}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={airRenewalRate}
                  onChange={(e) => setAirRenewalRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Mode IA Auto-Régulé</span>
                <button
                  onClick={() => setDamperAutoMode(!damperAutoMode)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-colors ${
                    damperAutoMode ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {damperAutoMode ? 'ACTIF' : 'MANUEL'}
                </button>
              </div>
            </div>
          </div>

          {/* Sources pie */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              {lang === 'fr' ? 'Origine des Polluants Détectés' : 'Pollutant Source Distribution'}
            </h3>
            <div className="h-32 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourcePollutionData} dataKey="value" innerRadius={28} outerRadius={48} paddingAngle={4}>
                    {sourcePollutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
