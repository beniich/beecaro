import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  SunMedium, 
  Droplets, 
  Wind, 
  Flame, 
  Award, 
  Coins, 
  TrendingDown, 
  CheckCircle2, 
  Download, 
  ExternalLink,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { MetricCard } from '../../components/MetricCard';
import { api } from '../../services/api';

const defaultEsgData = {
  id: 'default',
  totalCarbonYtdTonnes: 0,
  targetCarbonYtdTonnes: 0,
  carbonReductionPercent: 0,
  scope1KgCo2e: 0,
  scope2KgCo2e: 0,
  scope3KgCo2e: 0,
  solarGeneratedKwh: 0,
  gridImportKwh: 0,
  waterRecycledLiters: 0,
  wasteDiversionRate: 0,
  carbonCreditsOwned: 0,
  carbonCreditsRetired: 0,
  airQualityIndexAvg: 0,
  greenBuildingCert: 'LEED Platinum'
};

export const EsgSuite: React.FC = () => {
  const [esgData, setEsgData] = useState<any>(defaultEsgData);
  const [activeSubTab, setActiveSubTab] = useState<'carbon' | 'market' | 'hydrosync' | 'lighting' | 'iaq'>('carbon');
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getEsgMetrics().then(data => {
      if (data) {
        setEsgData(data);
      }
    });
  }, []);

  const scopeData = [
    { name: 'Scope 1 (Direct Fuel)', value: (esgData.scope1KgCo2e || 0) / 1000, color: '#f59e0b' },
    { name: 'Scope 2 (Electricity)', value: (esgData.scope2KgCo2e || 0) / 1000, color: '#06b6d4' },
    { name: 'Scope 3 (Supply Chain & Commutes)', value: (esgData.scope3KgCo2e || 0) / 1000, color: '#10b981' },
  ];

  const handleRetireCredits = async () => {
    if (tradeAmount <= esgData.carbonCreditsOwned) {
      const updatedCreditsOwned = esgData.carbonCreditsOwned - tradeAmount;
      const updatedCreditsRetired = esgData.carbonCreditsRetired + tradeAmount;
      
      setEsgData((prev: any) => ({
        ...prev,
        carbonCreditsOwned: updatedCreditsOwned,
        carbonCreditsRetired: updatedCreditsRetired
      }));
      
      await api.updateEsgMetrics({
        carbonCreditsOwned: updatedCreditsOwned,
        carbonCreditsRetired: updatedCreditsRetired
      });

      setTradeSuccessMsg(`Successfully retired ${tradeAmount} Verified Carbon Units (VCUs) to achieve net-zero certification in PostgreSQL!`);
      setTimeout(() => setTradeSuccessMsg(null), 5000);
    }
  };

  const handleBuyCredits = async () => {
    const updatedCreditsOwned = esgData.carbonCreditsOwned + tradeAmount;
    setEsgData((prev: any) => ({
      ...prev,
      carbonCreditsOwned: updatedCreditsOwned
    }));
    
    await api.updateEsgMetrics({
      carbonCreditsOwned: updatedCreditsOwned
    });

    setTradeSuccessMsg(`Purchased ${tradeAmount} Gold Standard Carbon Credits saved in PostgreSQL enterprise wallet.`);
    setTimeout(() => setTradeSuccessMsg(null), 5000);
  };


  return (
    <div id="esg-sustainability-suite" className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              CSRD & ESG 2026 AUDIT COMPLIANT
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">ISO 14064-1 Verified</span>
          </div>
          <h1 className="text-2xl font-extrabold text-black dark:text-white">BeeCarbonit ESG & Carbon Market Hub</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            GHG Protocol Scope 1-3 analytics, verified Gold Standard carbon offsets, HydroSync smart water loops, and CityPulse urban lighting energy savings.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="p-3 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-right">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Green Building Status</span>
            <span className="text-emerald-400 font-bold text-sm">{esgData.greenBuildingCert}</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('carbon')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'carbon'
              ? 'bg-emerald-600 text-black dark:text-white shadow-lg shadow-emerald-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>GHG Emissions & Scope 1-3</span>
        </button>

        <button
          onClick={() => setActiveSubTab('market')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'market'
              ? 'bg-emerald-600 text-black dark:text-white shadow-lg shadow-emerald-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Carbon Market & Credit Trading</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hydrosync')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'hydrosync'
              ? 'bg-emerald-600 text-black dark:text-white shadow-lg shadow-emerald-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>HydroSync Water Loops</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lighting')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
            activeSubTab === 'lighting'
              ? 'bg-emerald-600 text-black dark:text-white shadow-lg shadow-emerald-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-black dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <SunMedium className="w-4 h-4" />
          <span>CityPulse Smart Lighting</span>
        </button>
      </div>

      {/* Carbon Ledger View */}
      {activeSubTab === 'carbon' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Scope 1 Direct Emissions"
              value={(esgData.scope1KgCo2e / 1000).toFixed(1)}
              unit="tCO2e"
              subtitle="Gas heating & backup generators"
              changePercent={-12.4}
              trend="down"
              icon={<Flame className="w-5 h-5 text-amber-400" />}
            />
            <MetricCard
              title="Scope 2 Purchased Power"
              value={(esgData.scope2KgCo2e / 1000).toFixed(1)}
              unit="tCO2e"
              subtitle="Electricity & district cooling"
              changePercent={-24.1}
              trend="down"
              icon={<Zap className="w-5 h-5 text-cyan-400" />}
            />
            <MetricCard
              title="Scope 3 Value Chain"
              value={(esgData.scope3KgCo2e / 1000).toFixed(1)}
              unit="tCO2e"
              subtitle="Tenants, freight & waste logistics"
              changePercent={-6.2}
              trend="down"
              icon={<Leaf className="w-5 h-5 text-emerald-400" />}
            />
            <MetricCard
              title="Solar Self-Generation"
              value={(esgData.solarGeneratedKwh / 1000).toFixed(1)}
              unit="MWh"
              subtitle="Bifacial rooftop arrays"
              changePercent={18.9}
              trend="up"
              icon={<SunMedium className="w-5 h-5 text-emerald-300" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scope Distribution Chart */}
            <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
              <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-2">
                GHG Protocol Scope 1-3 Distribution (tCO2e)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scopeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regulatory Certification Scorecard */}
            <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                      ESG Certification Accreditations
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">Grade: 98.4/100</span>
                </div>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-black dark:text-white block">USGBC LEED Platinum v4.1</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Spider Cybernetics Tower A (Score: 89 pts)</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">Certified Active</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-black dark:text-white block">BREEAM In-Use 'Outstanding'</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">BeeCarbonit Eco-Campus B (92.1% asset rating)</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">Certified Active</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-black dark:text-white block">WELL Health-Safety Rating</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Indoor Air IAQ & VOC laser monitoring standard</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">Verified</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono">Next Audit: Dec 2026</span>
                <button className="text-emerald-400 hover:underline flex items-center space-x-1 font-semibold">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ESG Audit Dossier (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carbon Market Trading Simulator */}
      {activeSubTab === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">
                  Decentralized Carbon Credit Portfolio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gold Standard & Verra Verified Carbon Units (VCU) registry for corporate net-zero retirement
                </p>
              </div>
              <Coins className="w-6 h-6 text-emerald-400" />
            </div>

            {tradeSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{tradeSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Available Carbon Credits</span>
                <span className="text-emerald-400 font-bold text-2xl">{esgData.carbonCreditsOwned} VCUs</span>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] mt-1">Valued @ $28.50 / tonne</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Permanently Retired (Offset)</span>
                <span className="text-cyan-400 font-bold text-2xl">{esgData.carbonCreditsRetired} tCO2e</span>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] mt-1">Offsetting Scope 1 emissions</span>
              </div>
            </div>

            {/* Trading Actions */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                Trade / Retire Quantum (tCO2e Credits)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-black dark:text-white font-mono text-sm w-32 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Cost: ${(tradeAmount * 28.5).toLocaleString()} USD</span>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleRetireCredits}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all text-center"
                >
                  Permanently Retire Credits (Net-Zero Offsetting)
                </button>
                <button
                  onClick={handleBuyCredits}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all text-center"
                >
                  Purchase Additional VCUs
                </button>
              </div>
            </div>
          </div>

          {/* Active Verified Projects */}
          <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
              Verified Project Origins
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-emerald-400 block">Amazonian Rainforest Canopy Project #892</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Verra VCS Standard • 1,200 credits held</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-cyan-400 block">Nordic Offshore Wind Farm Expansion</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Gold Standard GS-402 • 1,800 credits held</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-amber-400 block">Direct Air Capture & Mineralization</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Puro.earth CDR • 500 credits held</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HydroSync Water loops */}
      {activeSubTab === 'hydrosync' && (
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-black dark:text-white">HydroSync Closed-Loop Greywater Telemetry</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-800/40">
              97.4% Reclamation Efficiency
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Total Recycled YTD</span>
              <span className="text-cyan-400 font-bold text-xl">1,845,000 Liters</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Cooling Tower Loop Makeup</span>
              <span className="text-emerald-400 font-bold text-xl">62% Offset</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Municipal Water Savings</span>
              <span className="text-black dark:text-white font-bold text-xl">$8,450 /mo</span>
            </div>
          </div>
        </div>
      )}

      {/* CityPulse Lighting */}
      {activeSubTab === 'lighting' && (
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <SunMedium className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-black dark:text-white">CityPulse Dynamic Photocell & Lighting Matrix</h3>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/40">
              DALI-2 / Zigbee 3.0 Mesh
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Autonomous Lux Dimming</span>
              <span className="text-amber-400 font-bold text-xl">420 Lux Target</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Daylight Harvesting Ratio</span>
              <span className="text-emerald-400 font-bold text-xl">58.4% Natural Light</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-500 block text-[11px]">Power Reduction Rate</span>
              <span className="text-cyan-400 font-bold text-xl">-34% vs Baseline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
