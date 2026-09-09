import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../../services/api';

interface GrafanaCockpitProps {
  lang: 'fr' | 'en';
  isLightMode?: boolean;
  onNavigate?: (page: string) => void;
}

export const GrafanaCockpit: React.FC<GrafanaCockpitProps> = ({
  lang,
  isLightMode = false,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'logs' | 'query' | 'datasources' | 'export'>('dashboard');
  const [timeRange, setTimeRange] = useState<string>('last-30m');
  const [refreshInterval, setRefreshInterval] = useState<number>(5); // seconds, 0 = off
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');

  // Query Editor state
  const [queryInput, setQueryInput] = useState<string>('SELECT id, name, category, status, health_score FROM assets ORDER BY health_score ASC LIMIT 10;');
  const [queryType, setQueryType] = useState<'sql' | 'promql'>('sql');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState<boolean>(false);

  // Selected metric filter in dashboard
  const [selectedFacility, setSelectedFacility] = useState<string>('all');

  // Fetch Grafana Data
  const fetchData = async () => {
    try {
      const [ovData, metData, altData, lgData] = await Promise.all([
        api.getGrafanaOverview(),
        api.getGrafanaMetrics(timeRange),
        api.getGrafanaAlerts(),
        api.getGrafanaLogs(logLevel)
      ]);

      if (ovData) setOverview(ovData);
      if (metData?.series) setMetrics(metData.series);
      if (altData) setAlerts(altData);
      if (lgData) setLogs(lgData);
      setLastRefreshed(new Date());
    } catch (e) {
      console.warn('Grafana fetch notice:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange, logLevel]);

  // Live Auto-Refresh Interval Loop
  useEffect(() => {
    if (refreshInterval === 0) return;
    const timer = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [refreshInterval, timeRange, logLevel]);

  // Handle Query Run
  const handleRunQuery = async () => {
    setQueryLoading(true);
    try {
      const res = await api.executeGrafanaQuery(queryInput, queryType);
      setQueryResult(res);
    } catch (err: any) {
      setQueryResult({ success: false, error: err.message });
    } finally {
      setQueryLoading(false);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchText = logSearch === '' || 
        l.message.toLowerCase().includes(logSearch.toLowerCase()) || 
        l.service.toLowerCase().includes(logSearch.toLowerCase());
      return matchText;
    });
  }, [logs, logSearch]);

  // Calculate live stats
  const latestMetric = metrics[metrics.length - 1] || {
    cpuUsage: 38.5,
    memoryPoolMb: 435,
    networkRps: 1350,
    chillerPowerKw: 142.4,
    lightingPowerKw: 29.1,
    solarOutputKw: 98.6,
    waterFlowLpm: 34.2,
    waterPressureBar: 4.12,
    chillerTempC: 18.4,
    co2IntensityGpkwh: 184
  };

  const firingAlertsCount = alerts.filter(a => a.state === 'firing').length;

  return (
    <div className={`w-full min-h-screen ${isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-[#0f1117] text-slate-100'} p-4 md:p-6 transition-colors duration-200 font-sans`}>
      {/* ── Top Grafana Header ───────────────────────────────────────── */}
      <div className={`p-4 md:p-6 rounded-2xl mb-6 border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800 shadow-xl'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <span className="material-symbols-outlined text-2xl">monitoring</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  {lang === 'fr' ? 'Observabilité & Télémétrie Grafana' : 'Grafana Telemetry & Observability'}
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  v11.4 PRO
                </span>
                <span className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-md ${
                  overview?.status === 'operational' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  ● {overview?.status === 'operational' ? (lang === 'fr' ? 'Opérationnel' : 'Operational') : 'Syncing'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'fr'
                  ? 'Hyperviseur temps réel CAFM, BMS IoT, Métriques PostgreSQL/Prometheus, Traces & Logs Loki'
                  : 'Real-time CAFM Hypervisor, BMS IoT, PostgreSQL/Prometheus Metrics, Traces & Loki Logs'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Range Selector */}
            <div className={`flex items-center px-2 py-1 rounded-lg border text-xs font-mono ${isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-[#111319] border-slate-700'}`}>
              <span className="material-symbols-outlined text-sm mr-1 text-slate-400">schedule</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer pr-2"
              >
                <option value="last-5m">{lang === 'fr' ? 'Dernières 5 min' : 'Last 5 min'}</option>
                <option value="last-15m">{lang === 'fr' ? 'Dernières 15 min' : 'Last 15 min'}</option>
                <option value="last-30m">{lang === 'fr' ? 'Dernières 30 min' : 'Last 30 min'}</option>
                <option value="last-1h">{lang === 'fr' ? 'Dernière 1h' : 'Last 1 hour'}</option>
                <option value="last-6h">{lang === 'fr' ? 'Dernières 6h' : 'Last 6 hours'}</option>
                <option value="last-24h">{lang === 'fr' ? 'Dernières 24h' : 'Last 24 hours'}</option>
                <option value="last-7d">{lang === 'fr' ? 'Derniers 7 jours' : 'Last 7 days'}</option>
              </select>
            </div>

            {/* Refresh Rate */}
            <div className={`flex items-center px-2 py-1 rounded-lg border text-xs font-mono ${isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-[#111319] border-slate-700'}`}>
              <span className="material-symbols-outlined text-sm mr-1 text-orange-500 animate-spin" style={{ animationDuration: '6s' }}>sync</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent border-none outline-none cursor-pointer pr-2"
              >
                <option value={2}>2s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={0}>{lang === 'fr' ? 'Désactivé' : 'Off'}</option>
              </select>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={fetchData}
              className={`p-1.5 rounded-lg border text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors ${
                isLightMode ? 'bg-slate-100 border-slate-300 hover:bg-slate-200' : 'bg-[#111319] border-slate-700 hover:bg-slate-800'
              }`}
              title={lang === 'fr' ? 'Actualiser manuellement' : 'Manual Refresh'}
            >
              <span className="material-symbols-outlined text-base">refresh</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            {lang === 'fr' ? 'Tableau de Bord & Métriques' : 'Dashboard & Panels'}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all relative ${
              activeTab === 'alerts'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">notifications_active</span>
            {lang === 'fr' ? 'Règles d\'Alertes' : 'Alert Rules'}
            {firingAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-500 text-white">
                {firingAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'logs'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            {lang === 'fr' ? 'Logs Loki en Direct' : 'Live Loki Logs'}
          </button>

          <button
            onClick={() => setActiveTab('query')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'query'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">terminal</span>
            {lang === 'fr' ? 'Éditeur SQL / PromQL' : 'SQL & PromQL Studio'}
          </button>

          <button
            onClick={() => setActiveTab('datasources')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'datasources'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">storage</span>
            {lang === 'fr' ? 'Sources de Données' : 'Data Sources'}
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'bg-orange-500 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            {lang === 'fr' ? 'Export Modèle JSON' : 'Export JSON Model'}
          </button>
        </div>
      </div>

      {/* ── TAB 1: DASHBOARD PANELS ─────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Stat Gauges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {/* Stat 1: Total Power Consumption */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{lang === 'fr' ? 'Charge Électrique' : 'Power Load'}</span>
                <span className="material-symbols-outlined text-amber-500 text-base">bolt</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono tracking-tight text-amber-500">
                  {latestMetric.chillerPowerKw + latestMetric.lightingPowerKw} <span className="text-xs font-normal">kW</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-xs">arrow_downward</span> -4.2% vs target
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            {/* Stat 2: Solar Ingestion */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{lang === 'fr' ? 'Solaire Photovoltaïque' : 'Solar Output'}</span>
                <span className="material-symbols-outlined text-emerald-500 text-base">solar_power</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono tracking-tight text-emerald-500">
                  {latestMetric.solarOutputKw} <span className="text-xs font-normal">kW</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-xs">arrow_upward</span> +18.5% peak
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            {/* Stat 3: Water HydroSync Flow */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{lang === 'fr' ? 'Débit Fluides' : 'Water Flow'}</span>
                <span className="material-symbols-outlined text-cyan-500 text-base">water_drop</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono tracking-tight text-cyan-500">
                  {latestMetric.waterFlowLpm} <span className="text-xs font-normal">L/min</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  P: {latestMetric.waterPressureBar} bar
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '55%' }} />
              </div>
            </div>

            {/* Stat 4: Chiller Core Temp */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{lang === 'fr' ? 'Température CVC' : 'HVAC Chiller'}</span>
                <span className="material-symbols-outlined text-blue-500 text-base">mode_fan</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono tracking-tight text-blue-500">
                  {latestMetric.chillerTempC} <span className="text-xs font-normal">°C</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Nominal (16-22°C)
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            {/* Stat 5: Ingestion Throughput */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{lang === 'fr' ? 'Ingestion IoT' : 'Ingestion RPS'}</span>
                <span className="material-symbols-outlined text-indigo-500 text-base">speed</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono tracking-tight text-indigo-500">
                  {latestMetric.networkRps} <span className="text-xs font-normal">req/s</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Latence: 12ms
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            {/* Stat 6: Carbon Intensity */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>{lang === 'fr' ? 'Intensité Carbone' : 'CO2 Intensity'}</span>
                <span className="material-symbols-outlined text-rose-500 text-base">co2</span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono tracking-tight text-rose-500">
                  {latestMetric.co2IntensityGpkwh} <span className="text-xs font-normal">g/kWh</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  CSRD Scope 2 Verified
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
          </div>

          {/* Primary Multi-Panel Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 1: Smart Metering & Building Power Load */}
            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {lang === 'fr' ? 'Consommation Électrique vs Production Solaire (kW)' : 'Power Grid Consumption vs Solar Output (kW)'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    query: sum(rate(power_kw[1m])) by (circuit)
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Prometheus / InfluxDB
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chillerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : '#2d3748'} vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLightMode ? '#ffffff' : '#1a202c',
                        borderColor: isLightMode ? '#cbd5e1' : '#4a5568',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="chillerPowerKw" name="CVC & Chillers (kW)" stroke="#f59e0b" fillOpacity={1} fill="url(#chillerGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="solarOutputKw" name="Solaire Rooftop (kW)" stroke="#10b981" fillOpacity={1} fill="url(#solarGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="lightingPowerKw" name="Éclairage DALI (kW)" stroke="#6366f1" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 2: Water & Fluids HydroSync Flow Matrix */}
            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    {lang === 'fr' ? 'Télémétrie HydroSync - Débit & Pression Fluides' : 'HydroSync Telemetry - Flow & Pressure'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    query: hydrosync_flow_liters_per_min, hydrosync_pressure_bar
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  BACnet / Modbus
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : '#2d3748'} vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLightMode ? '#ffffff' : '#1a202c',
                        borderColor: isLightMode ? '#cbd5e1' : '#4a5568',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="waterFlowLpm" name="Débit Eau (L/min)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="waterPressureBar" name="Pression (bar x10)" stroke="#ec4899" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 3: Server & Gateway Ingestion Load */}
            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    {lang === 'fr' ? 'Charge Serveur Backend & Pool Mémoire' : 'Backend Server Compute & Memory Pool'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    query: node_cpu_utilization_percent, process_resident_memory_bytes
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Node Exporter
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : '#2d3748'} vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLightMode ? '#ffffff' : '#1a202c',
                        borderColor: isLightMode ? '#cbd5e1' : '#4a5568',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="cpuUsage" name="CPU Usage (%)" stroke="#6366f1" fillOpacity={1} fill="url(#cpuGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="networkRps" name="RPS / 100" stroke="#10b981" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel 4: CMMS Event Velocity & Work Orders Throughput */}
            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {lang === 'fr' ? 'Vélocité Ordres de Travail & Maintenance GMAO' : 'CMMS Work Order Velocity & Resolution Rate'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    query: count_over_time(cmms_work_orders_resolved[1h])
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  PostgreSQL Neon
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : '#2d3748'} vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isLightMode ? '#ffffff' : '#1a202c',
                        borderColor: isLightMode ? '#cbd5e1' : '#4a5568',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="workOrderVelocity" name="Tickets Résolus / Interval" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ALERT RULES ─────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">notification_important</span>
                {lang === 'fr' ? 'Règles d\'Alertes Grafana & Prometheus Alertmanager' : 'Grafana & Prometheus Alertmanager Rules'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' 
                  ? 'Seuils d\'alerte automatisés pour les fluides, l\'énergie, les compresseurs CVC et la conformité CSRD.'
                  : 'Automated alert triggers and thresholds for utilities, energy, HVAC compressors, and CSRD.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-1 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                {firingAlertsCount} FIRING
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  alt.state === 'firing'
                    ? isLightMode ? 'bg-red-50/70 border-red-200' : 'bg-red-950/20 border-red-900/50'
                    : alt.state === 'pending'
                    ? isLightMode ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-900/50'
                    : isLightMode ? 'bg-white border-slate-200' : 'bg-[#181b24] border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    alt.state === 'firing'
                      ? 'bg-red-500 text-white animate-pulse'
                      : alt.state === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    <span className="material-symbols-outlined text-xl">
                      {alt.state === 'firing' ? 'crisis_alert' : alt.state === 'pending' ? 'timelapse' : 'check_circle'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">{alt.title}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                        alt.state === 'firing'
                          ? 'bg-red-500 text-white'
                          : alt.state === 'pending'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {alt.state}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {alt.source}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
                      expr: {alt.rule}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1.5">
                      <span>Valeur actuelle: <strong className="text-slate-900 dark:text-white">{alt.value}</strong></span>
                      <span>Seuil max: <strong className="text-slate-900 dark:text-white">{alt.threshold}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => {
                      setAlerts(prev => prev.map(a => a.id === alt.id ? { ...a, acknowledged: !a.acknowledged } : a));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      alt.acknowledged
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300'
                        : 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {alt.acknowledged ? 'done_all' : 'mark_chat_read'}
                    </span>
                    {alt.acknowledged ? (lang === 'fr' ? 'Acquitté' : 'Acknowledged') : (lang === 'fr' ? 'Acquitter' : 'Acknowledge')}
                  </button>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('work-orders')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        isLightMode ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {lang === 'fr' ? 'Créer Ticket WO' : 'Create Work Order'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: LIVE LOKI LOG STREAM ────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">receipt_long</span>
                {lang === 'fr' ? 'Explorateur de Logs Grafana Loki (Temps Réel)' : 'Grafana Loki Live Log Stream'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                label selector: &#123;app="beecarbonat", cluster="prod-europe-west2"&#125;
              </p>
            </div>

            {/* Filter and search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center px-2 py-1 rounded-lg border text-xs ${isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-[#111319] border-slate-700'}`}>
                <span className="material-symbols-outlined text-sm mr-1 text-slate-400">filter_alt</span>
                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-2 font-mono"
                >
                  <option value="all">ALL LEVELS</option>
                  <option value="info">INFO</option>
                  <option value="warn">WARN</option>
                  <option value="error">ERROR</option>
                  <option value="debug">DEBUG</option>
                </select>
              </div>

              <div className={`flex items-center px-3 py-1 rounded-lg border text-xs ${isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-[#111319] border-slate-700'}`}>
                <span className="material-symbols-outlined text-sm mr-1.5 text-slate-400">search</span>
                <input
                  type="text"
                  placeholder={lang === 'fr' ? 'Filtrer les messages...' : 'Filter log lines...'}
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs w-40 md:w-56"
                />
                {logSearch && (
                  <button onClick={() => setLogSearch('')} className="text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Log Stream Box */}
          <div className="bg-[#0b0d13] text-slate-200 rounded-xl p-4 font-mono text-xs max-h-[500px] overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                {lang === 'fr' ? 'Aucun log ne correspond aux critères de filtre.' : 'No log lines matched the filter.'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 hover:bg-slate-800/40 p-1 rounded transition-colors">
                  <span className="text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toISOString().slice(11, 23)}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                    log.level === 'ERROR'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : log.level === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : log.level === 'DEBUG'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-orange-400 font-semibold whitespace-nowrap">
                    [{log.service}]
                  </span>
                  <span className="text-slate-300 break-all flex-1">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: SQL & PROMQL QUERY STUDIO ───────────────────────── */}
      {activeTab === 'query' && (
        <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">terminal</span>
                {lang === 'fr' ? 'Studio d\'Exécution de Requêtes Directes (SQL & PromQL)' : 'Query Execution Studio (SQL & PromQL)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'fr' 
                  ? 'Exécutez des requêtes directes sur PostgreSQL Neon ou inspectez les séries temporelles Prometheus en temps réel.'
                  : 'Execute real queries on PostgreSQL Neon or explore real-time Prometheus metric streams.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setQueryType('sql');
                  setQueryInput('SELECT id, name, code, category, status, health_score FROM assets WHERE health_score < 90;');
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${
                  queryType === 'sql' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                PostgreSQL SQL
              </button>
              <button
                onClick={() => {
                  setQueryType('promql');
                  setQueryInput('rate(building_power_consumption_kw[5m])');
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${
                  queryType === 'promql' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                PromQL
              </button>
            </div>
          </div>

          {/* Query Editor Box */}
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                rows={4}
                className="w-full bg-[#0b0d13] text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 outline-none focus:border-orange-500 shadow-inner resize-y"
                placeholder={queryType === 'sql' ? 'SELECT * FROM work_orders LIMIT 10;' : 'rate(http_requests_total[5m])'}
              />
              <button
                onClick={handleRunQuery}
                disabled={queryLoading}
                className="absolute bottom-3 right-3 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  {queryLoading ? 'sync' : 'play_arrow'}
                </span>
                {queryLoading ? (lang === 'fr' ? 'Exécution...' : 'Running...') : (lang === 'fr' ? 'Exécuter (Run)' : 'Run Query')}
              </button>
            </div>

            {/* Query Results */}
            {queryResult && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-mono">
                  <span>Résultats ({queryResult.rowCount || queryResult.result?.length || 0} lignes retournées)</span>
                  <span className={queryResult.success ? 'text-emerald-500' : 'text-red-500'}>
                    {queryResult.success ? '● Status 200 OK' : '● Query Error'}
                  </span>
                </div>

                <div className="bg-[#0b0d13] text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-80 overflow-auto">
                  {queryResult.error ? (
                    <div className="text-red-400 font-bold">{queryResult.error}</div>
                  ) : queryResult.rows ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-orange-400">
                          {Object.keys(queryResult.rows[0] || {}).map((key) => (
                            <th key={key} className="p-2">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-900 hover:bg-slate-800/40">
                            {Object.values(row).map((val: any, vIdx: number) => (
                              <td key={vIdx} className="p-2 text-slate-300">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <pre className="text-emerald-400">{JSON.stringify(queryResult, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: DATA SOURCES ────────────────────────────────────── */}
      {activeTab === 'datasources' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">storage</span>
              {lang === 'fr' ? 'Connecteurs de Données Grafana Provisionnés' : 'Provisioned Grafana Data Sources'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fr' 
                ? 'État de santé et latences des passerelles de télémétrie vers la base de données et les brokers IoT.'
                : 'Health state and latency pings across database gateways and IoT telemetry brokers.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(overview?.datasources || [
              { id: 'ds-pg', name: 'PostgreSQL Neon DB', type: 'postgres', status: 'connected', latencyMs: 14 },
              { id: 'ds-firestore', name: 'Google Cloud Firestore', type: 'firestore', status: 'connected', latencyMs: 22 },
              { id: 'ds-prom', name: 'Prometheus BMS Gateway', type: 'prometheus', status: 'connected', latencyMs: 5 },
              { id: 'ds-loki', name: 'Grafana Loki Log Collector', type: 'loki', status: 'connected', latencyMs: 8 },
              { id: 'ds-mqtt', name: 'MQTT / LoRaWAN IoT Ingestion', type: 'mqtt', status: 'connected', latencyMs: 12 }
            ]).map((ds: any) => (
              <div
                key={ds.id}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-[#181b24] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold font-mono text-sm border border-orange-500/20">
                    {ds.type.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{ds.name}</h3>
                    <p className="text-xs font-mono text-slate-500">type: {ds.type}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    ● ACTIVE
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">{ds.latencyMs}ms ping</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: JSON MODEL EXPORT ───────────────────────────────── */}
      {activeTab === 'export' && (
        <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#181b24] border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">file_download</span>
                {lang === 'fr' ? 'Modèle JSON Grafana Prêt à l\'Import' : 'Grafana JSON Dashboard Schema'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                uid: "beecarbonat-cafm-master", schemaVersion: 39
              </p>
            </div>
            <button
              onClick={() => {
                const schema = {
                  annotations: { list: [] },
                  editable: true,
                  title: 'BeeCarbonat CAFM & Telemetry Observatory',
                  uid: 'beecarbonat-cafm-master',
                  version: 1,
                  panels: [
                    { id: 1, title: 'Power Grid vs Solar (kW)', type: 'timeseries' },
                    { id: 2, title: 'HydroSync Water Flow', type: 'timeseries' },
                    { id: 3, title: 'Server CPU & Network RPS', type: 'timeseries' },
                    { id: 4, title: 'CMMS Work Orders Velocity', type: 'barchart' }
                  ]
                };
                navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
                alert(lang === 'fr' ? 'Schéma JSON copié dans le presse-papier !' : 'JSON schema copied to clipboard!');
              }}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              {lang === 'fr' ? 'Copier le JSON' : 'Copy JSON'}
            </button>
          </div>

          <div className="bg-[#0b0d13] text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 max-h-96 overflow-auto">
            <pre>
{JSON.stringify({
  "annotations": { "list": [] },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 1,
  "id": 142,
  "links": [],
  "liveNow": true,
  "panels": [
    {
      "datasource": { "type": "prometheus", "uid": "bms-prom-prod" },
      "fieldConfig": { "defaults": { "unit": "kwatt" } },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "id": 1,
      "title": "Consommation Électrique vs Solaire (kW)",
      "type": "timeseries"
    },
    {
      "datasource": { "type": "postgres", "uid": "neon-db-prod" },
      "fieldConfig": { "defaults": { "unit": "lpm" } },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
      "id": 2,
      "title": "Télémétrie HydroSync Débit Fluides",
      "type": "timeseries"
    },
    {
      "datasource": { "type": "loki", "uid": "loki-logs-prod" },
      "gridPos": { "h": 8, "w": 24, "x": 0, "y": 8 },
      "id": 3,
      "title": "Flux de Logs d'Interventions et d'Alertes",
      "type": "logs"
    }
  ],
  "refresh": "5s",
  "schemaVersion": 39,
  "tags": ["cafm", "beecarbonat", "csrd", "hydrosync", "bms"],
  "time": { "from": "now-30m", "to": "now" },
  "title": "BeeCarbonat CAFM & Telemetry Master Observatory",
  "uid": "beecarbonat-cafm-master",
  "version": 1
}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
