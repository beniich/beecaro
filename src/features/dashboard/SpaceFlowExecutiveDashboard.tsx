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
  Info,
  Wallet,
  Coins,
  Lock,
  Cpu,
  Link,
  ExternalLink
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

  // Web3 & DeFi State Variables
  const [walletConnected, setWalletConnected] = useState<boolean>(() => {
    return localStorage.getItem('beecarbonat_wallet_connected') === 'true';
  });
  const [walletAddress, setWalletAddress] = useState<string>(() => {
    return localStorage.getItem('beecarbonat_wallet_address') || '0x71C4B...9A64';
  });
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('beecarbonat_wallet_balance');
    return saved ? parseFloat(saved) : 150.0;
  });
  const [stakedBalance, setStakedBalance] = useState<number>(() => {
    const saved = localStorage.getItem('beecarbonat_staked_balance');
    return saved ? parseFloat(saved) : 0.0;
  });
  const [ethBalance, setEthBalance] = useState<number>(0.045);
  const [mintAmount, setMintAmount] = useState<number>(10);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [burnAmount, setBurnAmount] = useState<number>(10);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isUnstaking, setIsUnstaking] = useState<boolean>(false);
  const [isBurning, setIsBurning] = useState<boolean>(false);
  
  // Web3 Interactive transaction logs
  const [txs, setTxs] = useState<any[]>(() => {
    const saved = localStorage.getItem('beecarbonat_txs');
    return saved ? JSON.parse(saved) : [
      { hash: '0x3bf92a08...4e8c', type: 'MINT (RWA Carbon Credit)', amount: 50, timestamp: '08/09/2026, 09:02', status: 'Success' },
      { hash: '0x81da12c0...ff92', type: 'STAKE', amount: 100, timestamp: '08/09/2026, 08:45', status: 'Success' },
    ];
  });

  // Proof verification checkpoints (On-Chain Proof)
  const [proofs, setProofs] = useState<any[]>([
    { id: 1, date: '2026-09-08', blockNumber: 18491024, rootHash: '0x3a82f6e9da96fb2...10b9', verified: true },
    { id: 2, date: '2026-09-07', blockNumber: 18485912, rootHash: '0x4f9d2ba9ef57b8a...f5c9', verified: true },
    { id: 3, date: '2026-09-06', blockNumber: 18481204, rootHash: '0x10b981d9f4e24da...2b9a', verified: false },
  ]);
  const [isVerifyingProof, setIsVerifyingProof] = useState<number | null>(null);

  // Sync state to localstorage when they change
  useEffect(() => {
    localStorage.setItem('beecarbonat_wallet_connected', String(walletConnected));
    localStorage.setItem('beecarbonat_wallet_address', walletAddress);
    localStorage.setItem('beecarbonat_wallet_balance', String(walletBalance));
    localStorage.setItem('beecarbonat_staked_balance', String(stakedBalance));
    localStorage.setItem('beecarbonat_txs', JSON.stringify(txs));
  }, [walletConnected, walletAddress, walletBalance, stakedBalance, txs]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4));
          setWalletConnected(true);
          setEthBalance(0.24);
          return;
        }
      } catch (err) {
        console.warn('Metamask request rejected, falling back to simulation:', err);
      }
    }
    const randomAddress = '0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    const shortened = randomAddress.slice(0, 6) + '...' + randomAddress.slice(-4);
    setWalletAddress(shortened);
    setWalletConnected(true);
    setEthBalance(0.082);
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
  };

  // Web3 functions
  const handleMint = () => {
    if (mintAmount <= 0) return;
    setIsMinting(true);
    setTimeout(() => {
      const txHash = '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      const shortHash = txHash.slice(0, 10) + '...' + txHash.slice(-4);
      
      setWalletBalance(prev => +(prev + mintAmount).toFixed(2));
      setEthBalance(prev => +(prev - 0.002).toFixed(4));
      setTxs(prev => [
        { hash: shortHash, type: 'MINT (RWA Carbon Credit)', amount: mintAmount, timestamp: new Date().toLocaleString(), status: 'Success' },
        ...prev
      ]);
      setIsMinting(false);
      
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });
    }, 1500);
  };

  const handleStake = () => {
    if (stakeAmount <= 0 || walletBalance < stakeAmount) return;
    setIsStaking(true);
    setTimeout(() => {
      const txHash = '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      const shortHash = txHash.slice(0, 10) + '...' + txHash.slice(-4);
      
      setWalletBalance(prev => +(prev - stakeAmount).toFixed(2));
      setStakedBalance(prev => +(prev + stakeAmount).toFixed(2));
      setEthBalance(prev => +(prev - 0.0015).toFixed(4));
      setTxs(prev => [
        { hash: shortHash, type: 'STAKE (DeFi Pool)', amount: stakeAmount, timestamp: new Date().toLocaleString(), status: 'Success' },
        ...prev
      ]);
      setIsStaking(false);
    }, 1200);
  };

  const handleUnstake = () => {
    if (stakedBalance <= 0) return;
    setIsUnstaking(true);
    setTimeout(() => {
      const txHash = '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      const shortHash = txHash.slice(0, 10) + '...' + txHash.slice(-4);
      
      setWalletBalance(prev => +(prev + stakedBalance).toFixed(2));
      setStakedBalance(0);
      setEthBalance(prev => +(prev - 0.0015).toFixed(4));
      setTxs(prev => [
        { hash: shortHash, type: 'UNSTAKE', amount: stakedBalance, timestamp: new Date().toLocaleString(), status: 'Success' },
        ...prev
      ]);
      setIsUnstaking(false);
    }, 1200);
  };

  const handleBurn = () => {
    if (burnAmount <= 0 || walletBalance < burnAmount) return;
    setIsBurning(true);
    setTimeout(() => {
      const txHash = '0x' + Array.from({length: 64}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      const shortHash = txHash.slice(0, 10) + '...' + txHash.slice(-4);
      
      setWalletBalance(prev => +(prev - burnAmount).toFixed(2));
      setEthBalance(prev => +(prev - 0.003).toFixed(4));
      setTxs(prev => [
        { hash: shortHash, type: 'BURN & RETIRE (Proof of Impact)', amount: burnAmount, timestamp: new Date().toLocaleString(), status: 'Success' },
        ...prev
      ]);
      setIsBurning(false);

      confetti({
        particleCount: 80,
        spread: 50,
        colors: ['#10b981', '#34d399', '#059669']
      });
    }, 1800);
  };

  const handleVerifyProof = (id: number) => {
    setIsVerifyingProof(id);
    setTimeout(() => {
      setProofs(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p));
      setIsVerifyingProof(null);
      
      confetti({
        particleCount: 40,
        spread: 30,
        colors: ['#10b981', '#3b82f6']
      });
    }, 2000);
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
        <div className="space-y-6">
          
          {/* TOP ROW: Wallet Status & Overview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Wallet Connector Card */}
            <div className={`md:col-span-4 p-5 rounded-xl border shadow-sm ${
              isLightMode ? 'bg-white border-slate-100' : 'bg-[#0f0c1b] border-purple-500/10'
            }`}>
              <div className="pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
                <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-purple-300">
                  {lang === 'fr' ? 'IDENTITÉ CRYPTOGRAPHIQUE' : 'CRYPTOGRAPHIC IDENTITY'}
                </h3>
                <Wallet className="w-4 h-4 text-purple-400" />
              </div>

              {!walletConnected ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {lang === 'fr' 
                      ? 'Connectez votre portefeuille décentralisé Web3 pour interagir avec les smart contracts de BeeCarbonat.' 
                      : 'Connect your decentralized Web3 wallet to interact with BeeCarbonat smart contracts.'}
                  </p>
                  <button
                    onClick={handleConnectWallet}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold tracking-wide shadow-md shadow-purple-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{lang === 'fr' ? 'Connecter un Portefeuille' : 'Connect Wallet'}</span>
                  </button>
                  <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Metamask • Core Wallet • Web3 Standard</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-mono">{lang === 'fr' ? 'ADRESSE' : 'ADDRESS'}</span>
                      <span className="text-xs font-mono font-black text-purple-300">{walletAddress}</span>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/40 text-center">
                      <span className="text-[9px] text-slate-500 block font-mono uppercase">Balance BCT</span>
                      <span className="text-sm font-black text-white font-mono">{walletBalance.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/40 text-center">
                      <span className="text-[9px] text-slate-500 block font-mono uppercase">Balance ETH</span>
                      <span className="text-sm font-black text-purple-200 font-mono">{ethBalance.toFixed(4)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnectWallet}
                    className="w-full py-2 px-3 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-lg text-[10px] font-bold font-mono uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{lang === 'fr' ? 'Déconnecter' : 'Disconnect'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Smart Contract Minting Engine Card */}
            <div className={`md:col-span-4 p-5 rounded-xl border shadow-sm ${
              isLightMode ? 'bg-white border-slate-100' : 'bg-[#0f0c1b] border-emerald-500/10'
            }`}>
              <div className="pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
                <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-emerald-300">
                  {lang === 'fr' ? 'MINTER DES CRÉDITS CARBONE (RWA)' : 'MINT CARBON CREDITS (RWA)'}
                </h3>
                <Coins className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === 'fr' 
                    ? 'Générez des jetons d\'utilité $BCT indexés sur les économies de CO2 mesurées en direct sur vos installations.' 
                    : 'Issue utility $BCT tokens backed by certified CO2 reduction metrics measured from your smart HVAC endpoints.'}
                </p>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">{lang === 'fr' ? 'Quantité à générer ($BCT)' : 'Amount to mint ($BCT)'}</span>
                    <span className="font-mono font-bold text-emerald-400">{mintAmount} Tonnes CO2eq</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(parseInt(e.target.value))}
                    disabled={!walletConnected}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                  />
                </div>

                <button
                  onClick={handleMint}
                  disabled={!walletConnected || isMinting}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-bold tracking-wide shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {isMinting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>{lang === 'fr' ? 'Signature cryptographique...' : 'Signing proof on-chain...'}</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>{lang === 'fr' ? 'Minter sur Sepolia (RWA)' : 'Mint Carbon Credits'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* DeFi Staking Pool Card */}
            <div className={`md:col-span-4 p-5 rounded-xl border shadow-sm ${
              isLightMode ? 'bg-white border-slate-100' : 'bg-[#0f0c1b] border-amber-500/10'
            }`}>
              <div className="pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
                <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-amber-300">
                  {lang === 'fr' ? 'STAKING POOL BEE-OS' : 'BEE-OS STAKING POOL'}
                </h3>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">APY Actuel</span>
                  <span className="font-mono font-bold text-amber-400">12.45% APY</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/40 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">{lang === 'fr' ? 'VOTRE STAKE' : 'YOUR STAKE'}</span>
                    <span className="text-base font-black text-amber-300 font-mono">{stakedBalance.toFixed(2)} BCT</span>
                  </div>
                  {stakedBalance > 0 && (
                    <button
                      onClick={handleUnstake}
                      disabled={isUnstaking}
                      className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded hover:bg-amber-500/20 transition-all flex items-center gap-1"
                    >
                      {isUnstaking ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'CLAIM'}
                    </button>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">{lang === 'fr' ? 'Montant à Stake' : 'Amount to Stake'}</span>
                    <span className="font-mono font-bold text-amber-400">{stakeAmount} BCT</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max={Math.max(5, walletBalance)}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(parseInt(e.target.value))}
                    disabled={!walletConnected || walletBalance < 5}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                  />
                </div>

                <button
                  onClick={handleStake}
                  disabled={!walletConnected || walletBalance < stakeAmount || isStaking}
                  className="w-full py-2 px-4 bg-amber-500/20 hover:bg-amber-500/30 disabled:bg-slate-800 disabled:text-slate-500 border border-amber-500/30 disabled:border-none text-amber-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isStaking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'fr' ? 'Transaction en cours...' : 'Staking tokens...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'fr' ? 'Déposer dans le Pool' : 'Lock in Staking Pool'}</span>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* LOWER ROW: Burn & On-Chain Audit Proof verification */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* On-Chain Verification Proof Checklist */}
            <div className={`lg:col-span-7 p-5 rounded-xl border shadow-sm ${
              isLightMode ? 'bg-white border-slate-100' : 'bg-[#0f0c1b] border-purple-500/10'
            }`}>
              <div className="pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
                <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-purple-300">
                  {lang === 'fr' ? 'ANCRAGE ON-CHAIN & RAPPORTS DE TÉLÉMÉTRIE' : 'ON-CHAIN TELEMETRY ROOTS'}
                </h3>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === 'fr' 
                    ? 'Chaque rapport de métrique carbone journalier est résumé en un hash Merkle Root et scellé sur la blockchain Ethereum Sepolia. Utilisez le bouton pour vérifier instantanément la non-falsification.' 
                    : 'Verify telemetry authenticity. Daily Carbon metrics are compressed into Merkle cryptographic roots and anchored to Ethereum Sepolia.'}
                </p>

                <div className="space-y-2.5">
                  {proofs.map((proof) => (
                    <div 
                      key={proof.id}
                      className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-[10px]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{proof.date}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-bold">Block #{proof.blockNumber}</span>
                        </div>
                        <div className="text-slate-400">
                          Root: <span className="text-slate-300 text-[9px]">{proof.rootHash}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {proof.verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>VERIFIED ON-CHAIN</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyProof(proof.id)}
                            disabled={isVerifyingProof !== null}
                            className="px-3 py-1.5 bg-purple-500 text-white hover:bg-purple-600 rounded text-[9px] font-bold tracking-wide transition-all flex items-center gap-1.5"
                          >
                            {isVerifyingProof === proof.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>VERIFYING...</span>
                              </>
                            ) : (
                              <>
                                <Link className="w-3 h-3" />
                                <span>VERIFY PROOF</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Burn / Carbon Retirement Certificate */}
            <div className={`lg:col-span-5 p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
              isLightMode ? 'bg-white border-slate-100' : 'bg-[#0f0c1b] border-red-500/10'
            }`}>
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
                  <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-red-400">
                    {lang === 'fr' ? 'BRÛLER & RETIRER LES CRÉDITS CARBONE' : 'BURN & RETIRE CARBON CREDITS'}
                  </h3>
                  <Leaf className="w-4 h-4 text-red-400" />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {lang === 'fr' 
                    ? 'Cette action brûle vos tokens carbone $BCT. Ils sont retirés définitivement du ledger, ce qui crée une preuve d\'impact infalsifiable avec un certificat téléchargeable.' 
                    : 'Destroy your utility carbon tokens to offset greenhouse emissions permanently. This logs an immutable Proof of Impact on-chain.'}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{lang === 'fr' ? 'Tonnes CO2eq à détruire' : 'Tons to Burn & Retire'}</span>
                    <span className="font-mono font-bold text-red-400">{burnAmount} BCT</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max={Math.max(5, walletBalance)}
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(parseInt(e.target.value))}
                    disabled={!walletConnected || walletBalance < 5}
                    className="w-full accent-red-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleBurn}
                  disabled={!walletConnected || walletBalance < burnAmount || isBurning}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600/30 to-rose-600/30 hover:from-red-600/40 hover:to-rose-600/40 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
                >
                  {isBurning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
                      <span>{lang === 'fr' ? 'Retrait sur le ledger...' : 'Retiring tokens on ledger...'}</span>
                    </>
                  ) : (
                    <>
                      <Leaf className="w-4 h-4" />
                      <span>{lang === 'fr' ? 'Brûler & Certifier l\'Impact' : 'Burn & Certify Impact'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* BLOCK EXPLORER: Recent on-chain logs */}
          <div className={`p-5 rounded-xl border shadow-sm ${
            isLightMode ? 'bg-white border-slate-100' : 'bg-[#0f0c1b] border-slate-800'
          }`}>
            <div className="pb-3 mb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
              <h3 className="text-[11px] font-black font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'fr' ? 'EXPLORATEUR DE TRANSACTIONS (SEPOLIA TESTNET)' : 'SEPOLIA BLOCK EXPLORER LOGS'}
              </h3>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-black">
                    <th className="py-2.5 px-2">{lang === 'fr' ? 'HASH TX' : 'TX HASH'}</th>
                    <th className="py-2.5 px-2">{lang === 'fr' ? 'TYPE D\'OPÉRATION' : 'METHOD / TYPE'}</th>
                    <th className="py-2.5 px-2">{lang === 'fr' ? 'MONTANT' : 'AMOUNT'}</th>
                    <th className="py-2.5 px-2">TIMESTAMP</th>
                    <th className="py-2.5 px-2">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {txs.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-all">
                      <td className="py-2.5 px-2 text-purple-400 select-all flex items-center gap-1">
                        <span>{tx.hash}</span>
                        <ExternalLink className="w-3 h-3 opacity-40" />
                      </td>
                      <td className="py-2.5 px-2 text-slate-300 font-bold">{tx.type}</td>
                      <td className="py-2.5 px-2 font-black text-amber-300">{tx.amount} $BCT</td>
                      <td className="py-2.5 px-2 text-slate-400">{tx.timestamp}</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
