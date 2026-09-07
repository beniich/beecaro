import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Wifi, 
  Database, 
  Bell, 
  CheckCircle2, 
  Save, 
  Key, 
  Cpu, 
  Server
} from 'lucide-react';

export const PlatformSettings: React.FC = () => {
  const [mqttEndpoint, setMqttEndpoint] = useState('mqtts://mesh-telemetry.beecarbonat.internal:8883');
  const [bmsSyncInterval, setBmsSyncInterval] = useState('500');
  const [autoDispatchThreshold, setAutoDispatchThreshold] = useState('high');
  const [carbonOffsetAutoRetire, setCarbonOffsetAutoRetire] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">System Integrations & Telemetry Mesh Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              BACnet/IP, Modbus TCP, MQTT broker endpoints, and automated ESG carbon offsets
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Configuration parameters updated and broadcast to BACnet / MQTT broker mesh.</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* IoT Broker Config */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-black dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>IoT MQTT & BACnet/IP Mesh Gateway</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">MQTT TLS Broker URI</label>
              <input
                type="text"
                value={mqttEndpoint}
                onChange={(e) => setMqttEndpoint(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1">BMS Telemetry Poll Interval (ms)</label>
              <input
                type="text"
                value={bmsSyncInterval}
                onChange={(e) => setBmsSyncInterval(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Automated ESG & CMMS Rules */}
        <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-black dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Automated ESG & CMMS Dispatch Policies</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={carbonOffsetAutoRetire}
                onChange={(e) => setCarbonOffsetAutoRetire(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-emerald-500"
              />
              <span className="text-slate-200 font-medium">
                Auto-retire Gold Standard carbon credits when monthly Scope 1 emissions exceed budgeted baseline
              </span>
            </label>

            <div className="pt-2">
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-mono">
                Auto-Dispatch Work Order Severity Trigger
              </label>
              <select
                value={autoDispatchThreshold}
                onChange={(e) => setAutoDispatchThreshold(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="critical">Critical Only (Vibration &gt; 3.5mm/s or Thermal Overload)</option>
                <option value="high">High & Critical Severity</option>
                <option value="all">All Anomaly Deviations</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
