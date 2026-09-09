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
    <div id="executive-dashboard-view" className="space-y-3.5">
      {/* Top Banner with Platform Status & Quick Action */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                ECO-INTELLIGENCE AI v4.2
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">Real-time Telemetry Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Executive Facility Operations & ESG Hub
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl">
              Centralized telemetry orchestration across <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{buildings.length} smart facilities</span>, monitoring 1,420 IoT nodes, automated HVAC chiller thermodynamic curves, and carbon neutrality goals.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('digital-twin')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0051c3] text-white hover:bg-blue-600 transition-all text-xs font-semibold shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Launch 3D Digital Twin</span>
            </button>
            <button
              onClick={() => onNavigateTab('esg-sustainability')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-200 transition-all text-xs font-medium border border-slate-200 dark:border-zinc-700"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>ESG Carbon Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Matrix Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          id="metric-energy-demand"
          title="Instant Power Demand"
          value="482.4"
          unit="kW"
          changePercent={-8.4}
          trend="down"
          status="optimal"
          subtitle="Rooftop solar offsetting 41.5%"
          icon={<Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
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
          icon={<Leaf className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
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
          icon={<Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />}
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
          icon={<AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
          onClick={() => onNavigateTab('cmms')}
        />
      </div>

      {/* Primary Analytics Section: Energy Load vs Generation & Carbon Reduction Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 gap-2">
            <div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  24-Hour Energy Telemetry Profile (Smart Grid vs Solar)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Synchronous feed across building sub-meters, HVAC chiller plant, and rooftop bifacial solar PV
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-slate-100 dark:bg-zinc-950 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 flex text-xs">
                <button
                  onClick={() => setEnergyMode('consumption')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-colors text-xs ${
                    energyMode === 'consumption'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Energy (kWh)
                </button>
                <button
                  onClick={() => setEnergyMode('carbon')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-colors text-xs ${
                    energyMode === 'carbon'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Carbon Saved
                </button>
              </div>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              {energyMode === 'consumption' ? (
                <AreaChart data={energySeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="hvacGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Area type="monotone" dataKey="solarKwh" name="Solar (kW)" stroke="#10b981" fillOpacity={1} fill="url(#solarGradient)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="gridKwh" name="Grid Import (kW)" stroke="#3b82f6" fillOpacity={1} fill="url(#gridGradient)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="hvacKwh" name="HVAC Cooling (kW)" stroke="#f59e0b" fillOpacity={1} fill="url(#hvacGradient)" strokeWidth={1.5} />
                </AreaChart>
              ) : (
                <BarChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="target" name="Baseline Target (tCO2e)" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Emissions (tCO2e)" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saved" name="Carbon Avoided (tCO2e)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-3 mt-1 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">Peak Solar Output</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-mono font-bold text-sm">380.0 kW</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">Grid Offset Ratio</span>
              <span className="text-blue-500 dark:text-blue-400 font-mono font-bold text-sm">44.8%</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">Estimated Cost Saved</span>
              <span className="text-slate-900 dark:text-zinc-100 font-mono font-bold text-sm">$14,280 /mo</span>
            </div>
          </div>
        </div>

        {/* Environmental & ESG Live Telemetry Stream */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-1.5">
                <Leaf className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Real-time ESG & Sensor Pulse
                </h3>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded border border-emerald-500/30">
                LEED Platinum
              </span>
            </div>

            <div className="space-y-2 mt-3">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-900 text-amber-500 dark:text-amber-400">
                    <SunMedium className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-900 dark:text-zinc-200 block">Solar Rooftop Energy</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Campus B Microgrid</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold text-xs block">342.9 MWh</span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400">+18% vs 2025</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-900 text-blue-500 dark:text-blue-400">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-900 dark:text-zinc-200 block">HydroSync Water Recycled</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Greywater Treatment</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-blue-500 dark:text-blue-400 font-bold text-xs block">1.84M Liters</span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400">97.4% Purity</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-900 text-teal-500 dark:text-teal-400">
                    <Wind className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-900 dark:text-zinc-200 block">Indoor Air Quality (IAQ)</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Laser VOC/CO2 Matrix</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-teal-500 dark:text-teal-300 font-bold text-xs block">AQI 22 (Optimal)</span>
                  <span className="text-[9px] text-emerald-500 dark:text-emerald-400">415 ppm CO2</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-900 text-amber-500 dark:text-amber-400">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-900 dark:text-zinc-200 block">Waste Diversion Rate</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Circular Composting</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-amber-500 dark:text-amber-400 font-bold text-xs block">84.5%</span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400">Zero-to-Landfill</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('esg-sustainability')}
            className="w-full mt-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Explore Full ESG & Carbon Market</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Buildings Portfolio Grid & Priority Work Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Buildings Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Managed Facilities ({activeBuildings.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('leases')}
              className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-mono"
            >
              View Occupancy & Leases →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeBuildings.map((building) => (
              <div
                key={building.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-zinc-700 rounded-xl p-3.5 transition-all duration-200 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{building.name}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{building.code} • {building.address}</span>
                  </div>
                  <StatusBadge status={building.status} />
                </div>

                <div className="grid grid-cols-3 gap-1.5 py-1.5 border-y border-slate-100 dark:border-zinc-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[9px]">Floors/Area</span>
                    <span className="text-slate-900 dark:text-zinc-200 font-semibold">{building.floors} fl / {(building.areaSqM / 1000).toFixed(1)}k m²</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[9px]">Occupancy</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{building.occupancyRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-zinc-500 block text-[9px]">Carbon Int.</span>
                    <span className="text-blue-500 dark:text-blue-400 font-semibold">{building.carbonIntensity} kg/m²</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Health Index:</span>
                    <span className="font-bold text-emerald-500 dark:text-emerald-400 font-mono text-xs">{building.healthScore}%</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('digital-twin')}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 text-xs"
                  >
                    <span>Inspect 3D Twin</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Work Orders Queue */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Active CMMS Tickets ({activeTickets.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('cmms')}
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline"
              >
                All Orders →
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 space-y-1.5 mt-2">
              {activeTickets.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onOpenTicket(ticket.id)}
                  className="pt-1.5 pb-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800/50 p-2 rounded-lg cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-blue-500 dark:text-blue-400 font-bold">{ticket.ticketNumber}</span>
                    <StatusBadge status={ticket.priority} />
                  </div>
                  <h4 className="text-xs font-medium text-slate-900 dark:text-zinc-200 line-clamp-1">{ticket.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                    <span>{ticket.buildingName.split(' ')[0]} • {ticket.floor}</span>
                    <span className="font-mono text-slate-600 dark:text-zinc-300">{ticket.assignedTechnician.name.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('cmms')}
            className="w-full mt-3 py-2 rounded-lg bg-[#0051c3] text-white hover:bg-blue-600 text-xs font-semibold transition-all text-center shadow-sm"
          >
            Dispatch & Manage Work Orders
          </button>
        </div>
      </div>
    </div>
  );
};
