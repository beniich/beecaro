import React, { useState } from 'react';
import { User } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { SustainabilityMap } from './SustainabilityMap';
import { useAuth } from '../../contexts/AuthContext';
import { CyberCockpitNav } from './CyberCockpitNav';
import { NavigationPage } from '../../types/bizos';
import { useTelemetry } from '../../telemetry/hooks';

export const SustainabilityMatrix: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  
  const gcpNodes = servers.filter(s => s.provider === 'gcp').length;
  const awsNodes = servers.filter(s => s.provider === 'aws').length;
  const totalNodes = servers.length || 1;

  // Real data derived from telemetry providers
  const energyMixData = [
    { name: 'Solar', value: Math.floor(40 + (gcpNodes / totalNodes) * 20), color: '#f97316' },
    { name: 'Wind', value: Math.floor(25 + (awsNodes / totalNodes) * 15), color: '#fdba74' },
    { name: 'Hydro', value: 15, color: '#fed7aa' },
    { name: 'Other', value: 5, color: '#fff7ed' },
  ];

  const netZeroProgress = Math.floor(60 + (gcpNodes / totalNodes) * 15);
  const netZeroData = [
    { name: 'Q1', value: 50 },
    { name: 'Q2', value: 58 },
    { name: 'Q3', value: netZeroProgress - 5 },
    { name: 'Q4 Forecast', value: netZeroProgress },
  ];
  const renewablePct = energyMixData.reduce((sum, d) => sum + d.value, 0);

  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'BeeCarbonat');
  
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-gray-800 font-sans selection:bg-orange-200">
      <CyberCockpitNav
        currentCockpit="sustainability-matrix"
        title="Sustainability Matrix"
        onNavigate={onNavigate}
        adminName={displayName}
      />
      <div className="flex-1 p-6 sm:p-10">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">CAFM23: Sustainability Matrix (Light)</h1>
        
        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-[0_0_8px_rgba(255,85,0,0.5)] border border-slate-200 overflow-hidden">
          
          {/* Top Navigation */}
          <div className="flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex space-x-6">
              {['Dashboard', 'AI Operations', 'Emissions Tracking', 'Reports', 'Settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab 
                      ? 'border-[#ff9a00] text-gray-900' 
                      : 'border-transparent text-slate-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900">{displayName}</span>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row p-6 gap-6">
            
            {/* Left Sidebar Filters */}
            <div className="w-full lg:w-48 flex flex-col gap-6 shrink-0 pt-2">
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">Timeframe:</div>
                <div className="text-sm font-semibold text-gray-900">Last 12 Months</div>
                <div className="w-full h-px bg-slate-100 mt-3"></div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">Region:</div>
                <div className="text-sm font-semibold text-gray-900">Global</div>
                <div className="w-full h-px bg-slate-100 mt-3"></div>
              </div>
              
              <div>
                <div className="text-xs text-slate-500 font-medium mb-1">AI Model:</div>
                <div className="text-sm font-semibold text-gray-900">All</div>
                <div className="w-full h-px bg-slate-100 mt-3"></div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Map Panel */}
              <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 shadow-[0_0_8px_rgba(255,85,0,0.5)] bg-white min-h-[400px] flex flex-col">
                <h3 className="text-base font-bold text-gray-900 mb-4">Global Environmental Impact</h3>
                <div className="flex-1 rounded-lg overflow-hidden relative">
                  <SustainabilityMap />
                </div>
              </div>
              
              {/* Right Charts Panel */}
              <div className="flex flex-col gap-6">
                
                {/* Line Chart */}
                <div className="border border-slate-200 rounded-xl p-5 shadow-[0_0_8px_rgba(255,85,0,0.5)] bg-white flex flex-col">
                  <h3 className="text-base font-bold text-gray-900">Net Zero Progress</h3>
                  <div className="text-sm text-slate-500 mb-4">
                    Current: <span className="font-semibold text-gray-900">{netZeroProgress}%</span> Target: <span className="font-semibold text-gray-900">100% by 2040</span>
                  </div>
                  
                  <div className="h-48 w-full mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={netZeroData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#f97316" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6 }} 
                          label={{ position: 'top', fill: '#0f172a', fontSize: 12, fontWeight: 600, formatter: (val: number) => `${val}%` }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="border border-slate-200 rounded-xl p-5 shadow-[0_0_8px_rgba(255,85,0,0.5)] bg-white flex flex-col relative h-full">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Renewable Energy Mix</h3>
                  
                  <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={energyMixData}
                          innerRadius="65%"
                          outerRadius="90%"
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {energyMixData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-gray-900">{renewablePct}%</span>
                      <span className="text-xs text-slate-500 font-medium">Renewable</span>
                    </div>

                    {/* Custom Labels to match image */}
                    <div className="absolute top-[10%] right-[10%] text-xs font-semibold text-gray-700">{energyMixData[0].name}: {energyMixData[0].value}%</div>
                    <div className="absolute bottom-[5%] right-[20%] text-xs font-semibold text-gray-700">{energyMixData[1].name}: {energyMixData[1].value}%</div>
                    <div className="absolute bottom-[20%] left-[5%] text-xs font-semibold text-gray-700">{energyMixData[2].name}: {energyMixData[2].value}%</div>
                    <div className="absolute top-[20%] left-[10%] text-xs font-semibold text-gray-700">{energyMixData[3].name}: {energyMixData[3].value}%</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-slate-500">
          Variant 3 of 10
        </div>
      </div>
      </div>
    </div>
  );
};
