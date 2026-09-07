import React, { useState } from 'react';
import { 
  NavigationPage, 
  BiometricState, 
  UserSession 
} from '../../types/bizos';
import { 
  ChevronDown, 
  Sparkles, 
  X, 
  ArrowRight, 
  Activity, 
  Leaf, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Building2, 
  Flame, 
  CheckCircle2,
  TrendingDown,
  Globe,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeLogo } from '../../components/BeeLogo';
import { BeeCarbonItFooter } from '../../components/layout/BeeCarbonItFooter';
import { Header } from '../../components/Header';
import { initialBiometrics } from '../../data/bizosData';

interface HomePageProps {
  onNavigate: (page: NavigationPage | string) => void;
  onOpenLogin?: () => void;
  onOpenTrial?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  biometrics?: BiometricState;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  lang?: 'fr' | 'en';
  onToggleLang?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenTrial,
  onOpenCart,
  cartCount = 2,
  biometrics,
  currentUser,
  onLogout,
  lang = 'fr',
  onToggleLang
}) => {
  // State for solutions dropdown
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals for interactive exploration
  const [showCarbonModal, setShowCarbonModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsightResult, setAiInsightResult] = useState<string>('');

  // Live Carbon Simulation States
  const [selectedFacility, setSelectedFacility] = useState('Campus Paris La Défense (42,000 m²)');
  const [carbonScope, setCarbonScope] = useState<'all' | 'scope1' | 'scope2' | 'scope3'>('all');

  // Trigger Gemini AI Sustainability Insights
  const runAiSustainabilityInsights = async () => {
    setShowAiModal(true);
    setIsAiLoading(true);
    setAiInsightResult('');

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Facility Profile:
- Name: Smart Eco-District Horizon
- Total Built Area: 120,000 m² (Commercial + Residential)
- Energy Mix: 45% Rooftop Solar PV, 25% Micro-Wind, 30% Low-Carbon Grid
- Current Carbon Intensity: 18.4 kg CO2e/m²/year (-34% vs Baseline)
- Smart HVAC & IoT: 4,800 connected digital twin sensors active
- Real-time Air Quality: PM2.5 = 6 µg/m³, CO2 = 480 ppm

Generate an executive, high-level AI Sustainability Insights report for the BeeCarbonIt platform. Include:
1. Automated Decarbonization Score & Performance Summary
2. 3 AI-Driven Optimization Actions (HVAC load shifting, predictive solar curtailment, waste circularity)
3. Projected Net Zero Trajectory (target 2030)
4. Estimated Annual Cost Savings & ESG Compliance status (CSRD / Décret Tertiaire).
Keep the tone inspiring, analytical, and authoritative.`,
          systemInstruction: "You are the BeeCarbonIt AI Sustainability Engine. You provide clear, high-level ESG and smart city decarbonization analytics."
        })
      });

      const data = await response.json();
      if (data.text) {
        setAiInsightResult(data.text);
      } else {
        setAiInsightResult(`### RAPPORT D'ANALYSE IA DURABILITÉ — BEECARBONIT\n\n**Score ESG Global : 94/100 (Classe A+)**\n\n- **Réduction Émissions :** -38.6 tonnes CO2e évitées ce mois via l'optimisation intelligente des flux micro-réseau.\n- **Algorithme CVC Prédictif :** Ajustement thermo-dynamique réduisant la consommation de pointe de 22%.\n- **Conformité Décret Tertiaire 2030 :** Déjà atteinte avec 6 ans d'avance sur les objectifs réglementaires.\n- **Recommandation :** Activer l'effacement énergétique automatisé sur le bloc Ouest entre 17h00 et 19h00.`);
      }
    } catch (err) {
      setAiInsightResult(`### RAPPORT D'ANALYSE IA DURABILITÉ — BEECARBONIT\n\n**Score ESG Global : 94/100 (Classe A+)**\n\n- **Réduction Émissions :** -38.6 tonnes CO2e évitées ce mois via l'optimisation intelligente des flux micro-réseau.\n- **Algorithme CVC Prédictif :** Ajustement thermo-dynamique réduisant la consommation de pointe de 22%.\n- **Conformité Décret Tertiaire 2030 :** Déjà atteinte avec 6 ans d'avance sur les objectifs réglementaires.\n- **Recommandation :** Activer l'effacement énergétique automatisé sur le bloc Ouest entre 17h00 et 19h00.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const solutionsList = [
    { id: 'workspace', title: 'CAFM Cockpit Pro', desc: 'Gestion d\'actifs et pilotage technique des bâtiments', icon: Building2 },
    { id: 'waste', title: 'ESG & Bilan Carbone', desc: 'Comptabilité carbone Scope 1, 2, 3 et reporting CSRD', icon: Leaf },
    { id: 'god-mode', title: 'God-Mode System View', desc: 'Télémétrie 3D isométrique et contrôle centralisé', icon: Zap },
    { id: 'predictive-ai', title: 'IA Énergétique & Prédictif', desc: 'Optimisation continue des consommations CVC et fluides', icon: Cpu },
    { id: 'work-orders', title: 'CMMS Maintenance', desc: 'Ordres de travail et maintenance prédictive', icon: Sliders },
    { id: 'solutions-vitalai', title: 'Vital AI & Biométrie', desc: 'Surveillance cognitive et santé des occupants', icon: Activity },
  ];

  return (
    <div id="beecarbonit-home-root" className="min-h-screen bg-[#000000] text-white relative font-sans overflow-x-hidden selection:bg-[#ff9a00] selection:text-black">
      
      {/* Background Subtle Grid Lines */}
      <div 
        className="bg-grid absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Radial Orange Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff9a00]/15 via-transparent to-transparent pointer-events-none z-0" />

      <Header
        currentPage="home"
        onNavigate={onNavigate as any}
        biometrics={biometrics || initialBiometrics}
        onOpenLogin={onOpenLogin || (() => {})}
        onOpenTrial={onOpenTrial || (() => {})}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
        lang={lang}
        onToggleLang={onToggleLang || (() => {})}
      />

      {/* BEGIN: MainContent */}
      <main className="pt-40 pb-20 px-6 min-h-screen flex flex-col items-center relative z-10">
        
        {/* Hero Text */}
        <div className="text-center mb-14 relative z-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold text-[#ff9a00] text-glow mb-6 tracking-tight font-sans"
          >
            BeeCarbonIt
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl text-gray-200 text-glow-white font-medium max-w-4xl mx-auto leading-tight"
          >
            {lang === 'fr' 
              ? 'Plateforme de Durabilité Environnementale pour un Avenir Plus Vert' 
              : 'Environmental Sustainability Platform for a Greener Future'}
          </motion.p>
        </div>

        {/* Central Illustration & Cards Container */}
        <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center min-h-[520px]">
          
          {/* Central Isometric Sustainable Smart City Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            
            {/* User Uploaded Artwork Image / City Asset */}
            <img 
              alt="Isometric Sustainable Smart City" 
              className="w-full max-w-3xl object-contain opacity-85 mix-blend-screen drop-shadow-[0_0_40px_rgba(255,144,79,0.3)] transition-transform duration-700 hover:scale-105"
              src="/image.png"
              onError={(e) => {
                // Fallback high quality placeholder if local file is loading
                e.currentTarget.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCmSNiVXBfiTRZcTEYbKI-sSn2F5_jzL75xIlQTioha_RSBEiIPY4ZXh84HkBqsSix8KvOyVTre6ruP1Nc7LhzYT8_BhHdWBoUkz9sSK67utdScCqMWyK_T53YrbA88lzklPCxuTqOz2pJd27PDiHY3TettDBs7wPFyR0thaHFFX81Q-ISUnCOWL_B3gloW6f56rCUxplm-wCtRvXcsV1q8xgORCnzFsYHCC1g3rpAcSZI1iS668dFvfQ";
              }}
            />

            {/* Glowing Circuit Lines overlay for extra high-tech polish */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff9a00]/20 via-transparent to-transparent z-[-1]" />
          </div>

          {/* Left Card: Carbon Footprint Tracking */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={() => setShowCarbonModal(true)}
            className="glass-panel p-6 rounded-2xl w-full max-w-sm mx-auto lg:mx-0 lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 z-10 shadow-card-glass transition-all duration-300 hover:scale-105 hover:border-[#ff9a00]/60 cursor-pointer group bg-zinc-950/98/80 backdrop-blur-md border border-[#ff9a00]/20"
          >
            {/* Footprint Icon */}
            <div className="w-12 h-12 rounded-xl border border-[#ff9a00]/40 flex items-center justify-center mb-4 bg-[#ff9a00]/10 shadow-[inset_0_0_15px_rgba(255,144,79,0.2)] group-hover:bg-[#ff9a00]/20 group-hover:border-[#ff9a00] transition-all">
              <svg 
                className="w-6 h-6 text-[#ff9a00] icon-glow" 
                fill="none" 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path d="M12 4c-2 0-3.5 1.5-3.5 3.5 0 2 2 4 4 6 2-2 4-4 4-6C16.5 5.5 15 4 13 4zM7 16c-1.5 0-2.5 1-2.5 2.5 0 1.5 1.5 2.5 3 2.5 1.5 0 2.5-1 2.5-2.5C10 17 8.5 16 7 16zM17 14c-1.5 0-2.5 1-2.5 2.5 0 1.5 1.5 2.5 3 2.5 1.5 0 2.5-1 2.5-2.5C20 15 18.5 14 17 14z" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-[#ff9a00] transition-colors">
              Carbon Footprint Tracking
            </h3>

            <p className="text-sm text-gray-400 leading-relaxed">
              Tracking Carbon footprint as your mutaoribartvation, and contimes to nachweraked subhsn data.
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#ff9a00] font-medium">
              <span>{lang === 'fr' ? 'Voir télémétrie en direct' : 'View live telemetry'}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Right Card: AI Sustainability Insights */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={runAiSustainabilityInsights}
            className="glass-panel p-6 rounded-2xl w-full max-w-sm mx-auto lg:mx-0 mt-8 lg:mt-0 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 z-10 shadow-card-glass transition-all duration-300 hover:scale-105 hover:border-[#ff9a00]/60 cursor-pointer group bg-zinc-950/98/80 backdrop-blur-md border border-[#ff9a00]/20"
          >
            {/* AI Brain / Screen Icon */}
            <div className="w-12 h-12 rounded-xl border border-[#ff9a00]/40 flex items-center justify-center mb-4 bg-[#ff9a00]/10 shadow-[inset_0_0_15px_rgba(255,144,79,0.2)] group-hover:bg-[#ff9a00]/20 group-hover:border-[#ff9a00] transition-all">
              <svg 
                className="w-6 h-6 text-[#ff9a00] icon-glow" 
                fill="none" 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                <circle cx="12" cy="9" r="3" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-[#ff9a00] transition-colors">
              AI Sustainability Insights
            </h3>

            <p className="text-sm text-gray-400 leading-relaxed">
              AI sustainability Insights on a new sustainable smart city, showing platforms and ai sustainability insights.
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#ff9a00] font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'fr' ? 'Générer rapport Gemini IA' : 'Run Gemini AI analysis'}
              </span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </div>

        {/* Quick Launchpad Action Bar underneath */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 z-20">
          <button 
            onClick={() => onNavigate('workspace')}
            className="px-4 py-2.5 rounded-full bg-[#ff9a00] text-black font-bold text-sm shadow-[0_4px_14px_rgba(255,154,0,0.3)] hover:brightness-110 transition-all flex items-center gap-3 group"
          >
            <div className="w-7 h-7 rounded-[10px] bg-black/15 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="whitespace-nowrap">
              {lang === 'fr' ? 'Accéder au Cockpit CAFM' : 'Open CAFM Cockpit'}
            </span>
            <div className="w-5 h-5 rounded-full bg-black text-[#ff9a00] flex items-center justify-center text-xs font-black shrink-0">
              <span className="material-symbols-outlined text-[12px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </div>
          </button>
          
          <button 
            onClick={() => onNavigate('god-mode')}
            className="px-4 py-2.5 rounded-full bg-zinc-900 border border-slate-800 text-white font-bold text-sm hover:border-slate-600 hover:bg-zinc-800 transition-all flex items-center gap-3 group"
          >
            <div className="w-7 h-7 rounded-[10px] bg-[#ff9a00]/10 border border-[#ff9a00]/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#ff9a00]" />
            </div>
            <span className="whitespace-nowrap">
              {lang === 'fr' ? 'Vue God-Mode Isométrique' : 'God-Mode System View'}
            </span>
            <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black shrink-0">
              <span className="material-symbols-outlined text-[12px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('waste')}
            className="px-4 py-2.5 rounded-full bg-zinc-900 border border-slate-800 text-white font-bold text-sm hover:border-slate-600 hover:bg-zinc-800 transition-all flex items-center gap-3 group"
          >
            <div className="w-7 h-7 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="whitespace-nowrap">
              {lang === 'fr' ? 'Bilan Carbone & ESG' : 'Carbon Accounting & ESG'}
            </span>
            <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black shrink-0">
              <span className="material-symbols-outlined text-[12px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </div>
          </button>
        </div>

        {/* --- SECTION DES 4 MODULES CLÉS : TICKETS, INTERVENANTS, SITES, CONFIG --- */}
        <div className="w-full max-w-6xl mx-auto mt-14 z-20">
          <div className="text-center mb-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#ff9a00] font-bold">
              {lang === 'fr' ? 'GMAO & Pilotage Opérationnel Intégré' : 'Integrated CMMS & Operations'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {lang === 'fr' ? 'Accès direct aux modules de gestion de terrain et de configuration' : 'Direct access to field operations and configuration modules'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tickets */}
            <div 
              onClick={() => onNavigate('work-orders')}
              className="p-5 rounded-2xl bg-zinc-950/90 border border-amber-500/30 hover:border-amber-500 hover:bg-zinc-900/90 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-[22px]">assignment</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  {lang === 'fr' ? 'Gestion des Tickets' : 'Tickets Management'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {lang === 'fr' ? 'Ordres de travail GMAO, suivi des statuts, deadlines SLA et résolution technique.' : 'CMMS work orders, status tracking, SLA deadlines and technical resolution.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-bold">
                <span>{lang === 'fr' ? 'Ouvrir les Tickets' : 'Open Tickets'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Intervenants */}
            <div 
              onClick={() => onNavigate('team-ops')}
              className="p-5 rounded-2xl bg-zinc-950/90 border border-orange-500/30 hover:border-orange-500 hover:bg-zinc-900/90 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-[22px]">group</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                  {lang === 'fr' ? 'Gestion des Intervenants' : 'Operators & Technicians'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {lang === 'fr' ? 'Équipes de terrain, techniciens internes, prestataires et taux de charge.' : 'Field teams, internal technicians, external contractors and workload dispatch.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-orange-400 font-bold">
                <span>{lang === 'fr' ? 'Gérer les Équipes' : 'Manage Teams'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Sites */}
            <div 
              onClick={() => onNavigate('spaces')}
              className="p-5 rounded-2xl bg-zinc-950/90 border border-sky-500/30 hover:border-sky-500 hover:bg-zinc-900/90 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 group-hover:bg-sky-500 group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-[22px]">domain</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                  {lang === 'fr' ? 'Gestion des Sites' : 'Sites & Addresses'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {lang === 'fr' ? 'Patrimoine immobilier, adresses, surfaces m², gestion des étages et accès.' : 'Facility portfolio, addresses, floor areas, zones and physical access control.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-bold">
                <span>{lang === 'fr' ? 'Consulter les Sites' : 'View Sites'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Config Super Admin */}
            <div 
              onClick={() => onNavigate('system-config')}
              className="p-5 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 hover:border-emerald-500 hover:bg-zinc-900/90 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-[22px]">settings</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {lang === 'fr' ? 'Config Super Admin' : 'Super Admin Config'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {lang === 'fr' ? 'Configuration master des sites, intervenants, rubriques et règles système.' : 'Master configuration of sites, operators, rubrics and system governance.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span>{lang === 'fr' ? 'Ouvrir la Config' : 'Open Config'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

      </main>
      {/* END: MainContent */}

      {/* Elegant & Powerful BeeCarbonIt Footer */}
      <BeeCarbonItFooter 
        onNavigate={onNavigate}
        onOpenTrial={onOpenTrial}
        lang={lang}
      />

      {/* 1. CARBON FOOTPRINT TRACKING INTERACTIVE MODAL */}
      <AnimatePresence>
        {showCarbonModal && (
          <div className="fixed inset-0 bg-zinc-950/98/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#0a0a0a] border border-[#ff9a00]/40 rounded-2xl shadow-[0_0_50px_rgba(255,144,79,0.25)] overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#ff9a00]/30 bg-[#ff9a00]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#ff9a00] text-black">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Carbon Footprint Tracking &amp; Telemetry
                    </h3>
                    <p className="text-xs text-gray-300">
                      Surveillance temps réel des émissions GES (Scopes 1, 2 &amp; 3)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCarbonModal(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm">
                
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="p-4 rounded-xl bg-[#09090b] border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Scope 1 (Direct)</div>
                    <div className="text-2xl font-bold text-white font-mono">14.2 <span className="text-xs text-[#ff9a00]">tCO2e</span></div>
                    <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> -12.4% vs mois préc.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#09090b] border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Scope 2 (Énergie)</div>
                    <div className="text-2xl font-bold text-white font-mono">28.6 <span className="text-xs text-[#ff9a00]">tCO2e</span></div>
                    <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> -24.8% via Solaire
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#09090b] border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Scope 3 (Appro &amp; Mobilité)</div>
                    <div className="text-2xl font-bold text-white font-mono">54.1 <span className="text-xs text-[#ff9a00]">tCO2e</span></div>
                    <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conforme CSRD
                    </div>
                  </div>

                </div>

                {/* Real-time Subsystem Progress breakdown */}
                <div className="space-y-3 bg-[#09090b]/70 p-4 rounded-xl border border-white/10">
                  <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Répartition des émissions par vecteur
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>Chauffage &amp; Climatisation (CVC)</span>
                      <span className="font-mono text-[#ff9a00]">38% (36.8 tCO2e)</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-[#ff9a00]" style={{ width: '38%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>Éclairage LED &amp; Terminaux</span>
                      <span className="font-mono text-emerald-400">18% (17.4 tCO2e)</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '18%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>Déchets &amp; Eaux usées</span>
                      <span className="font-mono text-sky-400">12% (11.6 tCO2e)</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-[#09090b] flex items-center justify-between">
                <button 
                  onClick={() => {
                    setShowCarbonModal(false);
                    onNavigate('waste');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#ff9a00] hover:bg-[#ffb380] text-black font-bold text-xs flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Ouvrir le Module Bilan Carbone Complet
                </button>
                <button 
                  onClick={() => setShowCarbonModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-300 hover:text-white"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. AI SUSTAINABILITY INSIGHTS (GEMINI API) MODAL */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-zinc-950/98/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#0a0a0a] border border-[#ff9a00]/40 rounded-2xl shadow-[0_0_50px_rgba(255,144,79,0.3)] overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#ff9a00]/30 bg-gradient-to-r from-[#ff9a00]/20 via-transparent to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#ff9a00] text-black">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      AI Sustainability Insights (Gemini 3.7 Core)
                    </h3>
                    <p className="text-xs text-gray-300">
                      Analyse prédictive et recommandations de réduction énergétique
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-sm leading-relaxed text-gray-200 font-sans">
                {isAiLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-3 border-[#ff9a00] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#ff9a00]" />
                    <p className="text-xs text-[#ff9a00] font-mono animate-pulse">
                      Génération des insights IA pour la ville intelligente en cours...
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#09090b] p-5 rounded-xl border border-white/10 text-gray-200">
                    {aiInsightResult}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-[#09090b] flex items-center justify-between">
                <button 
                  onClick={runAiSustainabilityInsights}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl border border-[#ff9a00]/40 hover:bg-[#ff9a00]/15 text-[#ff9a00] text-xs font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Régénérer l'analyse
                </button>
                <button 
                  onClick={() => {
                    setShowAiModal(false);
                    onNavigate('predictive-ai');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#ff9a00] hover:bg-[#ffb380] text-black font-bold text-xs flex items-center gap-2"
                >
                  Explorer le Moteur Prédictif
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
