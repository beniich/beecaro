import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Leaf, 
  Activity, 
  Building2, 
  Droplets, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  TrendingDown, 
  TrendingUp,
  Cpu,
  Flame,
  SunMedium,
  Wind,
  Layers,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  CartesianGrid,
  Legend
} from 'recharts';
import { MetricCard } from '../../components/MetricCard';
import { StatusBadge } from '../../components/StatusBadge';
import { NavigationTab, Asset, WorkOrder } from '../../types';
import { api } from '../../services/api';

interface ExecutiveDashboardProps {
  selectedBuildingId: string;
  onNavigateTab: (tab: NavigationTab) => void;
  onInspectAsset: (assetId: string) => void;
  onOpenTicket: (ticketId: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  selectedBuildingId,
  onNavigateTab,
  onInspectAsset,
  onOpenTicket
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'ytd'>('today');
  const [energyMode, setEnergyMode] = useState<'consumption' | 'carbon'>('consumption');

  const [assets, setAssets] = useState<Asset[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<WorkOrder[]>([]);
  const [esgMetrics, setEsgMetrics] = useState<any>(null);
  const [energySeries, setEnergySeries] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch of live records from PostgreSQL backend
    api.getBuildings().then(data => {
      if (data && data.length > 0) setBuildings(data);
    });
    api.getAssets().then(data => {
      if (data && data.length > 0) setAssets(data);
    });
    api.getWorkOrders().then(data => {
      if (data && data.length > 0) setTickets(data);
    });
    api.getEsgMetrics().then(data => {
      if (data) setEsgMetrics(data);
    });
    api.getEnergyTimeSeries().then(data => {
      if (data && data.length > 0) setEnergySeries(data);
    });

    const interval = setInterval(() => {
      api.getAssets().then(data => {
        if (data && data.length > 0) setAssets(data);
      });
      api.getWorkOrders().then(data => {
        if (data && data.length > 0) setTickets(data);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);


  // Filter if specific building selected
  const activeBuildings = selectedBuildingId === 'all' 
    ? buildings 
    : buildings.filter(b => b.id === selectedBuildingId);

  const activeAssets = selectedBuildingId === 'all'
    ? assets
    : assets.filter(a => a.buildingId === selectedBuildingId);

  const activeTickets = selectedBuildingId === 'all'
    ? tickets
    : tickets.filter(w => w.buildingId === selectedBuildingId);

  return (
    <div id="executive-dashboard-view" className="space-y-6">
      {/* Top Banner with Platform Status & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ECO-INTELLIGENCE AI v4.2
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Real-time Telemetry Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white">
              Executive Facility Operations & ESG Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-600 dark:text-slate-300 max-w-2xl">
              Centralized telemetry orchestration across <span className="text-emerald-400 font-semibold">{buildings.length} smart facilities</span>, monitoring 1,420 IoT nodes, automated HVAC chiller thermodynamic curves, and carbon neutrality goals.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('digital-twin')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-bold"
            >
              <Layers className="w-4 h-4" />
              <span>Launch 3D Digital Twin</span>
            </button>
            <button
              onClick={() => onNavigateTab('esg-sustainability')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-black dark:text-white transition-all text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>ESG Carbon Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Matrix Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="metric-energy-demand"
          title="Instant Power Demand"
          value="482.4"
          unit="kW"
          changePercent={-8.4}
          trend="down"
          status="optimal"
          subtitle="Rooftop solar offsetting 41.5%"
          icon={<Zap className="w-5 h-5" />}
          onClick={() => onNavigateTab('esg-sustainability')}
        />

        <MetricCard
          id="metric-carbon-ytd"
          title="Carbon Intensity YTD"
          value="418.2"
          unit="tCO2e"
          changePercent={-19.6}
          trend="down"
          status="optimal"
          subtitle="Ahead of 520t ceiling target"
          icon={<Leaf className="w-5 h-5 text-emerald-400" />}
          onClick={() => onNavigateTab('esg-sustainability')}
        />

        <MetricCard
          id="metric-facility-health"
          title="Average Portfolio Health"
          value="94.2"
          unit="/100"
          changePercent={2.1}
          trend="up"
          status="optimal"
          subtitle="1 degraded asset needing check"
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
          onClick={() => onNavigateTab('assets')}
        />

        <MetricCard
          id="metric-active-tickets"
          title="Active Work Orders"
          value="4"
          unit="tickets"
          changePercent={-14.3}
          trend="down"
          status="warning"
          subtitle="1 critical emergency resolved today"
          icon={<AlertCircle className="w-5 h-5 text-amber-400" />}
          onClick={() => onNavigateTab('cmms')}
        />
      </div>

      {/* Primary Analytics Section: Energy Load vs Generation & Carbon Reduction Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                  24-Hour Energy Telemetry Profile (Smart Grid vs Solar)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synchronous feed across building sub-meters, HVAC chiller plant, and rooftop bifacial solar PV
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-white dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex text-xs">
                <button
                  onClick={() => setEnergyMode('consumption')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    energyMode === 'consumption'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white'
                  }`}
                >
                  Energy (kWh)
                </button>
                <button
                  onClick={() => setEnergyMode('carbon')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    energyMode === 'carbon'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white'
                  }`}
                >
                  Carbon Saved
                </button>
              </div>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {energyMode === 'consumption' ? (
                <AreaChart data={energySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="hvacGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="solarKwh" name="Solar Self-Generation (kW)" stroke="#10b981" fillOpacity={1} fill="url(#solarGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="gridKwh" name="Grid Import (kW)" stroke="#06b6d4" fillOpacity={1} fill="url(#gridGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="hvacKwh" name="HVAC Cooling Load (kW)" stroke="#f59e0b" fillOpacity={1} fill="url(#hvacGradient)" strokeWidth={2} />
                </AreaChart>
              ) : (
                <BarChart data={[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="target" name="Baseline Target (tCO2e)" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Emissions (tCO2e)" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saved" name="Carbon Avoided (tCO2e)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 mt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Peak Solar Output</span>
              <span className="text-emerald-400 font-mono font-bold text-base">380.0 kW</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Grid Offset Ratio</span>
              <span className="text-cyan-400 font-mono font-bold text-base">44.8%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Estimated Cost Saved</span>
              <span className="text-black dark:text-white font-mono font-bold text-base">$14,280 /mo</span>
            </div>
          </div>
        </div>

        {/* Environmental & ESG Live Telemetry Stream */}
        <div className="bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                  Real-time ESG & Sensor Pulse
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                LEED Platinum
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <SunMedium className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Solar Rooftop Energy</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Campus B Microgrid</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold text-sm block">342.9 MWh</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">+18% vs 2025</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">HydroSync Water Recycled</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Greywater Treatment</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-cyan-400 font-bold text-sm block">1.84M Liters</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">97.4% Purity</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Indoor Air Quality (IAQ)</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Laser VOC/CO2 Matrix</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-teal-300 font-bold text-sm block">AQI 22 (Optimal)</span>
                  <span className="text-[10px] text-emerald-400">415 ppm CO2</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Waste Diversion Rate</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Circular Composting</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-amber-400 font-bold text-sm block">84.5%</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Zero-to-Landfill</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('esg-sustainability')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-200 hover:text-black dark:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Explore Full ESG & Carbon Market</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Buildings Portfolio Grid & Priority Work Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buildings Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                Managed Facilities ({activeBuildings.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('leases')}
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              View Occupancy & Leases →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBuildings.map((building) => (
              <div
                key={building.id}
                className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all duration-200 hover:shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">{building.name}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{building.code} • {building.address}</span>
                  </div>
                  <StatusBadge status={building.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 dark:border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Floors/Area</span>
                    <span className="text-slate-200 font-semibold">{building.floors} fl / {(building.areaSqM / 1000).toFixed(1)}k m²</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Occupancy</span>
                    <span className="text-emerald-400 font-semibold">{building.occupancyRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Carbon Int.</span>
                    <span className="text-cyan-400 font-semibold">{building.carbonIntensity} kg/m²</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Health Index:</span>
                    <span className="font-bold text-emerald-400 font-mono">{building.healthScore}%</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('digital-twin')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                  >
                    <span>Inspect 3D Twin</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Work Orders Queue */}
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                  Active CMMS Tickets ({activeTickets.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('cmms')}
                className="text-xs text-emerald-400 hover:underline"
              >
                All Orders →
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 space-y-2 mt-2">
              {activeTickets.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onOpenTicket(ticket.id)}
                  className="pt-2 pb-2 hover:bg-slate-100 dark:hover:bg-slate-800/40 p-2 rounded-lg cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold">{ticket.ticketNumber}</span>
                    <StatusBadge status={ticket.priority} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{ticket.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{ticket.buildingName.split(' ')[0]} • {ticket.floor}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-600 dark:text-slate-300">{ticket.assignedTechnician.name.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('cmms')}
            className="w-full mt-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all text-center"
          >
            Dispatch & Manage Work Orders
          </button>
        </div>
      </div>
    </div>
  );
};
