const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, ShieldAlert, Cpu, Activity, Send, ScanLine, X, ChevronRight, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'OK' | 'DATA' | 'CMD' | 'AI';
  message: string;
}

export const GodModeSystemView: React.FC<{ onNavigate?: (id: string) => void }> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '2024-08-28 10:15:32', level: 'INFO', message: 'AI Core rebalanced load across nodes.' },
    { id: '2', time: '2024-08-28 10:15:35', level: 'WARN', message: 'Anomaly detected in Sector 4 cooling.' },
    { id: '3', time: '2024-08-28 10:15:38', level: 'OK', message: 'Automated response initiated.' },
    { id: '4', time: '2024-08-28 10:15:41', level: 'INFO', message: 'System integrity verified.' },
    { id: '5', time: '2024-08-28 10:15:45', level: 'DATA', message: 'Energy optimization model updated.' },
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const runOmniScan = async () => {
    setIsScanning(true);
    setShowAiPanel(true);
    setAiAnalysis('');
    
    // Add command log
    const now = new Date();
    const timeStr = \`\${now.toISOString().slice(0, 10)} \${now.toTimeString().slice(0, 8)}\`;
    setLogs(prev => [...prev, { id: String(Date.now()), time: timeStr, level: 'CMD', message: 'Execute protocol OMEGA-7 (Deep Scan).' }]);

    try {
      // We send a prompt to our Gemini backend to analyze a simulated anomaly based on the UI context
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "The user has initiated Protocol OMEGA-7 (Deep Scan) on the Main Reactor. Anomaly detected in Sector 4 cooling (98% capacity). Generate a highly technical, cyberpunk-style AI diagnostic report detailing the anomaly root cause and recommending immediate mitigation steps. Keep it under 150 words. Format with bold keywords and bullet points.",
          systemInstruction: "You are the central AI Core of the BeeCarbonat God-Mode System. You speak in a highly analytical, precise, and slightly urgent tone."
        })
      });
      
      const data = await response.json();
      
      if (data.text) {
        setAiAnalysis(data.text);
        setLogs(prev => [...prev, { id: String(Date.now()+1), time: timeStr, level: 'AI', message: 'OMEGA-7 Scan complete. See diagnostics panel.' }]);
      } else {
        setAiAnalysis("Error retrieving AI Diagnostics: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      setAiAnalysis("Critical Error: Connection to AI Core failed. " + err.message);
    } finally {
      setTimeout(() => setIsScanning(false), 2000); // let scanner sweep a bit more
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0616] overflow-hidden font-sans select-none flex flex-col">
      
      {/* 
        USER IMAGE INTEGRATION:
        We place the requested image as the absolute background of this view.
        We instruct the user to ensure the file is named "image.png" in the public/ folder.
      */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src="/image.png" 
          alt="God-Mode System View" 
          className="w-full h-full object-cover object-center opacity-90"
          onError={(e) => {
            // Fallback text if the image is missing
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-500 font-mono text-center px-10">
          <div>
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Image background not found.</p>
            <p className="text-xs mt-2">Please upload your image to the <code>public/</code> folder and name it <code>image.png</code></p>
          </div>
        </div>
        
        {/* Scanner Overlay Animation */}
        {isScanning && (
          <motion.div 
            className="absolute left-0 right-0 h-[4px] bg-sky-400 shadow-[0_0_20px_4px_rgba(56,189,248,0.7)] z-10"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* TOP NAVIGATION / STATUS BAR */}
      <div className="relative z-20 flex justify-between items-center px-6 py-4 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wider">God-Mode System View</h1>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SYSTEM ONLINE • OMEGA PROTOCOL READY
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={runOmniScan}
            disabled={isScanning}
            className={\`px-4 py-2 rounded font-mono text-xs font-bold transition-all flex items-center gap-2 \${
              isScanning 
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
            }\`}
          >
            {isScanning ? <ScanLine className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            {isScanning ? 'SCANNING SECTORS...' : 'INITIATE OMEGA-7 (DEEP SCAN)'}
          </button>
        </div>
      </div>

      {/* AI DIAGNOSTICS PANEL (Powerful Function) */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-6 top-24 w-96 max-h-[70vh] bg-[#0f0a1c]/90 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-purple-500/20 bg-purple-500/10">
              <div className="flex items-center gap-2 text-purple-300 font-mono text-sm">
                <Cpu className="w-4 h-4" />
                AI Core Diagnostics
              </div>
              <button onClick={() => setShowAiPanel(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              {aiAnalysis ? (
                <div 
                  className="prose prose-invert prose-sm font-mono text-purple-100"
                  dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\\n/g, '<br/>').replace(/\\*\\*(.*?)\\*\\*/g, '<span class="text-amber-400 font-bold">$1</span>') }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-purple-400/50 space-y-4">
                  <ScanLine className="w-8 h-8 animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest animate-pulse">Analyzing Anomaly...</span>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-black/40 border-t border-purple-500/20 text-[10px] font-mono text-purple-400/50 flex justify-between">
              <span>MODEL: GEMINI-3.7-FLASH</span>
              <span>SECURE LINK ENCRYPTED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE LOG TERMINAL (Bottom) */}
      <div className="absolute bottom-6 left-6 right-6 h-48 bg-[#0a0616]/80 backdrop-blur-md border border-[#302b40] rounded-xl flex flex-col z-20 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#302b40] bg-black/20">
          <span className="text-[#a599b5] text-xs font-mono font-bold flex items-center gap-2">
            <Terminal className="w-3 h-3" /> Live Log
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>
        
        <div 
          ref={logContainerRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 custom-scrollbar"
        >
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
              <span className="text-[#a599b5] shrink-0">{log.time}</span>
              <span className={\`shrink-0 w-[40px] \${
                log.level === 'INFO' ? 'text-sky-400' :
                log.level === 'WARN' ? 'text-amber-400' :
                log.level === 'OK' ? 'text-emerald-400' :
                log.level === 'DATA' ? 'text-purple-400' :
                log.level === 'AI' ? 'text-pink-400 font-bold' :
                'text-red-400 font-bold'
              }\`}>
                [{log.level}]
              </span>
              <span className="text-[#d4cce3]">{log.message}</span>
            </div>
          ))}
          {isScanning && (
            <div className="flex gap-3 px-2 py-0.5">
              <span className="text-amber-400 animate-pulse font-bold">_</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
`;

fs.writeFileSync('src/components/cyber/GodModeSystemView.tsx', code);
console.log("Patched GodModeSystemView");
