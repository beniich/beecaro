import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  Wrench, 
  Leaf, 
  Cpu, 
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AiChatMessage } from '../../types';

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      timestamp: '10:00 AM',
      content: "Hello! I am your BeeCarbonit Spider AI Facility Copilot. I continuously analyze HVAC chiller delta-T curves, solar PV generation patterns, elevator harmonic frequencies, and lease energy compliance. How can I assist your operations today?",
      actionableInsights: [
        {
          title: "Optimize Chiller #1 Setpoint for 4.8% Energy Drop",
          actionLabel: "Apply Thermodynamic Offset",
          category: "energy"
        },
        {
          title: "Elevator #02 Harmonic Vibration Alert (3.8 mm/s)",
          actionLabel: "Generate Work Order WO-2026-0842",
          category: "cmms"
        }
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "Analyzing facility telemetry streams...";
      let insights: AiChatMessage['actionableInsights'] = [];

      const lower = query.toLowerCase();
      if (lower.includes('chiller') || lower.includes('hvac') || lower.includes('energy')) {
        botReply = "Based on current chilled water return temperatures (6.8°C at 96% efficiency) and outside wet-bulb temperatures (24°C), increasing the chilled water setpoint by 0.5°C will reduce compressor electrical load by 18.2 kW without compromising tenant comfort.";
        insights = [
          {
            title: "Shift Chiller #1 to Eco-Equilibrium Mode",
            actionLabel: "Execute BMS Setpoint Change",
            category: "energy"
          }
        ];
      } else if (lower.includes('carbon') || lower.includes('esg') || lower.includes('market')) {
        botReply = "Your portfolio is currently tracking at 418.2 tCO2e YTD, outperforming your 520 tCO2e ceiling by 19.6%. You have 3,500 Gold Standard Carbon Credits available. Retiring 200 VCUs will achieve net-zero certification for Q3.";
        insights = [
          {
            title: "Retire 200 Gold Standard Credits",
            actionLabel: "Execute Offset Retirement",
            category: "esg"
          }
        ];
      } else if (lower.includes('elevator') || lower.includes('vibration') || lower.includes('maintenance')) {
        botReply = "Elevator Traction 02 harmonic vibration reached 3.8 mm/s at 09:15 AM (normal baseline is ≤ 2.5 mm/s). Work order WO-2026-0842 is assigned to Alexandre Mercer with high-viscosity synthetic lubricant dispatched.";
        insights = [
          {
            title: "Inspect Field Telemetry Logs for Elevator 02",
            actionLabel: "View Vibration Spectrogram",
            category: "cmms"
          }
        ];
      } else {
        botReply = `I have cross-referenced your query against the 1,420 IoT mesh telemetry points and BIM 4.0 models. All main building systems (Spider Tower A, Eco-Campus B, Bio-Tech Hub) are operating normally at a 94.2% composite health rating.`;
      }

      const assistantMsg: AiChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: botReply,
        actionableInsights: insights
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div id="ai-assistant-view" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-black dark:text-white shadow-lg shadow-emerald-950/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white flex items-center space-x-2">
              <span>Spider AI Facility & ESG Copilot</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Gemini 2.5 Pro Neural BMS
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Autonomous thermodynamic diagnostics, fault detection, and natural language operations dispatch
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[560px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'assistant'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-700 text-slate-200 border border-slate-600'
                }`}
              >
                {msg.sender === 'assistant' ? <Bot className="w-4 h-4" /> : 'ME'}
              </div>

              <div className={`max-w-xl space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'assistant'
                      ? 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-200 shadow-md'
                      : 'bg-emerald-600 text-black dark:text-white shadow-md'
                  }`}
                >
                  <p>{msg.content}</p>
                </div>

                {/* Actionable recommendations */}
                {msg.actionableInsights && msg.actionableInsights.length > 0 && (
                  <div className="space-y-2 pt-1 text-left">
                    {msg.actionableInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-200">{insight.title}</span>
                        </div>
                        <button
                          onClick={() => handleSend(`Execute action: ${insight.actionLabel}`)}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/40 transition-colors whitespace-nowrap ml-2"
                        >
                          {insight.actionLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono block px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Analyzing thermodynamic telemetry models...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="px-5 py-2 bg-white dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 dark:text-slate-500 font-mono whitespace-nowrap">Suggested:</span>
          {[
            "How can we reduce peak chiller load today?",
            "What is our Scope 2 carbon footprint this month?",
            "Show elevator 02 vibration diagnostics",
            "Are all tenants compliant with green lease clauses?"
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-black dark:text-white border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Copilot about energy optimization, CMMS dispatch, or ESG compliance..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-black dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 font-mono"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black dark:text-white transition-all shadow-lg shadow-emerald-950/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
