import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Thermometer, Zap, Calendar, CheckCircle2, Clock, 
  Maximize2, Sparkles, LayoutGrid, List, BarChart2, Briefcase, Calculator,
  Plus, Minus, RefreshCw, Flame, Snowflake, UserCheck, UserMinus, ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { api } from '../../services/api';

interface SpacesManagerProps {
  lang?: 'fr' | 'en';
}

interface FloorData {
  floor: string;
  desksTotal: number;
  occupied: number;
  occupancyRate: number;
  tempC: number;
  department: string;
}

const defaultFloorOccupancy: FloorData[] = [
  { floor: 'RDC / Lobby', desksTotal: 40, occupied: 32, occupancyRate: 80, tempC: 21.5, department: 'Reception' },
  { floor: 'Level 1', desksTotal: 120, occupied: 102, occupancyRate: 85, tempC: 22.0, department: 'Sales & Mktg' },
  { floor: 'Level 2', desksTotal: 120, occupied: 114, occupancyRate: 95, tempC: 22.8, department: 'Engineering' },
  { floor: 'Level 3', desksTotal: 120, occupied: 84, occupancyRate: 70, tempC: 21.8, department: 'Operations' },
  { floor: 'Level 4 (Lab)', desksTotal: 80, occupied: 48, occupancyRate: 60, tempC: 20.5, department: 'R&D' },
  { floor: 'Level 5 (Exec)', desksTotal: 50, occupied: 35, occupancyRate: 70, tempC: 21.0, department: 'C-Suite' },
];

// Stable list of potential user initials/names for high-fidelity interactive desks
const MOCK_NAMES: Record<string, string[]> = {
  'Reception': ['Sarah L.', 'John D.', 'Clara M.', 'Robert P.', 'Lucie B.', 'Marc T.', 'Amine K.', 'Julie V.'],
  'Sales & Mktg': ['Thomas G.', 'Emma R.', 'Leo V.', 'Chloe D.', 'Adrien M.', 'Sophia N.', 'Lucas F.', 'Eva S.', 'Mathis B.', 'Nina L.'],
  'Engineering': ['Julien P.', 'Alexandre K.', 'Nicolas B.', 'Ines D.', 'Arthur M.', 'Léa C.', 'Mehdi R.', 'Camille T.', 'Yanis O.', 'Fanny S.'],
  'Operations': ['Antoine S.', 'Marine P.', 'Simon G.', 'Zoe T.', 'Maxime C.', 'Elisa R.', 'Paul W.', 'Louise F.', 'Adel B.', 'Celia H.'],
  'R&D': ['Prof. Albert', 'Dr. Helen', 'David F.', 'Laura S.', 'Olivier R.', 'Marie C.', 'Thibaut D.', 'Isabelle M.'],
  'C-Suite': ['CEO Alex', 'CFO Rachel', 'CTO William', 'HRD Nathalie', 'CRO Charles', 'VP Growth']
};

export const SpacesManager: React.FC<SpacesManagerProps> = ({ lang = 'fr' }) => {
  const [floorOccupancy, setFloorOccupancy] = useState<FloorData[]>(defaultFloorOccupancy);
  const [selectedFloorName, setSelectedFloorName] = useState<string>('Level 2');
  const [viewMode, setViewMode] = useState<'visual' | 'enterprise'>('visual');
  const [customNotification, setCustomNotification] = useState<string | null>(null);

  // Load from API if available
  useEffect(() => {
    api.getSpaces().then(data => {
      if (data && data.length > 0) {
        setFloorOccupancy(data.map((f: any) => ({
          floor: f.floor || f.name,
          desksTotal: Number(f.desksTotal || 100),
          occupied: Number(f.occupied || 50),
          occupancyRate: Math.round(((f.occupied || 50) / (f.desksTotal || 100)) * 100),
          tempC: Number(f.tempC || 21.0),
          department: f.department || 'General'
        })));
      }
    });
  }, []);

  const selectedFloor = floorOccupancy.find(f => f.floor === selectedFloorName) || floorOccupancy[2];

  const triggerNotification = (message: string) => {
    setCustomNotification(message);
    setTimeout(() => {
      setCustomNotification(null);
    }, 3000);
  };

  // Adjust Temperature for a specific floor
  const handleTempChange = (floorName: string, delta: number) => {
    setFloorOccupancy(prev => prev.map(f => {
      if (f.floor === floorName) {
        const nextTemp = parseFloat((f.tempC + delta).toFixed(1));
        const cappedTemp = Math.max(16, Math.min(28, nextTemp));
        return { ...f, tempC: cappedTemp };
      }
      return f;
    }));
  };

  // Adjust Occupancy (Add or remove a physical mock worker)
  const handleWorkerToggle = (floorName: string, isArriving: boolean) => {
    setFloorOccupancy(prev => prev.map(f => {
      if (f.floor === floorName) {
        const delta = isArriving ? 1 : -1;
        const nextOccupied = Math.max(0, Math.min(f.desksTotal, f.occupied + delta));
        const nextRate = Math.round((nextOccupied / f.desksTotal) * 100);
        return { ...f, occupied: nextOccupied, occupancyRate: nextRate };
      }
      return f;
    }));
  };

  // Bulk Mock Scenarios
  const handleTriggerScenario = (scenario: 'peak' | 'weekend' | 'eco' | 'reset') => {
    if (scenario === 'peak') {
      setFloorOccupancy(prev => prev.map(f => {
        const nextOccupied = Math.round(f.desksTotal * (0.88 + Math.random() * 0.1));
        return {
          ...f,
          occupied: nextOccupied,
          occupancyRate: Math.round((nextOccupied / f.desksTotal) * 100),
          tempC: parseFloat((22.5 + Math.random() * 1).toFixed(1))
        };
      }));
      triggerNotification("Scenario Activé: Heures de Pointe d'Entreprise (Occupation max)");
    } else if (scenario === 'weekend') {
      setFloorOccupancy(prev => prev.map(f => {
        const nextOccupied = Math.round(f.desksTotal * (0.1 + Math.random() * 0.15));
        return {
          ...f,
          occupied: nextOccupied,
          occupancyRate: Math.round((nextOccupied / f.desksTotal) * 100),
          tempC: parseFloat((19.0 + Math.random() * 0.8).toFixed(1))
        };
      }));
      triggerNotification("Scenario Activé: Mode Week-end / Télétravail (Basse consommation)");
    } else if (scenario === 'eco') {
      setFloorOccupancy(prev => prev.map(f => ({
        ...f,
        tempC: 21.0
      })));
      triggerNotification("Scenario Activé: Optimisation Thermique RSE (Toutes les zones à 21°C)");
    } else if (scenario === 'reset') {
      setFloorOccupancy(defaultFloorOccupancy);
      triggerNotification("Réinitialisation complète des allocations de l'infrastructure.");
    }
  };

  // Toggle individual desk on visual map
  const handleDeskClick = (index: number) => {
    const isOccupiedCurrently = index < selectedFloor.occupied;
    handleWorkerToggle(selectedFloor.floor, !isOccupiedCurrently);
    triggerNotification(`Poste #${index + 1} réaffecté en temps réel.`);
  };

  // Render desks for selected floor view
  const renderInteractiveDesks = () => {
    // Generate a list of desks based on floor parameters (max 24 shown visually for clarity)
    const visualDeskCount = Math.min(24, selectedFloor.desksTotal);
    const mockWorkers = MOCK_NAMES[selectedFloor.department] || MOCK_NAMES['Reception'];

    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3.5">
        {Array.from({ length: visualDeskCount }).map((_, idx) => {
          const isOccupied = idx < selectedFloor.occupied;
          const deskName = isOccupied ? mockWorkers[idx % mockWorkers.length] : 'Disponible';
          
          return (
            <button
              key={idx}
              id={`desk-node-${idx}`}
              onClick={() => handleDeskClick(idx)}
              className={`p-3 rounded-2xl border text-center transition-all duration-200 relative group overflow-hidden ${
                isOccupied 
                  ? 'bg-indigo-500/10 dark:bg-indigo-500/5 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/15' 
                  : 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
              }`}
            >
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-slate-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase block opacity-40">
                P-{idx + 1}
              </div>
              <div className={`w-2 h-2 rounded-full mx-auto my-1.5 ${isOccupied ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
              
              <div className="text-[10px] font-sans font-semibold truncate block max-w-full">
                {deskName}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  // Recharts Financial Summary
  const chartData = floorOccupancy.map(f => ({
    name: f.floor,
    "Loyer Mensuel (€k)": Math.round((f.desksTotal * 45.5) / 1000),
    "Allocation Réelle (€k)": Math.round((f.occupied * 45.5) / 1000)
  }));

  return (
    <div id="spaces-manager-view" className="space-y-5 animate-in fade-in duration-300">
      
      {/* Dynamic Toast Notification */}
      {customNotification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-mono text-xs rounded-2xl border border-slate-700/50 shadow-2xl animate-bounce flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{customNotification}</span>
        </div>
      )}

      {/* Enterprise Header */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="bg-indigo-500/10 text-indigo-500 p-3 rounded-2xl border border-indigo-500/20 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              Enterprise Space Management (ESM)
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded border border-indigo-500/20 font-bold tracking-widest">
                MOCK PRO ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Planification des capacités, répartition financière et simulation de présence hybride de l'infrastructure.
            </p>
          </div>
        </div>

        {/* View Mode Selectors */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 self-start md:self-auto">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'visual' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Plan Interactif</span>
          </button>
          <button
            onClick={() => setViewMode('enterprise')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'enterprise' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Tableau Analytique</span>
          </button>
        </div>
      </div>

      {/* Global Control Center & Preset Simulator Scenarios */}
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850/80 space-y-3">
        <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase block">
          SCÉNARIOS DE SIMULATION DU PORTFOLIO (PILOTE TRIRIGA MOCK ENGINE)
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleTriggerScenario('peak')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-indigo-500/5 border border-slate-150 dark:border-slate-850 text-left transition-all text-xs font-mono flex items-center space-x-2 group"
          >
            <Users className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-slate-800 dark:text-white block">Heure de Pointe</span>
              <span className="text-[10px] text-slate-400 block">Occupation 90%+</span>
            </div>
          </button>

          <button
            onClick={() => handleTriggerScenario('weekend')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-amber-500/5 border border-slate-150 dark:border-slate-850 text-left transition-all text-xs font-mono flex items-center space-x-2 group"
          >
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-slate-800 dark:text-white block">Week-end / Off</span>
              <span className="text-[10px] text-slate-400 block">Occupation minimale</span>
            </div>
          </button>

          <button
            onClick={() => handleTriggerScenario('eco')}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-emerald-500/5 border border-slate-150 dark:border-slate-850 text-left transition-all text-xs font-mono flex items-center space-x-2 group"
          >
            <Snowflake className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            <div>
              <span className="font-bold text-slate-800 dark:text-white block">Régulation RSE</span>
              <span className="text-[10px] text-slate-400 block">HVAC Zone Temp 21°C</span>
            </div>
          </button>

          <button
            onClick={() => handleTriggerScenario('reset')}
            className="p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-left transition-all text-xs font-mono flex items-center space-x-2 group"
          >
            <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
            <div>
              <span className="font-bold text-slate-800 dark:text-white block">Reset</span>
              <span className="text-[10px] text-slate-400 block">Rétablir le plan</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Renderers */}
      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          
          {/* Left Panel: Floor List Selector & Live Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                  Niveaux du Site
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {floorOccupancy.length} Zones
                </span>
              </div>
              <div className="p-2 space-y-1">
                {floorOccupancy.map((floor, i) => {
                  const isSelected = floor.floor === selectedFloorName;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedFloorName(floor.floor)}
                      className={`w-full p-2.5 rounded-2xl text-left font-mono transition-all duration-200 flex items-center justify-between border ${
                        isSelected 
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                          : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{floor.floor}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{floor.department}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold block">{floor.occupancyRate}%</span>
                        <span className="text-[9px] text-slate-400 block">{floor.tempC}°C</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Floor Live Thermostat & Capacity Control Panel */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-3xl space-y-4">
              <div className="flex items-center space-x-2">
                <SlidersIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                  Pilotage en Direct
                </span>
              </div>

              {/* HVAC Thermostat controls */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Thermostat HVAC Zone</span>
                  <span className={`font-bold ${selectedFloor.tempC > 22.5 ? 'text-amber-500' : selectedFloor.tempC < 19.5 ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {selectedFloor.tempC}°C
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTempChange(selectedFloor.floor, -0.5)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300"
                    title="Diminuer la consigne"
                  >
                    <Snowflake className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        selectedFloor.tempC > 22.5 ? 'bg-amber-500' : selectedFloor.tempC < 19.5 ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${((selectedFloor.tempC - 16) / 12) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => handleTempChange(selectedFloor.floor, 0.5)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300"
                    title="Augmenter la consigne"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                </div>
              </div>

              {/* Occupancy dynamic controls */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Capacité Occupée</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedFloor.occupied} / {selectedFloor.desksTotal} Postes
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleWorkerToggle(selectedFloor.floor, false)}
                    disabled={selectedFloor.occupied <= 0}
                    className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-red-500/5 hover:border-red-500/20 text-red-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-transparent text-xs font-mono font-bold flex items-center justify-center space-x-1 transition-all"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Départ (-1)</span>
                  </button>
                  <button
                    onClick={() => handleWorkerToggle(selectedFloor.floor, true)}
                    disabled={selectedFloor.occupied >= selectedFloor.desksTotal}
                    className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-emerald-500/5 hover:border-emerald-500/20 text-emerald-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-transparent text-xs font-mono font-bold flex items-center justify-center space-x-1 transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Arrivée (+1)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Layout & Hotdesk Grid */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    CARTOGRAPHIE INTERACTIVE DES WORKSPACES
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    Modèle d'Affectation Dynamique : {selectedFloor.floor}
                  </h3>
                </div>
                
                {/* Heat Legend */}
                <div className="flex flex-wrap gap-3 font-mono text-[10px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span className="text-slate-500">Disponible</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                    <span className="text-slate-500">Occupé (Simulé)</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <p className="text-[11px] text-slate-500 font-sans italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                💡 <strong>Mode Tactile Actif</strong>: Cliquez sur n'importe quel bureau ci-dessous pour libérer ou allouer le poste instantanément à un collaborateur. Les statistiques d'occupation se recalculeront en temps réel.
              </p>

              {/* Desks container */}
              {renderInteractiveDesks()}

              {/* Footer sensors metadata */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-mono text-slate-400">
                <div>
                  <span className="block text-[8px] uppercase">Réseau Capteurs IoT</span>
                  <span className="font-bold text-emerald-500 uppercase">Connecté & Actif</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase">Fréquence de sync</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">Temps Réel (~1.5s)</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase">Zone Thermique</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">Chauffage CVC {selectedFloor.tempC > 22.5 ? 'Intense' : 'Standard'}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* View Mode 2: Enterprise Analytical Dashboard Registry */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          
          {/* Financial chargebacks block */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Allocations Financières
              </span>
              <Calculator className="w-4 h-4 text-slate-400" />
            </div>
            <div className="p-4 space-y-4 font-mono text-xs">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Superficie Louable Totale</span>
                <span className="text-base font-black text-slate-900 dark:text-white block">24 500 m²</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Coût estimé du m² (Mensuel)</span>
                <span className="text-base font-black text-indigo-500 block">€45,50</span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Allocations Centres de Coût</span>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">Engineering</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">€132K/mo</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">Sales & Mktg</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">€85K/mo</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '64%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-600 dark:text-slate-300 font-bold">R&D Labs</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">€64K/mo</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '48%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Large registry table & Recharts comparative view */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                  Registre d'Inventaire de l'Espace (Chargeback)
                </span>
                <span className="text-[10px] text-indigo-500 font-mono">
                  TRIRIGA Portfolio Compatible
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-mono whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-wider">Niveau / Espace</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-wider">Département</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-center">Bureaux</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-center">Occupés</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-center">Vacance</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-wider">Zone Temp</th>
                      <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-right">Facture/Mois</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-300">
                    {floorOccupancy.map((floor, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-4 py-3 text-indigo-500 font-bold">{floor.floor}</td>
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-sans font-semibold">{floor.department}</td>
                        <td className="px-4 py-3 text-center">{floor.desksTotal}</td>
                        <td className="px-4 py-3 text-center">{floor.occupied}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                            floor.occupancyRate > 90 ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                            floor.occupancyRate < 65 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          }`}>
                            {100 - floor.occupancyRate}% VACANT
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{floor.tempC}°C</td>
                        <td className="px-4 py-3 text-right text-slate-900 dark:text-white font-bold">€{(floor.desksTotal * 45.5).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Area Charts of Occupancy Chargeback */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-4 shadow-sm">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-4">
                CHARGES DE LOYER THÉORIQUES VS EXPLOITATION DES POSTES DE TRAVAIL
              </span>
              <div className="h-60 w-full font-mono text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLoyer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4338ca" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReelle" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="Loyer Mensuel (€k)" stroke="#4338ca" strokeWidth={2} fillOpacity={1} fill="url(#colorLoyer)" />
                    <Area type="monotone" dataKey="Allocation Réelle (€k)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReelle)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// Simple inline slider icon
const SlidersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </svg>
);
