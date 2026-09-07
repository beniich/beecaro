import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpRight, 
  Activity, 
  ShieldCheck, 
  Leaf, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  Radio, 
  Cpu, 
  Eye, 
  Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

interface MissionControlDashboardProps {
  lang?: 'fr' | 'en';
  onNavigate?: (id: string) => void;
  onOpenGodMode?: () => void;
}

export const MissionControlDashboard: React.FC<MissionControlDashboardProps> = ({
  lang = 'en',
  onNavigate,
  onOpenGodMode
}) => {
  // Mode selection for neural traffic
  const [trafficMode, setTrafficMode] = useState<'breathe' | 'fast' | 'deep' | 'quantum'>('breathe');
  const [threatCount, setThreatCount] = useState<number>(1);
  const [mitigatedCount, setMitigatedCount] = useState<number>(0);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  // Live database metrics states
  const [metrics, setMetrics] = useState<any>(null);
  const [esg, setEsg] = useState<any>(null);
  const [assetStats, setAssetStats] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/esg').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/assets/stats').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([dashData, esgData, statsData]) => {
      if (dashData) setMetrics(dashData.metrics || dashData);
      if (esgData) setEsg(esgData);
      if (statsData) setAssetStats(statsData);
    }).catch(err => {
      console.error('Error loading mission control metrics:', err);
    });
  }, []);

  // Neural Traffic Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // 3D Neural Wireframe Mesh Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid definition for 3D perspective terrain mesh
    const cols = 28;
    const rows = 20;

    const render = () => {
      time += trafficMode === 'fast' ? 0.045 : trafficMode === 'quantum' ? 0.06 : 0.025;
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, width, height);

      // Gradient background subtle glow
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 1.2);
      bgGrad.addColorStop(0, 'rgba(255, 157, 43, 0.08)');
      bgGrad.addColorStop(0.5, 'rgba(22, 14, 38, 0.4)');
      bgGrad.addColorStop(1, 'rgba(10, 6, 18, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Calculate 3D points
      const points: { x: number; y: number; z: number; origZ: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          const u = (c / (cols - 1) - 0.5) * 2; // -1 to 1
          const v = r / (rows - 1); // 0 (far) to 1 (near)

          // Multi-frequency sinusoidal terrain elevation
          const distFromCenter = Math.sqrt(u * u + (v - 0.5) * (v - 0.5));
          const wave1 = Math.sin(c * 0.4 + time * 1.2) * Math.cos(r * 0.35 + time * 0.8) * 35;
          const wave2 = Math.sin(c * 0.2 - time * 0.9 + r * 0.3) * 22;
          const wave3 = Math.cos(distFromCenter * 6 - time * 2) * 18;
          
          let zElevation = (wave1 + wave2 + wave3) * (0.35 + v * 0.7);

          // Mouse interactive ripple displacement
          if (mousePosRef.current.active) {
            const mouseXNorm = (mousePosRef.current.x / width - 0.5) * 2;
            const mouseYNorm = mousePosRef.current.y / height;
            const dMouse = Math.sqrt(Math.pow(u - mouseXNorm, 2) + Math.pow(v - mouseYNorm, 2));
            if (dMouse < 0.4) {
              zElevation += Math.sin((0.4 - dMouse) * 15 - time * 4) * 28;
            }
          }

          // 3D Perspective Projection
          const fov = 320;
          const camY = 160;
          const depth = 350 + (1 - v) * 380;
          const scale = fov / depth;

          const projX = width / 2 + (u * (width * 0.65)) * scale;
          const projY = height * 0.45 + (camY - zElevation + (v - 0.5) * (height * 0.5)) * scale;

          points[r][c] = { x: projX, y: projY, z: depth, origZ: zElevation };
        }
      }

      // Draw grid lines
      ctx.lineWidth = 1.1;
      
      // Horizontal lines (rows)
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (c === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        const depthAlpha = 0.15 + (r / rows) * 0.65;
        ctx.strokeStyle = `rgba(255, 157, 43, ${depthAlpha * 0.55})`;
        ctx.stroke();
      }

      // Longitudinal lines (columns)
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const pt = points[r][c];
          if (r === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        const colAlpha = 0.2 + Math.abs(c / cols - 0.5) * 0.3;
        ctx.strokeStyle = `rgba(255, 180, 79, ${colAlpha * 0.55})`;
        ctx.stroke();
      }

      // Draw glowing glowing nodes at intersections
      for (let r = 0; r < rows; r++) {
        const step = r > 12 ? 1 : 2;
        for (let c = 0; c < cols; c += step) {
          const pt = points[r][c];
          const nodeDist = Math.sin(c * 0.5 + r * 0.3 + time * 1.5);
          const radius = (1.2 + (r / rows) * 2.2 + (nodeDist > 0.6 ? 1.5 : 0));
          const glowAlpha = 0.4 + (r / rows) * 0.55;

          // Glowing outer halo for peak nodes
          if (nodeDist > 0.4 || pt.origZ > 25) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 209, 102, ${glowAlpha * 0.3})`;
            ctx.fill();
          }

          // Core node
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = pt.origZ > 20 ? '#ffffff' : '#ffb04f';
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trafficMode]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current.active = false;
  };

  // Real-time Request Load Data
  const requestLoadData = [
    { time: '00:00', primary: 0.6, secondary: 0.2, loadA: 0.4, loadB: 0.1 },
    { time: '09:00', primary: 1.8, secondary: 1.2, loadA: 1.4, loadB: 0.9 },
    { time: '02:00', primary: 1.3, secondary: 2.1, loadA: 1.7, loadB: 1.3 },
    { time: '03:00', primary: 2.4, secondary: 1.6, loadA: 2.1, loadB: 1.1 },
    { time: '04:00', primary: 3.4, secondary: 2.5, peak: '22.4K', loadA: 2.9, loadB: 1.8 },
    { time: '04:00', primary: 2.6, secondary: 3.2, peak: '12.3K', loadA: 2.8, loadB: 2.2 },
    { time: '06:00', primary: 3.3, secondary: 1.9, peak: '10.7K', loadA: 3.0, loadB: 1.5 },
    { time: '06:00', primary: 2.7, secondary: 2.8, peak: '12.9K', loadA: 2.5, loadB: 2.0 },
    { time: '09:00', primary: 3.1, secondary: 3.6, peak: '13.6K', loadA: 2.9, loadB: 2.6 },
    { time: '10:00', primary: 1.9, secondary: 1.4, loadA: 1.6, loadB: 1.0 },
  ];

  // Latency Distribution Data (percentiles)
  const latencyData = [
    { time: '16:00', p50: 45, p75: 70, p90: 95, p95: 120, p99: 140 },
    { time: '16:00', p50: 40, p75: 62, p90: 88, p95: 110, p99: 130 },
    { time: '18:00', p50: 38, p75: 58, p90: 80, p95: 102, p99: 125 },
    { time: '21:00', p50: 90, p75: 140, p90: 195, p95: 240, p99: 285 },
    { time: '24:00', p50: 75, p75: 115, p90: 160, p95: 195, p99: 235 },
    { time: '07:00', p50: 85, p75: 130, p90: 180, p95: 220, p99: 260 },
    { time: '03:00', p50: 55, p75: 85, p90: 118, p95: 145, p99: 175 },
    { time: '03:00', p50: 48, p75: 72, p90: 98, p95: 122, p99: 150 },
    { time: '03:00', p50: 42, p75: 65, p90: 90, p95: 112, p99: 138 },
  ];

  // Holographic incident badges
  const incidents = [
    { id: 'inc-1', title: 'Anomaly Detected: DDoS Pattern', desc: 'Holographic Badges', badge: 'threat', icon: 'shield_alert', severity: 'critical' },
    { id: 'inc-2', title: 'Intrusion Attempt Blocked', desc: 'Holographic Badges', badge: 'blocked', icon: 'security', severity: 'medium' },
    { id: 'inc-3', title: 'Data Exfiltration Prevented', desc: 'Holographic Badges', badge: 'secure', icon: 'lock', severity: 'high' },
    { id: 'inc-4', title: 'Intrusion Attempt Blocked', desc: 'Holographic Badges', badge: 'blocked', icon: 'security', severity: 'medium' },
    { id: 'inc-5', title: 'Data Exfiltration Prevented', desc: 'Holographic Badges', badge: 'secure', icon: 'lock', severity: 'high' },
  ];

  return (
    <div className="min-h-screen bg-[#080410] text-[#f4effa] font-sans relative overflow-hidden pb-12 selection:bg-[#ff9d2b]/30">
      
      {/* Background Circuit Grid Texture Overlay */}
      <div className="absolute inset-0 circuit-pattern pointer-events-none opacity-60" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff9d2b]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6 relative z-10">

        {/* Top Header Row with Title & Mode Presets */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#ff9d2b]/15">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white cyber-text-glow flex items-center gap-3">
              <span>Web dashboard</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#ff9d2b]/10 text-[#ffb04f] border border-[#ff9d2b]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9d2b] animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch to God Mode */}
            {onOpenGodMode && (
              <button
                id="btn-switch-godmode"
                onClick={onOpenGodMode}
                className="px-3.5 py-1.5 rounded-xl border border-[#a78bfa]/40 bg-[#160e27]/80 hover:bg-[#231540] text-[#d8b4fe] text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(167,139,250,0.15)] flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-[#c084fc]" />
                <span>God-Mode System View</span>
              </button>
            )}

            {/* Hyper-KPI Dropdown */}
            <div className="relative group">
              <button 
                id="btn-hyper-kpi"
                className="px-3.5 py-1.5 rounded-xl border border-[#ff9d2b]/30 bg-[#120a1f]/80 text-xs font-mono font-bold text-[#ffb04f] flex items-center gap-2 hover:border-[#ff9d2b]/60 transition-all shadow-[0_0_8px_rgba(255,85,0,0.5)]"
              >
                <Radio className="w-3.5 h-3.5 text-[#ff9d2b]" />
                <span>Hyper-KPI cards</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 5 Neon Glass KPI Cards Row (Image 1 top row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: GLOBAL REQUESTS */}
          <div className="cyber-card p-4 sm:p-5 relative group overflow-hidden border-[#ff9d2b]/40 hover:border-[#ff9d2b] transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono font-black text-gray-300 uppercase tracking-wider">
                {lang === 'fr' ? 'ÉQUIPEMENTS CONNECTÉS' : 'CONNECTED ASSETS'}
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#ff9d2b]/10 border border-[#ff9d2b]/30 flex items-center justify-center text-[#ff9d2b]">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-mono font-black text-white tracking-tight cyber-text-glow">
                {assetStats?.total || metrics?.activeSensors || 24}
              </span>
              <span className="text-lg font-mono font-bold text-[#ff9d2b]">↑</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="text-emerald-400 font-bold">+{assetStats?.operational || 18} {lang === 'fr' ? 'actifs' : 'active'}</span>
              <span>{lang === 'fr' ? 'Sondes Télémétrie' : 'Telemetry Nodes'}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff9d2b] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Card 2: LATENCY */}
          <div className="cyber-card p-4 sm:p-5 relative group overflow-hidden border-[#ff9d2b]/40 hover:border-[#ff9d2b] transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono font-black text-gray-300 uppercase tracking-wider">
                {lang === 'fr' ? 'LATENCE RÉSEAU' : 'NETWORK LATENCY'}
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#ff9d2b]/10 border border-[#ff9d2b]/30 flex items-center justify-center text-[#ff9d2b]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-mono font-black text-white tracking-tight cyber-text-glow">
                12ms
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="text-emerald-400 font-bold">p99: 18ms</span>
              <span>SLA Sub-20ms</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff9d2b] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Card 3: AI THREAT MITIGATION */}
          <div className="cyber-card p-4 sm:p-5 relative group overflow-hidden border-[#ff9d2b]/40 hover:border-[#ff9d2b] transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono font-black text-gray-300 uppercase tracking-wider truncate pr-2">
                {lang === 'fr' ? 'CONFORMITÉ SLA' : 'SLA COMPLIANCE'}
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#ff9d2b]/10 border border-[#ff9d2b]/30 flex items-center justify-center text-[#ff9d2b]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-mono font-black text-white tracking-tight cyber-text-glow">
                {metrics?.activeSlaPercentage ? `${metrics.activeSlaPercentage}%` : '99.2%'}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="text-[#ff9d2b] font-bold">{lang === 'fr' ? 'Cœur Autonome' : 'Autonomous Core'}</span>
              <span>{lang === 'fr' ? '0 anomalie' : '0 bypass'}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff9d2b] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Card 4: SUSTAINABILITY INDEX */}
          <div className="cyber-card p-4 sm:p-5 relative group overflow-hidden border-[#ff9d2b]/40 hover:border-[#ff9d2b] transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono font-black text-gray-300 uppercase tracking-wider truncate pr-2">
                {lang === 'fr' ? 'INDEX DE DURABILITÉ' : 'SUSTAINABILITY INDEX'}
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#ff9d2b]/10 border border-[#ff9d2b]/30 flex items-center justify-center text-[#ff9d2b]">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-mono font-black text-white tracking-tight cyber-text-glow">
                {metrics?.sustainabilityScore ? `${Math.round(metrics.sustainabilityScore)}/100` : '95/100'}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="text-emerald-400 font-bold">{esg?.greenBuildingCert || 'LEED Platinum'}</span>
              <span>{lang === 'fr' ? 'Zéro Carbone' : 'Carbon Zero'}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff9d2b] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Card 5: THREAT NETWORK */}
          <div className="cyber-card p-4 sm:p-5 relative group overflow-hidden border-[#ff9d2b]/40 hover:border-[#ff9d2b] transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono font-black text-gray-300 uppercase tracking-wider">
                {lang === 'fr' ? 'ÉCONOMIE ENERGIE YTD' : 'YTD ENERGY SAVED'}
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#ff9d2b]/10 border border-[#ff9d2b]/30 flex items-center justify-center text-[#ff9d2b]">
                <Settings className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-mono font-black text-white tracking-tight cyber-text-glow">
                {metrics?.totalEnergySavedMwh ? `${metrics.totalEnergySavedMwh} MWh` : '124.6 MW'}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span className="text-amber-400 font-bold">-{esg?.carbonReductionPercent || '19.6'}% CO₂</span>
              <span>{lang === 'fr' ? 'Rapport Certifié' : 'Audited Report'}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff9d2b] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>

        </div>

        {/* Center Main Split: Neural Traffic 3D Canvas (Left) + Security AI Triage (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Hero: Neural Traffic 3D Mesh (8 Columns) */}
          <div className="lg:col-span-8 cyber-card p-5 flex flex-col justify-between relative overflow-hidden border-[#ff9d2b]/30 min-h-[440px]">
            
            {/* Header of Neural Traffic */}
            <div className="flex items-center justify-between mb-2 relative z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff9d2b] animate-ping" />
                <h2 className="text-sm sm:text-base font-mono font-black text-white uppercase tracking-wider">
                  Neural Traffic
                </h2>
              </div>

              {/* Mode Selector Pill */}
              <div className="flex items-center gap-1 bg-[#150e24]/90 p-1 rounded-xl border border-[#ff9d2b]/30">
                <button
                  onClick={() => setTrafficMode('breathe')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    trafficMode === 'breathe' 
                      ? 'bg-[#ff9d2b] text-black font-black shadow-[0_0_10px_rgba(255,157,43,0.5)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Breathes with light ▾
                </button>
                <button
                  onClick={() => setTrafficMode('fast')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    trafficMode === 'fast' 
                      ? 'bg-[#ff9d2b] text-black font-black shadow-[0_0_10px_rgba(255,157,43,0.5)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Fast Pulse
                </button>
                <button
                  onClick={() => setTrafficMode('quantum')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    trafficMode === 'quantum' 
                      ? 'bg-[#a78bfa] text-black font-black shadow-[0_0_10px_rgba(167,139,250,0.5)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Quantum Sync
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative flex-1 w-full min-h-[360px] rounded-xl overflow-hidden cursor-crosshair">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full block"
              />
              
              {/* Overlay HUD Telemetry */}
              <div className="absolute bottom-3 left-3 bg-[#0c0817]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#ff9d2b]/25 text-[10px] font-mono flex items-center gap-3 text-gray-300">
                <span className="text-[#ff9d2b] font-bold">FREQ: 142.8 GHz</span>
                <span>•</span>
                <span>NODES: 560 ACTIVE</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">STATE: COHERENT</span>
              </div>
            </div>

          </div>

          {/* Right Panel: SECURITY AI TRIAGE (4 Columns) */}
          <div className="lg:col-span-4 cyber-card p-5 flex flex-col justify-between border-[#ff9d2b]/30 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#ff9d2b]/15">
              <h2 className="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#ff9d2b]" />
                <span>SECURITY AI TRIAGE</span>
              </h2>
              <button 
                id="btn-triage-options" 
                className="text-gray-400 hover:text-white p-1"
                aria-label="Triage options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Real-time Packet Stream Frequency Equalizer */}
            <div className="bg-[#120a1f]/80 p-3.5 rounded-xl border border-[#ff9d2b]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-300">Real-time packet stream</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#ff9d2b]/20 text-[#ffb04f] border border-[#ff9d2b]/40">
                  Real-time
                </span>
              </div>

              {/* Audio / Waveform Visualizer Bars */}
              <div className="h-16 flex items-end justify-between gap-1 pt-2 px-1">
                {Array.from({ length: 28 }).map((_, i) => {
                  const heightPercent = Math.max(15, Math.sin(i * 0.45 + Date.now() * 0.002) * 50 + 50);
                  const isHighlight = i % 5 === 0;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 rounded-t-sm transition-all duration-150"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: isHighlight ? '#ff9d2b' : 'rgba(255, 157, 43, 0.45)',
                        boxShadow: isHighlight ? '0 0 8px rgba(255, 157, 43, 0.8)' : 'none'
                      }}
                    />
                  );
                })}
              </div>

              {/* Timeline markers */}
              <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1">
                <span>00:00</span>
                <span>05:00</span>
                <span>10:00</span>
                <span>15:00</span>
                <span>20:00</span>
              </div>
            </div>

            {/* Holographic Badges Event Stream */}
            <div className="space-y-2 overflow-y-auto max-h-[170px] pr-1">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc.id)}
                  className="p-2.5 rounded-xl bg-[#140c24]/90 border border-[#ff9d2b]/20 hover:border-[#ff9d2b]/60 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Holographic emblem */}
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed]/40 to-[#ff9d2b]/40 border border-[#ff9d2b]/40 flex items-center justify-center shrink-0 text-[#ffb04f] shadow-[0_0_8px_rgba(255,157,43,0.2)]">
                      <span className="material-symbols-outlined text-[16px]">{inc.icon}</span>
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-mono font-bold text-gray-200 group-hover:text-white truncate">
                        {inc.title}
                      </p>
                      <p className="text-[9px] font-mono text-[#a78bfa]">
                        {inc.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#ff9d2b] shrink-0" />
                </div>
              ))}
            </div>

            {/* Bottom Gauges: AI Confidence Level & Active Threats */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#ff9d2b]/15">
              
              {/* AI Confidence Gauge */}
              <div className="bg-[#120a1f]/80 p-3 rounded-xl border border-[#ff9d2b]/20 text-center">
                <span className="text-[10px] font-mono text-gray-400 block mb-1">
                  AI Confidence Level
                </span>
                
                {/* Semi-circle SVG Speedometer */}
                <div className="relative w-24 h-12 mx-auto mt-1">
                  <svg className="w-24 h-12" viewBox="0 0 100 50">
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#2a1b42"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 50 A 40 40 0 0 1 86 35"
                      fill="none"
                      stroke="#ff9d2b"
                      strokeWidth="8"
                      strokeDasharray="125"
                      strokeDashoffset="10"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                
                <span className="text-xs font-mono font-black text-white cyber-text-glow mt-1 block">
                  High (96%)
                </span>
              </div>

              {/* Active Threats Counter */}
              <div className="bg-[#120a1f]/80 p-3 rounded-xl border border-[#ff9d2b]/20 text-center flex flex-col justify-between">
                <span className="text-[10px] font-mono text-gray-400">
                  Active Threats
                </span>
                
                <div className="my-auto">
                  <span className="text-3xl font-mono font-black text-white cyber-text-glow">
                    {threatCount}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setThreatCount(0);
                    setMitigatedCount((prev) => prev + 1);
                  }}
                  className="w-full py-1 rounded bg-[#ff9d2b]/15 hover:bg-[#ff9d2b]/30 text-[#ffb04f] border border-[#ff9d2b]/30 text-[9px] font-mono font-bold transition-all"
                >
                  {threatCount > 0 ? 'Auto-Mitigate' : 'All Clear ✓'}
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Row Analytics: Real-Time Request Load & Latency Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Real-Time Request Load (Last 1 Hour) */}
          <div className="cyber-card p-5 border-[#ff9d2b]/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Real-Time Request Load (Last 1 Hour)</span>
              </h3>
              <button 
                id="btn-request-load-more"
                className="text-gray-400 hover:text-white"
                aria-label="Request load options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={requestLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="loadGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9d2b" stopOpacity={0.65}/>
                      <stop offset="95%" stopColor="#ff9d2b" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="loadGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffd166" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#ffd166" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 157, 43, 0.1)" vertical={false} />
                  <XAxis dataKey="time" stroke="#6b5b7b" tick={{ fill: '#8b7c9e', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b5b7b" tick={{ fill: '#8b7c9e', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#120a1f',
                      borderColor: '#ff9d2b',
                      borderRadius: '0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#ffffff'
                    }}
                  />
                  <Area type="monotone" dataKey="primary" stroke="#ff9d2b" strokeWidth={2.5} fillOpacity={1} fill="url(#loadGrad1)" />
                  <Area type="monotone" dataKey="secondary" stroke="#ffd166" strokeWidth={2} fillOpacity={1} fill="url(#loadGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-[#ff9d2b]/15">
              <span>Peak: 22.4K req/s</span>
              <span className="text-[#ff9d2b] font-bold">Adaptive Load Balancer CDG1</span>
            </div>
          </div>

          {/* Chart 2: Latency Distribution (Last 24 Hours) */}
          <div className="cyber-card p-5 border-[#ff9d2b]/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Latency Distribution (Last 24 Hours)</span>
              </h3>
              
              {/* Percentile Legend Indicator */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                <span className="inline-flex items-center gap-1 text-[#ffd166]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffd166]" /> p50
                </span>
                <span className="inline-flex items-center gap-1 text-[#ffb04f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb04f]" /> p75
                </span>
                <span className="inline-flex items-center gap-1 text-[#ff9d2b]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9d2b]" /> p90
                </span>
                <span className="inline-flex items-center gap-1 text-[#e65100]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e65100]" /> p99
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 157, 43, 0.1)" vertical={false} />
                  <XAxis dataKey="time" stroke="#6b5b7b" tick={{ fill: '#8b7c9e', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b5b7b" tick={{ fill: '#8b7c9e', fontSize: 10, fontFamily: 'monospace' }} unit="ms" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#120a1f',
                      borderColor: '#ff9d2b',
                      borderRadius: '0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: '#ffffff'
                    }}
                  />
                  <Line type="monotone" dataKey="p50" stroke="#ffd166" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="p75" stroke="#ffb04f" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="p90" stroke="#ff9d2b" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="p99" stroke="#e65100" strokeWidth={3} dot={{ r: 3, fill: '#e65100' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-[#ff9d2b]/15">
              <span>Average Jitter: 0.8ms</span>
              <span className="text-emerald-400 font-bold">100% SLA Maintained</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
