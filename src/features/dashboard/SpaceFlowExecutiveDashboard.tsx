import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { initAuth, googleSignIn, googleLogout, sendGmailBackup } from '../../services/googleAuth';
import confetti from 'canvas-confetti';
import {
  RefreshCw,
  Bell,
  Activity,
  Box,
  Wrench,
  MapPin,
  Leaf,
  Building,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Mail,
  CloudLightning,
  LogOut,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface SpaceFlowExecutiveDashboardProps {
  isLightMode: boolean;
  lang: 'fr' | 'en';
  dashboardMode: 'cafm' | 'web3';
  onNavigate?: (id: string) => void;
}

export const SpaceFlowExecutiveDashboard: React.FC<SpaceFlowExecutiveDashboardProps> = ({
  isLightMode,
  lang,
  dashboardMode,
  onNavigate
}) => {
  const [lastSync, setLastSync] = useState<string>('09:12:00');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Google OAuth & Backup States
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string>(() => {
    return localStorage.getItem('spaceflow_last_backup') || (lang === 'fr' ? 'Jamais sauvegardé' : 'Never backed up');
  });
  const [backupProgress, setBackupProgress] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [backupStatusMessage, setBackupStatusMessage] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');

  // Handle auto-recovery of login state via initAuth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setRecipientEmail(user.email || '');
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setBackupProgress('idle');
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        setRecipientEmail(result.user.email || '');
      }
    } catch (err) {
      console.error('Google Sign-In Failed:', err);
    }
  };

  const handleGoogleLogout = async () => {
    await googleLogout();
    setGoogleUser(null);
    setAccessToken(null);
    setBackupProgress('idle');
  };

  const handleTriggerBackup = async () => {
    if (!accessToken || !recipientEmail) return;
    
    const confirmed = window.confirm(
      lang === 'fr' 
        ? `Sauvegarder la base de données CAFM vers : ${recipientEmail} ?`
        : `Backup CAFM database to : ${recipientEmail}?`
    );
    if (!confirmed) return;

    setBackupProgress('loading');
    setBackupStatusMessage(lang === 'fr' ? 'Compilation des données...' : 'Compiling active logs...');

    try {
      const liveAssets = await api.getAssets();
      const liveWorkOrders = await api.getWorkOrders();

      setBackupStatusMessage(lang === 'fr' ? 'Transmission sécurisée vers Gmail...' : 'Delivering operational backup...');

      const success = await sendGmailBackup(accessToken, recipientEmail, {
        assets: liveAssets && liveAssets.length > 0 ? liveAssets : [],
        workOrders: liveWorkOrders && liveWorkOrders.length > 0 ? liveWorkOrders : []
      });

      if (success) {
        const nowStr = new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
          dateStyle: 'short',
          timeStyle: 'short'
        });
        localStorage.setItem('spaceflow_last_backup', nowStr);
        setLastBackupTime(nowStr);
        setBackupProgress('success');
        setBackupStatusMessage(
          lang === 'fr' 
            ? 'Sauvegarde réussie ! Retrouvez l\'archive dans votre boîte Gmail.' 
            : 'Backup successful! Operational archive sent to Gmail.'
        );

        confetti({
          particleCount: 120,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#ff9d2b', '#10b981', '#3b82f6']
        });
      } else {
        setBackupProgress('error');
        setBackupStatusMessage(
          lang === 'fr'
            ? 'Échec de la sauvegarde. Vérifiez les permissions Google.'
            : 'Backup failed. Please check your Google permissions.'
        );
      }
    } catch (e) {
      console.error('Backup Error:', e);
      setBackupProgress('error');
      setBackupStatusMessage(lang === 'fr' ? 'Erreur de connexion API Gmail.' : 'Gmail API connection error.');
    }
  };

  // Telemetry tick simulator
  const [telemetry, setTelemetry] = useState({
    v1: 5.2,
    v2: 2.3,
    v3: 7.3,
    v4: 1.8,
    v5: 7.1
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        v1: +(prev.v1 + (Math.random() * 0.4 - 0.2)).toFixed(1),
        v2: +(prev.v2 + (Math.random() * 0.2 - 0.1)).toFixed(1),
        v3: +(prev.v3 + (Math.random() * 0.6 - 0.3)).toFixed(1),
        v4: +(prev.v4 + (Math.random() * 0.2 - 0.1)).toFixed(1),
        v5: +(prev.v5 + (Math.random() * 0.4 - 0.2)).toFixed(1)
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setLastSync(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
      setIsRefreshing(false);
    }, 500);
  };

  const orderActivityData = [
    { name: 'mar.', crees: 2, completes: 1 },
    { name: 'mer.', crees: 4, completes: 3 },
    { name: 'jeu.', crees: 1, completes: 2 },
    { name: 'ven.', crees: 5, completes: 4 },
    { name: 'sam.', crees: 0, completes: 1 },
    { name: 'dim.', crees: 1, completes: 0 },
    { name: 'lun.', crees: 11, completes: 10 }
  ];

  const assetStatusData = [
    { name: lang === 'fr' ? 'OPÉRATIONNEL' : 'OPERATIONAL', value: 75, color: '#10b981' },
    { name: lang === 'fr' ? 'EN MAINTENANCE' : 'MAINTENANCE', value: 15, color: '#f59e0b' },
    { name: lang === 'fr' ? 'EN PANNE' : 'FAULTY', value: 5, color: '#ef4444' }
  ];

  const technicalOrdersList = [
    {
      title: lang === 'fr' ? 'Pompe hydraulique principale' : 'Primary hydraulic lift pump',
      node: 'NODE #10',
      tech: 'TECH #10',
      time: lang === 'fr' ? '17 MIN AGO' : '17 MIN AGO',
      priority: 'HIGH'
    },
    {
      title: lang === 'fr' ? 'Sondes CO2 de traitement d\'air' : 'Air Unit CO2 Sensors',
      node: 'NODE #09',
      tech: 'TECH #09',
      time: lang === 'fr' ? '45 MIN AGO' : '45 MIN AGO',
      priority: 'HIGH'
    },
    {
      title: lang === 'fr' ? 'Filtre de compresseur clim' : 'Chiller compressor filter',
      node: 'NODE #08',
      tech: 'TECH #08',
      time: lang === 'fr' ? '2 H AGO' : '2 H AGO',
      priority: 'HIGH'
    }
  ];

  const cockpitModules = [
    { id: 'team-ops', title: lang === 'fr' ? 'Équipe' : 'Team Ops', icon: 'group', metric: '5 Techs', color: 'bg-emerald-500/10 text-emerald-500' },
    { id: 'env-impact', title: lang === 'fr' ? 'Impact RSE' : 'ESG Impact', icon: 'nature_people', metric: 'Grade A-', color: 'bg-emerald-500/10 text-emerald-500' },
    { id: 'esg-copilot', title: lang === 'fr' ? 'Copilote' : 'Copilot', icon: 'eco', metric: '-23% CO2', color: 'bg-amber-500/10 text-amber-500' },
    { id: 'bim-3d', title: lang === 'fr' ? 'Plan 3D' : '3D Viewer', icon: 'architecture', metric: 'Active', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'predictive-ai', title: lang === 'fr' ? 'Prédictif' : 'Predictive', icon: 'psychology', metric: '98% RUL', color: 'bg-purple-500/10 text-purple-500' },
    { id: 'occupants-care', title: lang === 'fr' ? 'Confort' : 'Comfort', icon: 'person_pin', metric: '96/100', color: 'bg-emerald-500/10 text-emerald-500' }
  ];

  return (
    <div className="space-y-6 pt-2 w-full text-slate-800 dark:text-slate-100">
      {/* VIEW: GMAO CAFM Classique */}
      {dashboardMode === 'cafm' && (
        <div className="space-y-6">
          
          {/* CYBER FLAGSHIPS LAUNCH BANNER */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-md relative overflow-hidden transition-all ${
            isLightMode 
              ? 'bg-gradient-to-r from-amber-50 via-slate-50 to-white border-amber-200 text-slate-900' 
              : 'border-[#ff9d2b]/30 bg-gradient-to-r from-[#130b24] via-[#1a0f30] to-[#0f091c] text-white shadow-xl'
          }`}>
            <div className="absolute top-0 right-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-amber-600/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${
                    isLightMode ? 'text-amber-700' : 'text-[#ffb04f]'
                  }`}>
                    {lang === 'fr' ? 'NOUVEAU COCKPIT 3D' : 'NEW 3D COCKPITS'}
                  </span>
                </div>
                <h2 className={`text-base sm:text-lg font-mono font-black tracking-tight ${
                  isLightMode ? 'text-slate-950' : 'text-white'
                }`}>
                  {lang === 'fr' 
                    ? 'Mission Control & Jumeau Numérique God-Mode' 
                    : 'Mission Control & Digital Twin God-Mode'}
                </h2>
                <p className={`text-xs max-w-xl ${isLightMode ? 'text-slate-600' : 'text-gray-300'}`}>
                  {lang === 'fr'
                    ? 'Explorez la modélisation 3D interactive du réacteur, les graphiques télémétriques de charge IA et le terminal de commandes en temps réel.'
                    : 'Experience real-time interactive 3D terrain wireframes, AI compute loads, isometric blueprints, and live execution terminals.'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  id="btn-launch-mission-control"
                  onClick={() => onNavigate?.('mission-control')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-1.5 ${
                    isLightMode 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm' 
                      : 'bg-[#ff9d2b] hover:bg-[#ffaa47] text-black shadow-[0_0_15px_rgba(255,157,43,0.4)]'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>{lang === 'fr' ? 'Web Dashboard' : 'Web Dashboard'}</span>
                </button>
                <button
                  id="btn-launch-god-mode"
                  onClick={() => onNavigate?.('god-mode')}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isLightMode 
                      ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm' 
                      : 'border-[#a78bfa]/50 bg-[#23153d] hover:bg-[#311e54] text-[#d8b4fe] shadow-[0_0_15px_rgba(167,139,250,0.25)]'
                  }`}
                >
                  <Building className={`w-4 h-4 ${isLightMode ? 'text-slate-700' : 'text-[#a78bfa]'}`} />
                  <span>{lang === 'fr' ? 'God-Mode 3D' : 'God-Mode 3D'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* STREAMLINED 4 METRICS ROW (Clears clutter and focuses info) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Actifs */}
            <div className={`p-4.5 rounded-xl border transition-all ${
              isLightMode ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 mb-1">
                <span>{lang === 'fr' ? 'TOTAL ACTIFS' : 'TOTAL ASSETS'}</span>
                <Box className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">20</div>
              <p className="text-[9px] font-mono font-bold text-emerald-500 mt-1">100% OPÉRATIONNEL</p>
            </div>

            {/* Tickets */}
            <div className={`p-4.5 rounded-xl border transition-all ${
              isLightMode ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 mb-1">
                <span>{lang === 'fr' ? 'TICKETS EN ATTENTE' : 'PENDING ORDERS'}</span>
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">10</div>
              <p className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 mt-1">0 CRITIQUE • 10 STANDARD</p>
            </div>

            {/* Disponibilité */}
            <div className={`p-4.5 rounded-xl border transition-all ${
              isLightMode ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 mb-1">
                <span>{lang === 'fr' ? 'DISPONIBILITÉ' : 'AVAILABILITY'}</span>
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">100%</div>
              <p className="text-[9px] font-mono font-bold text-emerald-500 mt-1">0 PANNE IDENTIFIÉE</p>
            </div>

            {/* Occupation */}
            <div className={`p-4.5 rounded-xl border transition-all ${
              isLightMode ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 mb-1">
                <span>{lang === 'fr' ? 'OCCUPATION' : 'SPACE OCCUPANCY'}</span>
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">50%</div>
              <p className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 mt-1">10/20 LOCATIONS ACTIVES</p>
            </div>

          </div>

          {/* TWO COLUMN BENTO LAYOUT (Brings relationships between elements) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Area: Main Operations & Tracking */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* WhatsApp-Style Cloud Backup */}
              <div className={`p-5 rounded-xl border transition-all ${
                isLightMode 
                  ? 'bg-slate-50/50 border-slate-100' 
                  : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CloudLightning className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h3 className="text-xs font-black font-mono tracking-tight uppercase text-slate-900 dark:text-slate-100">
                        {lang === 'fr' ? 'SAUVEGARDE GMAIL' : 'GMAIL BACKUP'}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-sans bg-emerald-500/10 text-emerald-500">
                        CLOUD SECURE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                      {lang === 'fr'
                        ? 'Archivez vos registres d\'actifs et de maintenance directement sur Gmail d\'un simple clic.'
                        : 'Securely transfer your machinery logs & maintenance history directly to your Gmail inbox.'}
                    </p>
                  </div>

                  {/* Actions wrapper */}
                  <div className="flex items-center gap-3 shrink-0">
                    {!googleUser ? (
                      <button
                        onClick={handleGoogleLogin}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-[10px] border border-slate-200 transition-all shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        <span>{lang === 'fr' ? 'CONNEXION' : 'LINK GOOGLE'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="px-2.5 py-1.5 text-[10px] font-mono rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
                          placeholder="recipient@gmail.com"
                        />
                        <button
                          onClick={handleTriggerBackup}
                          disabled={backupProgress === 'loading'}
                          className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-black dark:text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
                        >
                          {lang === 'fr' ? 'SAUVER' : 'SAVE'}
                        </button>
                        <button
                          onClick={handleGoogleLogout}
                          className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status indicator logs */}
                {backupStatusMessage && (
                  <div className={`mt-3 p-2.5 rounded border flex items-center gap-2 text-[10px] font-mono ${
                    backupProgress === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : backupProgress === 'error'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    {backupProgress === 'success' ? (
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : backupProgress === 'error' ? (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                    )}
                    <span>{backupStatusMessage}</span>
                  </div>
                )}
              </div>

              {/* Chart 1: SUIVI D'ACTIVITÉ */}
              <div className={`p-5 rounded-xl border shadow-sm ${
                isLightMode ? 'bg-white border-slate-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
                  <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400">
                    {lang === 'fr' ? "SUIVI D'ACTIVITÉ (7J)" : 'ACTIVITY LOGS (7D)'}
                  </h3>
                  <div className="flex items-center gap-2.5 text-[9px] font-mono">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold">
                      <span className="w-2 h-2 rounded bg-slate-300"></span>
                      <span>CRÉÉS</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 font-bold">
                      <span className="w-2 h-2 rounded bg-emerald-500"></span>
                      <span>RÉSOLUS</span>
                    </div>
                  </div>
                </div>

                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderActivityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="completesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#f1f5f9' : '#1e1b2e'} vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: isLightMode ? '#fff' : '#0f172a', 
                          borderColor: '#ff9d2b', 
                          borderRadius: '8px', 
                          fontSize: '10px',
                          color: isLightMode ? '#000' : '#fff'
                        }}
                      />
                      <Area type="monotone" dataKey="crees" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={0} />
                      <Area type="monotone" dataKey="completes" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#completesGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right Area: Asset Distribution, Live Signals & Advanced Launchers */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Asset Health Distribution Donut */}
              <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
                isLightMode ? 'bg-white border-slate-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="pb-3 border-b border-slate-150 dark:border-slate-800/60">
                  <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400">
                    {lang === 'fr' ? 'SANTÉ DES ACTIFS' : 'MACHINERY HEALTH'}
                  </h3>
                </div>

                <div className="h-[140px] w-full flex items-center justify-center relative mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={58}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {assetStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Centered Total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                    <span className="text-xl font-black font-mono leading-none text-slate-900 dark:text-white">20</span>
                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 font-mono mt-0.5 uppercase">ACTIFS</span>
                  </div>
                </div>

                {/* Mini Legends with coordinated colors */}
                <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono pt-3 border-t border-slate-150 dark:border-slate-800/60 mt-3">
                  {assetStatusData.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <span className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: item.color }} />
                      <span className="text-[9px] font-black text-slate-800 dark:text-slate-100">{item.value}%</span>
                      <span className="text-[7px] text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 truncate uppercase max-w-full">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Vibration Telemetry */}
              <div className={`p-4 rounded-xl border ${
                isLightMode ? 'bg-white border-slate-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-2">
                  <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest">{lang === 'fr' ? 'TÉLÉMÉTRIE LIVE' : 'LIVE TELEMETRY'}</span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-bold">
                  <div className="bg-slate-100/50 dark:bg-slate-950/40 p-1.5 rounded border border-slate-150 dark:border-slate-800/50">
                    <div className="text-slate-500 dark:text-slate-400 text-[8px]">VIB.A</div>
                    <div className="text-emerald-500 mt-0.5">{telemetry.v1} Hz</div>
                  </div>
                  <div className="bg-slate-100/50 dark:bg-slate-950/40 p-1.5 rounded border border-slate-150 dark:border-slate-800/50">
                    <div className="text-slate-500 dark:text-slate-400 text-[8px]">VIB.B</div>
                    <div className="text-emerald-500 mt-0.5">{telemetry.v2} Hz</div>
                  </div>
                  <div className="bg-slate-100/50 dark:bg-slate-950/40 p-1.5 rounded border border-slate-150 dark:border-slate-800/50">
                    <div className="text-slate-500 dark:text-slate-400 text-[8px]">TEMP</div>
                    <div className="text-emerald-500 mt-0.5">24.2 °C</div>
                  </div>
                </div>
              </div>

              {/* Bento Cockpit (Clean relationships, no clutter, beautiful icons) */}
              <div className={`p-5 rounded-xl border shadow-sm ${
                isLightMode ? 'bg-white border-slate-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="pb-3 border-b border-slate-150 dark:border-slate-800/60 mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400">
                    {lang === 'fr' ? 'COCKPIT OUTILS' : 'COCKPIT LAUNCHERS'}
                  </h3>
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                    BENTO 2.5D
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {cockpitModules.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => onNavigate && onNavigate(mod.id)}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all hover:scale-[1.01] hover:border-amber-500/40 ${
                        isLightMode 
                          ? 'bg-slate-50/50 border-slate-100 hover:bg-white' 
                          : 'bg-white dark:bg-slate-950/30 border-slate-100 dark:border-slate-900 hover:bg-white dark:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-200">
                        <span className="material-symbols-outlined text-sm leading-none text-amber-500">{mod.icon}</span>
                        <span className="text-[10px] font-black font-mono uppercase tracking-tight truncate max-w-[80px]">{mod.title}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 leading-none">
                        {mod.metric}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW: Web3 & DeFi Activity Layout */}
      {dashboardMode === 'web3' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Recent Orders */}
          <div className={`lg:col-span-6 p-5 rounded-xl border shadow-sm ${
            isLightMode ? 'bg-white border-slate-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'DERNIERS ORDRES' : 'RECENT ORDERS'}
              </h3>
              <button className="text-[9px] font-mono font-bold uppercase text-amber-500 flex items-center gap-1 hover:underline">
                <span>{lang === 'fr' ? 'TOUS' : 'ALL'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {technicalOrdersList.map((order, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-lg border flex items-start justify-between gap-4 transition-all ${
                    isLightMode 
                      ? 'bg-slate-50/60 border-slate-100 hover:bg-slate-50' 
                      : 'bg-white dark:bg-slate-950/40 border-slate-100 dark:border-slate-900 hover:bg-white dark:bg-slate-950/80'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                      {order.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 font-bold">
                      <span>{order.node}</span>
                      <span>•</span>
                      <span className="text-amber-500">{order.tech}</span>
                    </div>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded text-[8px] font-mono font-black tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {order.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Forecast (Empty State) */}
          <div className={`lg:col-span-3 p-5 rounded-xl border shadow-sm flex flex-col justify-between min-h-[220px] ${
            isLightMode ? 'bg-white border-slate-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="pb-3 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'PLANIFICATION' : 'FORECAST'}
              </h3>
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 tracking-wider uppercase">
                {lang === 'fr' ? 'RIEN DE PRÉVU' : 'NOTHING PLANNED'}
              </span>
            </div>
          </div>

          {/* Column 3: Alerts (Empty State) */}
          <div className={`lg:col-span-3 p-5 rounded-xl border shadow-sm flex flex-col justify-between min-h-[220px] ${
            isLightMode ? 'bg-white border-slate-100' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="pb-3 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'ALERTES' : 'ALERTS'}
              </h3>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 tracking-wider uppercase">
                {lang === 'fr' ? '0 ALERTE ACTIVE' : '0 ACTIVE ALERTS'}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
