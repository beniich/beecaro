import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  LayoutGrid, 
  Flame, 
  Sliders, 
  Settings, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Wind, 
  Droplet, 
  Cpu, 
  ShieldCheck, 
  RefreshCw,
  BarChart3,
  Layers,
  Thermometer
} from 'lucide-react';
import { CyberCockpitNav } from './CyberCockpitNav';
import { NavigationPage } from '../../types/bizos';
import { useTelemetry } from '../../telemetry/hooks';

export const GlobalEnergyNexus: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  const avgLoad = React.useMemo(() => 
    servers.reduce((sum, s) => sum + s.cpu, 0) / (servers.length || 1),
  [servers]);

  const [activeSidebar, setActiveSidebar] = useState<'overview' | 'towers' | 'analytics' | 'ai-ops' | 'settings'>('overview');
  const [totalSavingsGwh, setTotalSavingsGwh] = useState(4.2);
  const [targetSavingsGwh] = useState(5.0);
  const [carbonOffsetPct, setCarbonOffsetPct] = useState(78);
  const [coolingFlowRate, setCoolingFlowRate] = useState(1450); // Liters/min
  const [chillerTempC, setChillerTempC] = useState(6.4);
  const [towerFanSpeedRpm, setTowerFanSpeedRpm] = useState(850);
  const [flowDirection, setFlowDirection] = useState<'nominal' | 'boost' | 'eco'>('nominal');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Isometric 3D Cooling Towers & Particle Conduit Flow Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 380;
    };
    resize();
    window.addEventListener('resize', resize);

    // 4 Isometric cooling tower base coordinates
    const towers = [
      { id: 1, x: 0.35, y: 0.35, name: 'Chiller Alpha', temp: 6.2, load: avgLoad * 0.9 },
      { id: 2, x: 0.65, y: 0.35, name: 'Chiller Beta', temp: 6.5, load: avgLoad * 1.1 },
      { id: 3, x: 0.35, y: 0.65, name: 'Chiller Gamma', temp: 6.4, load: avgLoad * 1.05 },
      { id: 4, x: 0.65, y: 0.65, name: 'Chiller Delta', temp: 6.6, load: avgLoad * 0.95 },
    ];

    const render = () => {
      t += 0.025;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Cyber floor grid
      ctx.strokeStyle = 'rgba(40, 180, 220, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw connecting piping conduits between towers
      const pipes = [
        { x1: 0.15, y1: 0.75, x2: 0.35, y2: 0.65 },
        { x1: 0.35, y1: 0.65, x2: 0.35, y2: 0.35 },
        { x1: 0.35, y1: 0.35, x2: 0.65, y2: 0.35 },
        { x1: 0.65, y1: 0.35, x2: 0.65, y2: 0.65 },
        { x1: 0.35, y1: 0.65, x2: 0.65, y2: 0.65 },
        { x1: 0.65, y1: 0.65, x2: 0.85, y2: 0.75 },
        { x1: 0.65, y1: 0.35, x2: 0.85, y2: 0.25 },
      ];

      pipes.forEach((p, idx) => {
        const sx = p.x1 * w;
        const sy = p.y1 * h;
        const tx = p.x2 * w;
        const ty = p.y2 * h;

        // Pipe casing
        ctx.strokeStyle = '#1b2d48';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // Glowing core
        ctx.strokeStyle = '#ff9d2b';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff9d2b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Flow particles
        const speed = flowDirection === 'boost' ? 1.4 : 0.8;
        const numParticles = 4;
        for (let i = 0; i < numParticles; i++) {
          const progress = (t * speed + idx * 0.2 + i * (1 / numParticles)) % 1;
          const px = sx + (tx - sx) * progress;
          const py = sy + (ty - sy) * progress;

          ctx.fillStyle = '#fff8e7';
          ctx.shadowColor = '#ff9d2b';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Flow chevron
          const angle = Math.atan2(ty - sy, tx - sx);
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px - Math.cos(angle - 0.5) * 5, py - Math.sin(angle - 0.5) * 5);
          ctx.lineTo(px, py);
          ctx.lineTo(px - Math.cos(angle + 0.5) * 5, py - Math.sin(angle + 0.5) * 5);
          ctx.stroke();
        }
      });

      // Draw isometric cooling towers
      towers.forEach((tower, idx) => {
        const tx = tower.x * w;
        const ty = tower.y * h;

        // Base box
        ctx.fillStyle = '#1e3352';
        ctx.strokeStyle = '#2b4d7c';
        ctx.lineWidth = 2;
        ctx.fillRect(tx - 38, ty - 15, 76, 50);
        ctx.strokeRect(tx - 38, ty - 15, 76, 50);

        // Tower cone chimney
        ctx.fillStyle = '#2a446a';
        ctx.beginPath();
        ctx.moveTo(tx - 30, ty - 15);
        ctx.lineTo(tx - 18, ty - 55);
        ctx.lineTo(tx + 18, ty - 55);
        ctx.lineTo(tx + 30, ty - 15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#4370a8';
        ctx.stroke();

        // Top fan ring
        ctx.fillStyle = '#142236';
        ctx.beginPath();
        ctx.ellipse(tx, ty - 55, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#62a1ea';
        ctx.stroke();

        // Spinning fan blades
        const fanAngle = t * 4 + idx;
        ctx.strokeStyle = '#90c3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx - Math.cos(fanAngle) * 12, ty - 55 - Math.sin(fanAngle) * 3);
        ctx.lineTo(tx + Math.cos(fanAngle) * 12, ty - 55 + Math.sin(fanAngle) * 3);
        ctx.stroke();

        // Rising vapor particles
        for (let v = 0; v < 3; v++) {
          const vProgress = (t * 0.8 + v * 0.33) % 1;
          const vx = tx + Math.sin(t * 2 + v) * 8;
          const vy = ty - 55 - vProgress * 30;
          ctx.fillStyle = `rgba(180, 220, 255, ${0.4 * (1 - vProgress)})`;
          ctx.beginPath();
          ctx.arc(vx, vy, 4 + vProgress * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Louver vents on base
        ctx.strokeStyle = '#101d2e';
        ctx.lineWidth = 1.5;
        for (let l = 0; l < 4; l++) {
          ctx.beginPath();
          ctx.moveTo(tx - 30, ty - 5 + l * 8);
          ctx.lineTo(tx - 10, ty - 5 + l * 8);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(tx + 10, ty - 5 + l * 8);
          ctx.lineTo(tx + 30, ty - 5 + l * 8);
          ctx.stroke();
        }

        // Tower Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${tower.name} (${tower.temp}°C)`, tx - 42, ty + 46);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [flowDirection]);

  return (
    <div className="min-h-screen bg-[#071322] text-gray-100 flex flex-col font-sans selection:bg-[#ff9d2b] selection:text-black">
      {/* Cockpit Nav */}
      <CyberCockpitNav
        currentCockpit="energy-nexus"
        title="Global Energy Nexus"
        onNavigate={onNavigate}
      />

      {/* Browser Bar Style Header Matching Screenshot 3 */}
      <div className="bg-[#0b1b30] border-b border-[#25466d] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-[#38ef7d] font-bold">beecarbonat.globalenergynexus</span>
          <span className="text-slate-600">/</span>
          <span className="text-gray-400">Home &gt; Dashboards &gt; Global Energy Nexus &gt;</span>
          <span className="text-[#ff9d2b] font-bold">Variant 3 of 10</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFlowDirection(d => d === 'nominal' ? 'boost' : d === 'boost' ? 'eco' : 'nominal')}
            className="px-2.5 py-1 rounded bg-[#162a45] border border-[#3a679e] text-[11px] font-mono text-[#74b9ff] hover:text-white transition-all flex items-center gap-1.5"
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Flow Mode: <b className="text-white uppercase">{flowDirection}</b></span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + 3 Big Panels */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-24 bg-[#081526] border-r border-[#1e395c] p-2 sm:p-3 flex md:flex-col justify-around md:justify-start gap-2 shrink-0">
          <button
            onClick={() => setActiveSidebar('overview')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-mono transition-all ${
              activeSidebar === 'overview'
                ? 'bg-[#153457] text-[#38ef7d] border border-[#38ef7d]/40 shadow-[0_0_15px_rgba(56,239,125,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-1" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveSidebar('towers')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-mono transition-all ${
              activeSidebar === 'towers'
                ? 'bg-[#153457] text-[#38ef7d] border border-[#38ef7d]/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="w-5 h-5 mb-1" />
            <span>Towers</span>
          </button>

          <button
            onClick={() => setActiveSidebar('analytics')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-mono transition-all ${
              activeSidebar === 'analytics'
                ? 'bg-[#153457] text-[#38ef7d] border border-[#38ef7d]/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveSidebar('ai-ops')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-mono transition-all ${
              activeSidebar === 'ai-ops'
                ? 'bg-[#153457] text-[#38ef7d] border border-[#38ef7d]/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-5 h-5 mb-1" />
            <span>AI Ops</span>
          </button>

          <button
            onClick={() => setActiveSidebar('settings')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-mono transition-all ${
              activeSidebar === 'settings'
                ? 'bg-[#153457] text-[#38ef7d] border border-[#38ef7d]/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span>Settings</span>
          </button>
        </aside>

        {/* Center Main Stage (3 Columns Grid Matching Image 3) */}
        <main className="flex-1 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Panel 1: KWh Optimization (3.5 Cols) */}
          <div className="lg:col-span-3 bg-[#0d223d]/90 rounded-2xl border border-[#234c7c] p-4 flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-base font-bold text-gray-200">
                KWh Optimization
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Total Savings:
              </div>
              <div className="text-3xl font-mono font-black text-[#38ef7d] mt-0.5">
                {totalSavingsGwh.toFixed(1)} GWh
              </div>
            </div>

            {/* Rising Green Curve Chart */}
            <div className="h-44 w-full my-3 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="kwh-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38ef7d" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38ef7d" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,90 Q 40,85 70,75 T 140,40 T 200,10 L 200,120 L 0,120 Z"
                  fill="url(#kwh-grad)"
                />
                <path
                  d="M 0,90 Q 40,85 70,75 T 140,40 T 200,10"
                  fill="none"
                  stroke="#38ef7d"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Quarters axis */}
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1 border-t border-white/5 pt-2">
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
            </div>

            {/* Bottom Sub-stats */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 mt-2">
              <div className="bg-[#112a4c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400">Last Month:</div>
                <div className="text-base font-bold text-[#38ef7d] flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12%</span>
                </div>
              </div>
              <div className="bg-[#112a4c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400">Target:</div>
                <div className="text-base font-bold text-white">
                  {targetSavingsGwh} GWh
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Active Cooling & Flow Optimization (5.5 Cols) */}
          <div className="lg:col-span-6 bg-[#0d223d]/90 rounded-2xl border border-[#234c7c] p-4 flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Title with Cyan Neon Cyber Badge */}
            <div className="flex items-center justify-center pb-2">
              <div className="px-5 py-1.5 rounded-lg border border-[#38ef7d]/60 bg-[#122e50] text-sm sm:text-base font-mono font-black text-[#55e6c1] tracking-wider uppercase shadow-[0_0_15px_rgba(85,230,193,0.3)]">
                Active Cooling & Flow Optimization
              </div>
            </div>

            {/* 3D Isometric Cooling Towers Array Canvas */}
            <div className="flex-1 w-full min-h-[340px] my-2 relative rounded-xl border border-[#1e426d] bg-[#071526] overflow-hidden flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />
            </div>

            {/* Interactive Chiller Quick Controls */}
            <div className="flex items-center justify-between text-xs font-mono text-gray-300 pt-2 border-t border-white/10 px-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>Delta-T Chiller Loop: <b className="text-white">5.8°C</b></span>
              </div>
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-emerald-400" />
                <span>Hydronic Pressure: <b className="text-emerald-400">4.2 bar (Nominal)</b></span>
              </div>
            </div>
          </div>

          {/* Panel 3: Carbon Neutrality Progress (3 Cols) */}
          <div className="lg:col-span-3 bg-[#0d223d]/90 rounded-2xl border border-[#234c7c] p-4 flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-base font-bold text-gray-200">
                Carbon Neutrality Progress
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-[11px] text-gray-400">Current Offset:</div>
                  <div className="text-2xl font-mono font-black text-[#4da3ff]">
                    {carbonOffsetPct}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-gray-400">Goal:</div>
                  <div className="text-sm font-mono font-bold text-white">
                    100% by 2030
                  </div>
                </div>
              </div>
            </div>

            {/* Declining Carbon Curve Chart */}
            <div className="h-44 w-full my-3 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="carbon-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4da3ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4da3ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,20 Q 60,35 100,60 T 160,85 T 200,95 L 200,120 L 0,120 Z"
                  fill="url(#carbon-grad)"
                />
                <path
                  d="M 0,20 Q 60,35 100,60 T 160,85 T 200,95"
                  fill="none"
                  stroke="#4da3ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Quarters axis */}
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1 border-t border-white/5 pt-2">
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
            </div>

            {/* Bottom Sub-stats */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 mt-2">
              <div className="bg-[#112a4c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400">Emissions Reduced:</div>
                <div className="text-base font-bold text-[#4da3ff]">
                  1.5 MT
                </div>
              </div>
              <div className="bg-[#112a4c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400">Offset Projects:</div>
                <div className="text-base font-bold text-white">
                  15 Active
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Bottom Status Bar Matching Screenshot 3 */}
      <footer className="h-8 bg-[#050e1a] border-t border-[#1a3556] px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Status: <b className="text-emerald-400">Optimal</b></span>
          </div>
          <div>Last Sync: <b className="text-gray-200">1 min ago</b></div>
          <div>Alerts: <b className="text-emerald-400">0</b></div>
        </div>

        <div className="text-slate-500 hidden sm:block">
          BeeCarbonat Hydronic AI Engine • v3.8.2
        </div>
      </footer>
    </div>
  );
};
