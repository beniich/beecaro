import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Home, 
  Map, 
  Cpu, 
  BarChart2, 
  Settings, 
  Plus, 
  Wifi, 
  Battery, 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  RefreshCw,
  Search,
  UserCheck
} from 'lucide-react';
import { CyberCockpitNav } from './CyberCockpitNav';
import { NavigationPage } from '../../types/bizos';
import { useTelemetry } from '../../telemetry/hooks';
import { TelemetryEngine } from '../../telemetry/TelemetryEngine';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useAuth } from '../../contexts/AuthContext';
import { REGIONS } from '../../telemetry/config';
import { ServerNode } from '../../telemetry/types';

// Map configuration
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export const GlobalFleetCommand: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const displayName = profile?.displayName || (user?.email ? user.email.split('@')[0] : 'J. Carter');

  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'list' | 'ai-ops' | 'analytics' | 'settings'>('map');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [isDeployingModal, setIsDeployingModal] = useState(false);
  const [newDeviceCode, setNewDeviceCode] = useState('');
  
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  const circuitBreakers = useTelemetry(s => s.circuitBreakers);
  const trafficRedirects = useTelemetry(s => s.trafficRedirects);
  
  const onlineCount = servers.filter(s => s.status !== 'offline').length;
  
  // Prepare map markers
  const markers = servers.map(server => {
    // If coords are [0,0], fallback to region coords
    let coords = server.coordinates;
    if (coords[0] === 0 && coords[1] === 0) {
       coords = REGIONS[server.region].coords;
       // Add slight jitter to avoid exact overlapping
       coords = [
         coords[0] + (Math.random() - 0.5) * 5, 
         coords[1] + (Math.random() - 0.5) * 5
       ];
    }
    
    return {
      id: server.id,
      name: server.hostname,
      coordinates: coords as [number, number],
      status: server.status,
      type: server.type,
      isTripped: circuitBreakers.has(server.id)
    };
  });

  const handleTripCircuitBreaker = (serverId: string) => {
    TelemetryEngine.tripCircuitBreaker(serverId);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-100 flex flex-col font-sans selection:bg-orange-500/30">
      <CyberCockpitNav
        currentCockpit="fleet-command"
        title="Global Fleet Command"
        onNavigate={onNavigate}
        adminName={displayName}
      />

      <div className="flex-1 flex flex-col md:flex-row p-4 sm:p-6 gap-6">
        
        {/* Left Side: Global Map */}
        <div className="flex-1 lg:w-7/12 bg-[#0b1220] rounded-2xl border border-[#1d3d63] p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 z-10 border-b border-white/5 mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="font-mono font-black text-lg text-white uppercase tracking-wider">
                Fleet Deployment Map
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">Total Nodes: {servers.length}</span>
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/40 animate-pulse">
                ● Live
              </span>
            </div>
          </div>

          <div className="flex-1 w-full relative min-h-[400px]">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 120 }}
              className="w-full h-full"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#0e1b2e"
                      stroke="#1d3d63"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#152a45", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Draw traffic redirects (arcs) */}
              {Array.from(trafficRedirects.entries()).map(([fromId, toData]) => {
                const [toId, ratio] = toData.split(':');
                const fromMarker = markers.find(m => m.id === fromId);
                const toMarker = markers.find(m => m.id === toId);
                
                if (fromMarker && toMarker) {
                  return (
                    <line
                      key={`${fromId}-${toId}`}
                      x1={0} y1={0} x2={0} y2={0} // Abstracted away, but react-simple-maps <Line> is better. Using raw SVG lines on projection requires more work.
                      // We'll skip complex arcs for this rapid version, standard react-simple-maps <Line> requires coordinates.
                    />
                  );
                }
                return null;
              })}

              {markers.map((marker) => {
                const isSelected = selectedServerId === marker.id;
                let color = '#34d399'; // healthy
                if (marker.isTripped || marker.status === 'offline') color = '#64748b'; // offline
                else if (marker.status === 'critical') color = '#ef4444'; // critical
                else if (marker.status === 'degraded') color = '#f59e0b'; // degraded

                return (
                  <Marker 
                    key={marker.id} 
                    coordinates={marker.coordinates}
                    onClick={() => setSelectedServerId(marker.id)}
                  >
                    <circle
                      r={isSelected ? 6 : 4}
                      fill={color}
                      stroke={isSelected ? '#fff' : '#0a182b'}
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all duration-300"
                      style={{
                        filter: isSelected ? `drop-shadow(0 0 8px ${color})` : 'none'
                      }}
                    />
                    {marker.status === 'critical' && !marker.isTripped && (
                      <circle
                        r={8}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={1}
                        className="animate-ping"
                      />
                    )}
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* Floating Stats */}
            <div className="absolute bottom-4 left-4 flex gap-3">
              <div className="bg-[#0b1220]/90 border border-[#1d3d63] p-3 rounded-xl backdrop-blur font-mono text-xs shadow-lg">
                <div className="text-gray-400 mb-1">Global Health</div>
                <div className="text-xl font-bold text-emerald-400">
                  {((onlineCount / servers.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-[#0b1220]/90 border border-[#1d3d63] p-3 rounded-xl backdrop-blur font-mono text-xs shadow-lg">
                <div className="text-gray-400 mb-1">Critical Nodes</div>
                <div className="text-xl font-bold text-red-400">
                  {servers.filter(s => s.status === 'critical').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Server List & Details */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          
          <div className="bg-[#0b1220] rounded-2xl border border-[#1d3d63] p-6 flex flex-col shadow-2xl flex-1">
            <h2 className="font-mono font-black text-sm text-gray-200 uppercase tracking-wider mb-4 border-b border-white/5 pb-4">
              Active Fleet Overwiew
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar max-h-[500px]">
              {servers.map((server) => {
                const isSelected = selectedServerId === server.id;
                const isTripped = circuitBreakers.has(server.id);
                
                return (
                  <div
                    key={server.id}
                    onClick={() => setSelectedServerId(server.id)}
                    className={`p-3.5 rounded-xl border font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1e3a8a]/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          isTripped || server.status === 'offline' ? 'bg-slate-500' :
                          server.status === 'healthy' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]' :
                          server.status === 'degraded' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]' :
                          'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse'
                        }`} />
                        <div>
                          <div className="text-sm font-bold text-white leading-none mb-1">{server.hostname}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{server.type} • {REGIONS[server.region].name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white">{server.requestsPerSec.toLocaleString()} req/s</div>
                        <div className={`text-[10px] ${server.p99Latency > 200 ? 'text-red-400' : 'text-slate-400'}`}>{server.p99Latency}ms p99</div>
                      </div>
                    </div>
                    
                    {/* Progress bars */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">CPU Usage</span>
                          <span className={server.cpu > 80 ? 'text-red-400' : 'text-white'}>{server.cpu.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${server.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${server.cpu}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">Memory</span>
                          <span className={server.memory > 80 ? 'text-red-400' : 'text-white'}>{server.memory.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${server.memory > 80 ? 'bg-red-500' : 'bg-purple-500'}`}
                            style={{ width: `${server.memory}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons (only show when selected) */}
                    {isSelected && (
                      <div className="mt-4 pt-3 border-t border-white/5 flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTripCircuitBreaker(server.id); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isTripped 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {isTripped ? 'Reconnect Node' : 'Trip Circuit Breaker'}
                        </button>
                      </div>
                    )}
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
