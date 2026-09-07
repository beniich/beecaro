import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Sliders, 
  Wrench, 
  Sparkles, 
  ChevronDown, 
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';
import { CyberCockpitNav } from './CyberCockpitNav';
import { NavigationPage } from '../../types/bizos';
import { useTelemetry } from '../../telemetry/hooks';

interface PredictedIssue {
  component: string;
  risk: 'High' | 'Critical' | 'Warning';
  predictionDate: string;
  action: string;
  estDays: number;
  score: number;
}

export const PredictiveCoreAnalysis: React.FC<{ onNavigate?: (page: NavigationPage) => void }> = ({ onNavigate }) => {
  const securityEvents = useTelemetry(s => s.securityEvents);
  const servers = useTelemetry(s => Array.from(s.servers.values()));
  
  const avgLoad = React.useMemo(() => 
    servers.reduce((sum, s) => sum + s.cpu, 0) / (servers.length || 1),
  [servers]);

  const [activeTab, setActiveTab] = useState<'overview' | 'predictive-core' | 'operations' | 'ai-insights'>('predictive-core');
  const [selectedVariant, setSelectedVariant] = useState('Variant 6');
  const [activeTooltip, setActiveTooltip] = useState<'blade' | 'bearing' | 'rotor' | null>('blade');
  const [inspectionScheduled, setInspectionScheduled] = useState(false);

  const predictedIssues = React.useMemo<PredictedIssue[]>(() => {
    // Dynamically generate predicted issues based on telemetry security events as proxy for anomalies
    const issues: PredictedIssue[] = securityEvents.slice(0, 3).map((a, i) => ({
      component: i === 0 ? 'HP Turbine Blade' : i === 1 ? 'Main Journal Bearing 2' : 'Combustion Chamber Liner',
      risk: a.severity === 'critical' ? 'Critical' : a.severity === 'info' ? 'Warning' : 'High',
      predictionDate: new Date(a.timestamp + (i + 1) * 86400000 * 30).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      action: a.type === 'ddos' ? 'Schedule Inspection' : 'Thermal Recalibration',
      estDays: Math.floor(avgLoad / 2),
      score: Math.min(99, Math.floor(avgLoad + (a.severity === 'critical' ? 20 : 10)))
    }));

    if (issues.length < 3) {
      // Add placeholders if not enough anomalies
      issues.push({ component: 'Exhaust Nozzle', risk: 'Warning', predictionDate: 'Mar 12', action: 'Visual Check', estDays: 140, score: 45 });
    }

    return issues.slice(0, 3);
  }, [securityEvents, avgLoad]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-precision interactive 3D Cutaway Turbine Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 700;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w * 0.48;
      const cy = h * 0.52;

      ctx.clearRect(0, 0, w, h);

      // Cyber floor grid reflection
      ctx.strokeStyle = 'rgba(255, 157, 43, 0.04)';
      ctx.lineWidth = 1;
      for (let y = cy + 40; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Main Turbine Cutaway Blueprint Shell (Metallic Industrial Titanium Gradients)
      const gradShell = ctx.createLinearGradient(cx - 240, cy - 120, cx + 240, cy + 120);
      gradShell.addColorStop(0, '#1c2838');
      gradShell.addColorStop(0.5, '#486282');
      gradShell.addColorStop(1, '#182434');

      // Outer intake cowl
      ctx.fillStyle = gradShell;
      ctx.strokeStyle = '#688baa';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.ellipse(cx - 180, cy, 32, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Intake blades ring
      const numBlades = 18;
      for (let b = 0; b < numBlades; b++) {
        const bladeAngle = (b / numBlades) * Math.PI * 2 + t * 0.4;
        const bx = cx - 180 + Math.cos(bladeAngle) * 20;
        const by = cy + Math.sin(bladeAngle) * 95;
        ctx.strokeStyle = '#8bb5db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 180, cy);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // Shaft Center Rotor Axis
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx - 240, cy - 14, 460, 28);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(cx - 240, cy - 14, 460, 28);

      // Compressor Multi-stage Blade Discs (Stages 1 through 6)
      const stageXs = [-130, -90, -50, -10, 30, 70];
      stageXs.forEach((sx, idx) => {
        const stageH = 85 - idx * 7;
        const stageW = 12;

        ctx.fillStyle = '#334963';
        ctx.strokeStyle = '#7aa0c6';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cx + sx, cy - stageH, stageW, stageH * 2);
        ctx.strokeRect(cx + sx, cy - stageH, stageW, stageH * 2);

        // Blade spin lines
        for (let l = 0; l < 4; l++) {
          const ly = cy - stageH + 15 + l * (stageH * 0.4);
          ctx.strokeStyle = '#a4c7eb';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx + sx + 2, ly);
          ctx.lineTo(cx + sx + stageW - 2, ly + Math.sin(t * 3 + idx) * 4);
          ctx.stroke();
        }
      });

      // High-Pressure Combustion Chamber (Glowing Orange Thermal Core)
      const combustX = cx + 110;
      const combustY1 = cy - 75;
      const combustY2 = cy + 75;

      // Thermal Heat Chamber Glow Top
      const heatGrad1 = ctx.createRadialGradient(combustX + 30, combustY1, 10, combustX + 30, combustY1, 60);
      heatGrad1.addColorStop(0, 'rgba(255, 140, 0, 0.9)');
      heatGrad1.addColorStop(0.6, 'rgba(255, 90, 0, 0.5)');
      heatGrad1.addColorStop(1, 'rgba(255, 60, 0, 0)');

      ctx.fillStyle = heatGrad1;
      ctx.beginPath();
      ctx.arc(combustX + 30, combustY1, 55, 0, Math.PI * 2);
      ctx.fill();

      // Thermal Heat Chamber Glow Bottom
      const heatGrad2 = ctx.createRadialGradient(combustX + 30, combustY2, 10, combustX + 30, combustY2, 60);
      heatGrad2.addColorStop(0, 'rgba(255, 140, 0, 0.9)');
      heatGrad2.addColorStop(0.6, 'rgba(255, 90, 0, 0.5)');
      heatGrad2.addColorStop(1, 'rgba(255, 60, 0, 0)');

      ctx.fillStyle = heatGrad2;
      ctx.beginPath();
      ctx.arc(combustX + 30, combustY2, 55, 0, Math.PI * 2);
      ctx.fill();

      // HP Turbine Section Casing Cutaway Arc
      ctx.strokeStyle = '#ff9d2b';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff5e00';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(combustX + 30, combustY1, 42, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(combustX + 30, combustY2, 42, 0, Math.PI * 1.4);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Exhaust Nozzle Diffuser (Right)
      ctx.fillStyle = '#223246';
      ctx.strokeStyle = '#547599';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 175, cy - 80);
      ctx.lineTo(cx + 240, cy - 105);
      ctx.lineTo(cx + 240, cy + 105);
      ctx.lineTo(cx + 175, cy + 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vibration Alert Pulse Waves at Bearing Locations
      const pings = [
        { x: cx - 145, y: cy + 10, label: 'Bearing Alpha' },
        { x: cx - 95, y: cy + 50, label: 'Stage 2 Rotor' },
        { x: combustX + 30, y: cy - 45, label: 'HP Turbine Blade' },
        { x: combustX + 35, y: cy + 45, label: 'Combustion Liner' },
      ];

      pings.forEach((p, idx) => {
        const pulseR = ((t * 20 + idx * 15) % 28) + 6;
        const alpha = Math.max(0, 1 - pulseR / 34);

        ctx.strokeStyle = `rgba(255, 120, 0, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core dot
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ff5e00';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleScheduleInspection = () => {
    setInspectionScheduled(true);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#ff9d2b] selection:text-black">
      {/* Cockpit Nav Bar */}
      <CyberCockpitNav
        currentCockpit="predictive-core"
        title="Predictive Core Analysis"
        onNavigate={onNavigate}
      />

      {/* Sub Navigation Bar Matching Screenshot 1 & 2 */}
      <div className="bg-[#0b121e] border-b border-[#1b2b40] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1 sm:gap-4">
          <span className="font-bold text-[#ff9d2b] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff9d2b] animate-pulse" />
            BeeCarbonat: Predictive Core Analysis
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1 transition-all ${activeTab === 'overview' ? 'text-white border-b-2 border-[#ff9d2b] font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('predictive-core')}
              className={`py-1 transition-all ${activeTab === 'predictive-core' ? 'text-[#ff9d2b] border-b-2 border-[#ff9d2b] font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Predictive Maintenance Core
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`py-1 transition-all ${activeTab === 'operations' ? 'text-white border-b-2 border-[#ff9d2b] font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Operations Suite
            </button>
            <button
              onClick={() => setActiveTab('ai-insights')}
              className={`py-1 transition-all ${activeTab === 'ai-insights' ? 'text-white border-b-2 border-[#ff9d2b] font-bold' : 'text-gray-400 hover:text-gray-200'}`}
            >
              AI Insights
            </button>
          </div>
        </div>

        <div className="text-gray-400 text-xs font-mono flex items-center gap-1.5">
          <span>Home</span>
          <span>&gt;</span>
          <span>Predictive Core Analysis</span>
          <span>&gt;</span>
          <span className="text-[#ff9d2b] font-bold">Variant 6 of 10</span>
        </div>
      </div>

      {/* Main Grid: Left Cutaway (7 cols) + Right Gantt & Table (5 cols) */}
      <div className="flex-1 p-3 sm:p-5 grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Panel: 3D Turbine Cutaway & Risk Markers (7 Cols) */}
        <div className="xl:col-span-7 bg-[#0b1422]/90 rounded-2xl border border-[#1d324d] p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          {/* Header of Left Panel */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b40] z-10">
            <span className="font-mono font-black text-sm text-gray-200 uppercase tracking-wider">
              Predictive Core Analysis
            </span>

            <div className="flex items-center gap-2">
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="bg-[#122035] border border-[#274468] rounded-lg px-3 py-1 text-xs font-mono text-[#ff9d2b] font-bold focus:outline-none"
              >
                <option value="Variant 6">Variant 6</option>
                <option value="Variant 6 - Stress Mode">Variant 6 (Thermal Peak)</option>
                <option value="Variant 6 - Nominal">Variant 6 (Nominal)</option>
              </select>
            </div>
          </div>

          {/* 3D Cutaway Turbine Canvas Area */}
          <div className="flex-1 w-full min-h-[440px] my-2 relative rounded-xl border border-[#172a42] bg-[#070e1a] overflow-hidden flex items-center justify-center">
            
            {/* Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Interactive Popover Badge 1: High Pressure Turbine Blade (Matching Image 1) */}
            <div 
              onClick={() => setActiveTooltip('blade')}
              className="absolute top-12 right-16 sm:right-28 bg-[#0d1c2e]/95 border border-[#ff5e00] p-3 rounded-xl backdrop-blur-md z-20 shadow-[0_0_25px_rgba(255,94,0,0.35)] font-mono cursor-pointer transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-white font-bold">Failure Risk: <b className="text-[#ff5e00]">High</b></span>
                <span className="w-2 h-2 rounded-full bg-[#ff5e00] animate-ping" />
              </div>
              <div className="text-[11px] text-gray-300 mt-1">
                Risk Score: <b className="text-[#ff9d2b]">88%</b>
              </div>
              <div className="text-[10px] text-gray-400">
                Component: <b className="text-white">High-Pressure Turbine Blade</b>
              </div>
              <div className="text-[10px] text-[#ffb04f] mt-0.5 font-bold">
                Est. Failure: 45 Days
              </div>
            </div>

            {/* Vibration Alert Pin 1 (Left) */}
            <div className="absolute top-36 left-28 bg-[#1e1008]/90 border border-[#ff9d2b] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#ff9d2b] shadow-[0_0_12px_#ff9d2b] flex items-center gap-1.5 z-10 animate-bounce">
              <Activity className="w-3 h-3 text-[#ff9d2b]" />
              <span>Vibration Alert</span>
            </div>

            {/* Vibration Alert Pin 2 (Right) */}
            <div className="absolute bottom-28 right-36 bg-[#1e1008]/90 border border-[#ff9d2b] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#ff9d2b] shadow-[0_0_12px_#ff9d2b] flex items-center gap-1.5 z-10">
              <Flame className="w-3 h-3 text-[#ff5e00]" />
              <span>Vibration Alert</span>
            </div>

            {/* Interactive Popover Badge 2: Lower Stage Turbine Blade (Matching Image 1) */}
            <div 
              onClick={() => setActiveTooltip('rotor')}
              className="absolute bottom-12 left-32 sm:left-44 bg-[#0d1c2e]/95 border border-[#ff5e00] p-3 rounded-xl backdrop-blur-md z-20 shadow-[0_0_25px_rgba(255,94,0,0.35)] font-mono cursor-pointer transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-white font-bold">Failure Risk: <b className="text-[#ff5e00]">High</b></span>
              </div>
              <div className="text-[11px] text-gray-300 mt-1">
                Risk Score: <b className="text-[#ff9d2b]">88%</b>
              </div>
              <div className="text-[10px] text-gray-400">
                Component: <b className="text-white">High-Pressure Turbine Blade</b>
              </div>
              <div className="text-[10px] text-[#ffb04f] mt-0.5 font-bold">
                Est. Failure: 45 Days
              </div>
            </div>

          </div>

          {/* Bottom Telemetry Footer matching Image 1 */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#1b2b40] font-mono">
            <div>
              <div className="text-[11px] text-gray-400">Equipment Health:</div>
              <div className="text-xl font-black text-[#ff5e00] tracking-wide mt-0.5 cyber-text-glow">
                Critical
              </div>
            </div>

            <div>
              <div className="text-[11px] text-gray-400">Current Risk Level:</div>
              <div className="text-xl font-black text-[#ff9d2b] tracking-wide mt-0.5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#ff9d2b]" />
                <span>85%</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-gray-400">Variant Selector:</div>
              <div className="text-base font-bold text-gray-200 mt-0.5">
                6 / 10 <span className="text-slate-500 text-xs">(Current View)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Gantt Matrix + Top Predicted Issues (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Top Right Card: Predicted Maintenance Windows - Next 12 Months (Matching Image 1) */}
          <div className="bg-[#0b1422]/90 rounded-2xl border border-[#1d324d] p-4 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b40]">
              <span className="font-mono font-black text-xs text-gray-200 uppercase tracking-wider">
                Predicted Maintenance Windows - Next 12 Months
              </span>
              <span className="text-xs text-slate-500 font-mono">•••</span>
            </div>

            {/* 12 Months Column Headers */}
            <div className="grid grid-cols-12 gap-1 text-[9.5px] font-mono font-bold text-gray-400 text-center pt-3 pb-2 border-b border-white/5">
              <span>OCT</span>
              <span>NOV</span>
              <span>DEC</span>
              <span>JAN</span>
              <span>FEB</span>
              <span>MAR</span>
              <span>APR</span>
              <span>MAY</span>
              <span>JUN</span>
              <span>JUL</span>
              <span>AUG</span>
              <span>SEP</span>
            </div>

            {/* Gantt Bars Rows (Matching Image 1) */}
            <div className="my-3 space-y-2 font-mono text-[10px]">
              
              {/* Row 1 */}
              <div className="relative h-6 bg-[#080e18] rounded-lg overflow-hidden flex items-center px-1">
                <div className="h-4 w-1/12 bg-emerald-500 rounded-sm" />
                <div className="absolute left-[22%] flex items-center gap-1 bg-[#4a1212] border border-red-500 px-1.5 py-0.5 rounded text-[8.5px] text-white font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span>Predicted Failure, Dec 15, 2020</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="relative h-6 bg-[#080e18] rounded-lg overflow-hidden flex items-center px-1">
                <div className="ml-[8%] h-4 w-2/12 bg-amber-400/80 rounded-sm bg-stripes" />
                <div className="absolute left-[24%] w-2 h-2 rounded-sm bg-red-500" />
                <div className="absolute left-[36%] w-2 h-2 rounded-sm bg-red-500" />
              </div>

              {/* Row 3 */}
              <div className="relative h-6 bg-[#080e18] rounded-lg overflow-hidden flex items-center px-1">
                <div className="ml-[8%] h-4 w-4/12 bg-[#ff9d2b] rounded-sm" />
                <div className="absolute left-[36%] w-2 h-2 rounded-sm bg-red-500" />
              </div>

              {/* Row 4 */}
              <div className="relative h-6 bg-[#080e18] rounded-lg overflow-hidden flex items-center px-1">
                <div className="ml-[16%] h-4 w-3/12 bg-[#ff7a00]/70 rounded-sm" />
                <div className="ml-[6%] h-4 w-3/12 bg-[#ff9d2b] rounded-sm" />
                <div className="absolute left-[48%] flex items-center gap-1 bg-[#4a1212] border border-red-500 px-1.5 py-0.5 rounded text-[8.5px] text-white font-bold">
                  <span>Predicted Failure, Dec 15, 2020</span>
                </div>
              </div>

              {/* Row 5 */}
              <div className="relative h-6 bg-[#080e18] rounded-lg overflow-hidden flex items-center px-1">
                <div className="ml-[40%] h-4 w-3/12 bg-[#ff7a00] rounded-sm" />
                <div className="absolute left-[56%] flex items-center gap-1 bg-[#4a1212] border border-red-500 px-1.5 py-0.5 rounded text-[8.5px] text-white font-bold">
                  <span>Predicted Failure, Dec 15, 2022</span>
                </div>
              </div>

              {/* Row 6 */}
              <div className="relative h-6 bg-[#080e18] rounded-lg overflow-hidden flex items-center px-1">
                <div className="ml-[56%] h-4 w-3/12 bg-gradient-to-r from-[#ff9d2b] to-[#ff5e00] rounded-sm" />
              </div>

              {/* Row 7 */}
              <div className="relative h-6 bg-[#080e18] rounded-lg overflow-hidden flex items-center px-1">
                <div className="ml-[72%] h-4 w-3/12 bg-[#ff5e00] rounded-sm" />
                <div className="absolute right-[8%] flex items-center gap-1 bg-[#4a1212] border border-red-500 px-1 py-0.5 rounded text-[8px] text-white font-bold">
                  <span>Dec 13, 2022</span>
                </div>
              </div>

            </div>

            {/* Color Coding Legend Matching Image 1 */}
            <div className="pt-2 border-t border-white/5 font-mono text-[10px] space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-emerald-400 font-bold">Green: Healthy</span>
                <span className="text-amber-400 font-bold">Yellow: Warning</span>
                <span className="text-[#ff9d2b] font-bold">Orange: High Risk</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-red-400 font-bold">Red: Critical Failure Prediction</span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2.5 h-2.5 bg-red-600 inline-block rounded-xs" />
                  <span>Predicted Failure</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Right Card: Top Predicted Issues (Matching Image 1) */}
          <div className="bg-[#0b1422]/90 rounded-2xl border border-[#1d324d] p-4 shadow-2xl flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b40]">
              <span className="font-mono font-black text-xs text-gray-200 uppercase tracking-wider">
                Top Predicted Issues
              </span>
            </div>

            {/* Table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-gray-400 text-[10.5px] border-b border-white/5 pb-2">
                    <th className="pb-2">Component</th>
                    <th className="pb-2">Risk</th>
                    <th className="pb-2">Prediction Date</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {predictedIssues.map((issue, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-bold text-gray-200">
                        {issue.component}
                      </td>
                      <td className="py-2.5">
                        <span className={`font-bold ${issue.risk === 'High' ? 'text-[#ff9d2b]' : 'text-amber-400'}`}>
                          {issue.risk}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-300">
                        {issue.predictionDate}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={handleScheduleInspection}
                          className="px-2.5 py-1 rounded bg-[#ff9d2b] hover:bg-[#ffb04f] text-black font-bold text-[10px] transition-all"
                        >
                          {issue.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {inspectionScheduled && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Work Order #4829 dispatched to Chiller & Turbine Specialist team.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
