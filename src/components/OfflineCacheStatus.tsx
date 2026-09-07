import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wifi, WifiOff, Database, RefreshCw, HardDrive, 
  CheckCircle2, AlertTriangle, ArrowUpRight, Trash2, 
  ShieldCheck, Zap, Info, X
} from 'lucide-react';
import { localCache, CacheMetadata } from '../services/localCache';
import { api } from '../services/api';

interface OfflineCacheStatusProps {
  lang: 'fr' | 'en';
  isLightMode?: boolean;
  compact?: boolean;
}

export const OfflineCacheStatus: React.FC<OfflineCacheStatusProps> = ({
  lang,
  isLightMode = false,
  compact = false
}) => {
  const [meta, setMeta] = useState<CacheMetadata>({
    lastSync: new Date().toISOString(),
    assetCount: 0,
    workOrderCount: 0,
    pendingSyncCount: 0,
    storageEngine: 'Dexie/IndexedDB',
    isOnline: true,
    isSimulatedOffline: false
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const refreshMeta = async () => {
    const data = await localCache.getCacheMetadata();
    setMeta(data);
  };

  useEffect(() => {
    refreshMeta();
    const unsub = localCache.subscribe(() => {
      refreshMeta();
    });

    const handleOnline = () => {
      refreshMeta();
      api.syncOfflineData().then(() => refreshMeta());
    };
    const handleOffline = () => refreshMeta();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleSimulatedOffline = () => {
    const nextState = !meta.isSimulatedOffline;
    localCache.setSimulatedOffline(nextState);
    setFeedbackMsg(
      nextState 
        ? (lang === 'fr' ? 'Mode hors-ligne simulé activé' : 'Simulated offline mode enabled') 
        : (lang === 'fr' ? 'Connexion réseau rétablie' : 'Network connection restored')
    );
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (meta.isOnline) {
        const res = await api.syncOfflineData();
        await api.getAssets();
        await api.getWorkOrders();
        await refreshMeta();
        setFeedbackMsg(
          lang === 'fr' 
            ? `Synchronisation réussie (${res.syncedAssets + res.syncedWorkOrders} éléments mis à jour)` 
            : `Sync completed (${res.syncedAssets + res.syncedWorkOrders} items synced)`
        );
      } else {
        await localCache.primeDefaultCache();
        await refreshMeta();
        setFeedbackMsg(lang === 'fr' ? 'Données locales rafraîchies' : 'Local data refreshed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm(lang === 'fr' ? 'Réinitialiser le cache local hors-ligne ?' : 'Reset local offline cache?')) {
      await localCache.clearCache();
      await localCache.primeDefaultCache();
      await refreshMeta();
      setFeedbackMsg(lang === 'fr' ? 'Cache réinitialisé' : 'Cache reset successfully');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Status Badge Display
  const isActuallyOnline = meta.isOnline && !meta.isSimulatedOffline;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] transition-all border ${
          meta.isSimulatedOffline
            ? 'bg-amber-500/5 text-amber-500 border-amber-500/20 hover:bg-amber-500/10'
            : isActuallyOnline
              ? (isLightMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10')
              : 'bg-rose-500/5 text-rose-500 border-rose-500/20 hover:bg-rose-500/10'
        }`}
        title={lang === 'fr' ? 'État du cache local & synchronisation' : 'Local cache state & sync'}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {isActuallyOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              meta.isSimulatedOffline
                ? 'bg-amber-500'
                : isActuallyOnline
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
            }`}
          />
        </span>

        {meta.isSimulatedOffline ? (
          <span className="flex items-center gap-1.5 uppercase font-bold">
            <WifiOff className="w-3 h-3 text-amber-500" />
            <span>{lang === 'fr' ? 'HORS-LIGNE (TEST)' : 'OFFLINE (TEST)'}</span>
          </span>
        ) : isActuallyOnline ? (
          <span className="flex items-center gap-1.5 uppercase font-bold">
            <Database className="w-3 h-3 text-emerald-500" />
            <span>{meta.storageEngine} {lang === 'fr' ? 'SYNCHRO' : 'SYNCHRO'}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 uppercase font-bold">
            <WifiOff className="w-3 h-3 text-rose-500" />
            <span>{lang === 'fr' ? 'HORS-LIGNE (CACHE)' : 'OFFLINE (CACHED)'}</span>
          </span>
        )}

        {!compact && (
          <span className={`${isLightMode ? 'text-emerald-700/60' : 'text-emerald-600'} font-bold`}>
            ({meta.assetCount + meta.workOrderCount} items)
          </span>
        )}
      </button>

      {/* Detail Modal Dialog */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 overflow-hidden transition-all ${
              isLightMode 
                ? 'bg-white border-slate-200 text-slate-900' 
                : 'bg-[#140e24] border-[#3d2e5a] text-black dark:text-white'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#ff9d2b]/15 text-[#ff9d2b] border border-[#ff9d2b]/30">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold uppercase tracking-tight">
                    {lang === 'fr' ? 'Cache Local & Mode Hors-Ligne' : 'Local Cache & Offline Mode'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 font-sans">
                    {lang === 'fr' 
                      ? 'Stockage local persistant (IndexedDB & LocalStorage)' 
                      : 'Persistent offline state storage (IndexedDB & LocalStorage)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Feedback */}
            {feedbackMsg && (
              <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Status overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <div className={`p-3 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#1a1330] border-[#382b54]'
              }`}>
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                  {lang === 'fr' ? 'Moteur de Cache' : 'Storage Engine'}
                </span>
                <span className="text-sm font-mono font-black text-[#ff9d2b] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#ff9d2b]" />
                  {meta.storageEngine}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#1a1330] border-[#382b54]'
              }`}>
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                  {lang === 'fr' ? 'Équipements' : 'Cached Assets'}
                </span>
                <span className="text-sm font-mono font-black text-emerald-400">
                  {meta.assetCount} {lang === 'fr' ? 'unités' : 'units'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#1a1330] border-[#382b54]'
              }`}>
                <span className="text-[10px] font-mono text-gray-400 uppercase block mb-1">
                  {lang === 'fr' ? 'Ordres de Travail' : 'Work Orders'}
                </span>
                <span className="text-sm font-mono font-black text-blue-400">
                  {meta.workOrderCount} {lang === 'fr' ? 'OTs' : 'WOs'}
                </span>
              </div>
            </div>

            {/* Detailed metadata */}
            <div className={`p-3.5 rounded-xl border space-y-2 text-xs font-mono mb-4 ${
              isLightMode ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#18112c] border-[#382b54] text-neutral-300'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{lang === 'fr' ? 'Dernière synchro :' : 'Last synced:'}</span>
                <span className="font-bold">
                  {new Date(meta.lastSync).toLocaleTimeString()} ({new Date(meta.lastSync).toLocaleDateString()})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{lang === 'fr' ? 'Modifications en attente :' : 'Pending offline queue:'}</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  meta.pendingSyncCount > 0 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {meta.pendingSyncCount} {lang === 'fr' ? 'opérations' : 'actions'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{lang === 'fr' ? 'État réseau réel :' : 'Actual network status:'}</span>
                <span className="font-bold flex items-center gap-1">
                  {navigator.onLine ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{lang === 'fr' ? 'Connecté à Internet' : 'Connected to Internet'}</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-rose-400">{lang === 'fr' ? 'Pas de connexion' : 'No Internet'}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Offline Simulation Switch */}
            <div className={`p-4 rounded-xl border mb-5 flex items-center justify-between gap-4 ${
              meta.isSimulatedOffline 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                : isLightMode 
                  ? 'bg-slate-100/70 border-slate-200' 
                  : 'bg-white/5 border-white/10'
            }`}>
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#ff9d2b]" />
                  <span>{lang === 'fr' ? 'Simulateur de Déconnexion' : 'Offline Simulation Mode'}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  {lang === 'fr' 
                    ? 'Coupez artificiellement le réseau pour tester la consultation et création d\'actifs hors-ligne.'
                    : 'Artificially cut network traffic to test asset/work order viewing and drafting offline.'}
                </p>
              </div>
              <button
                onClick={handleToggleSimulatedOffline}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-sm ${
                  meta.isSimulatedOffline
                    ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700 hover:text-black dark:text-white border border-neutral-700'
                }`}
              >
                {meta.isSimulatedOffline 
                  ? (lang === 'fr' ? 'DÉSACTIVER' : 'DEACTIVATE') 
                  : (lang === 'fr' ? 'ACTIVER' : 'ACTIVATE')}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200 dark:border-neutral-800">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff9d2b] hover:bg-[#ff8f0e] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#ff9d2b]/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{lang === 'fr' ? 'Synchroniser & Mettre à jour' : 'Sync & Re-cache Now'}</span>
              </button>

              <button
                onClick={handleClearCache}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isLightMode 
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-red-600' 
                    : 'border-[#382b54] text-neutral-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Vider Cache' : 'Clear Cache'}</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};
