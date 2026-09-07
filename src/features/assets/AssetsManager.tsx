import React, { useState, useEffect } from 'react';
import { 
  Cpu, Search, Filter, QrCode, Activity, Zap, Calendar, Wrench, 
  CheckCircle2, AlertCircle, ExternalLink, Plus, Thermometer,
  LayoutGrid, List, ChevronRight, ChevronDown, Download, FileText,
  Building2, Server, Settings2, ShieldAlert, X, Database, Wifi, WifiOff, RefreshCw,
  Radio
} from 'lucide-react';
import { Asset } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';
import { localCache } from '../../services/localCache';
import { NfcAssetScannerModal } from './NfcAssetScannerModal';

interface AssetsManagerProps {
  onInspectAsset: (asset: Asset) => void;
  onOpenQrTag: (asset: Asset) => void;
  onCreateTicketForAsset: (asset: Asset) => void;
}

export const AssetsManager: React.FC<AssetsManagerProps> = ({
  onInspectAsset,
  onOpenQrTag,
  onCreateTicketForAsset
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!localCache.isOnline());
  const [cachedCount, setCachedCount] = useState(0);

  const [newAsset, setNewAsset] = useState<Omit<Asset, 'id'>>({
    name: '',
    code: `AST-${Math.floor(Math.random() * 9000 + 1000)}`,
    category: 'HVAC',
    buildingId: 'bld-01',
    buildingName: 'Spider Cybernetics Tower A',
    floor: 'Floor 12',
    zone: 'Technical Core',
    status: 'operational',
    healthScore: 98,
    lastInspected: new Date().toISOString().split('T')[0],
    nextService: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
    installDate: '2024-03-15',
    manufacturer: 'Daikin Variable VRV',
    model: 'D-9000 Pro',
    serialNumber: `SN-${Date.now().toString().slice(-6)}`,
    powerConsumptionKw: 18.5,
    telemetry: {
      runtimeHours: 420,
      efficiencyRatio: 96
    },
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-AUTO'
  });

  const loadAssets = async () => {
    try {
      const data = await api.getAssets();
      if (data && Array.isArray(data)) {
        setAssets(data);
        setCachedCount(data.length);
      }
    } catch (e) {
      console.error('Failed to load assets:', e);
    }
  };

  useEffect(() => {
    loadAssets();

    const unsub = localCache.subscribe(() => {
      setIsOffline(!localCache.isOnline());
      loadAssets();
    });

    const handleNetChange = () => {
      setIsOffline(!localCache.isOnline());
      loadAssets();
    };

    window.addEventListener('online', handleNetChange);
    window.addEventListener('offline', handleNetChange);

    return () => {
      unsub();
      window.removeEventListener('online', handleNetChange);
      window.removeEventListener('offline', handleNetChange);
    };
  }, []);

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      if (localCache.isOnline()) {
        await api.syncOfflineData();
      }
      await loadAssets();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name.trim()) return;
    const created = await api.createAsset(newAsset);
    setAssets(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewAsset({
      name: '',
      code: `AST-${Math.floor(Math.random() * 9000 + 1000)}`,
      category: 'HVAC',
      buildingId: 'bld-01',
      buildingName: 'Spider Cybernetics Tower A',
      floor: 'Floor 12',
      zone: 'Technical Core',
      status: 'operational',
      healthScore: 98,
      lastInspected: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
      installDate: '2024-03-15',
      manufacturer: 'Daikin Variable VRV',
      model: 'D-9000 Pro',
      serialNumber: `SN-${Date.now().toString().slice(-6)}`,
      powerConsumptionKw: 18.5,
      telemetry: {
        runtimeHours: 420,
        efficiencyRatio: 96
      },
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-NEW'
    });
  };


  const [viewMode, setViewMode] = useState<'grid' | 'enterprise'>('enterprise');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'Site-Main': true,
    'B-TowerA': true,
    'S-HVAC': true
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="assets-manager-view" className="space-y-4 animate-in fade-in duration-300">
      
      {/* Enterprise Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 text-black dark:text-white shadow-lg">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-black dark:text-white tracking-tight uppercase">
                Enterprise Asset Management (EAM)
              </h2>
              <span className="bg-blue-900/50 text-blue-400 text-[10px] px-2 py-0.5 border border-blue-700 uppercase tracking-widest font-mono font-bold">
                TRIRIGA / MAXIMO ENGINE
              </span>
              {/* Offline / Cache status badge */}
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                isOffline 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Database className="w-3 h-3 text-emerald-400" />}
                {isOffline ? 'Cache Local Actif' : 'IndexedDB Sync'} ({cachedCount} actifs)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Asset Lifecycle, Hierarchies, PM Schedules, and Cost Center Allocation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-black dark:text-white transition-colors"
            title="Rafraîchir / Synchroniser le cache"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 border transition-colors ${viewMode === 'grid' ? 'bg-blue-600 border-blue-500 text-black dark:text-white' : 'bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('enterprise')}
            className={`p-1.5 border transition-colors ${viewMode === 'enterprise' ? 'bg-blue-600 border-blue-500 text-black dark:text-white' : 'bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-2" />
          <button 
            onClick={() => setShowNfcModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 text-xs font-bold font-mono border border-orange-400 flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            title="Identifier un équipement par tag NFC sans contact (Web NFC)"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" /> SCAN NFC
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-black dark:text-white px-3 py-1.5 text-xs font-bold font-mono border border-emerald-500 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> NEW ASSET
          </button>
        </div>
      </div>

      {viewMode === 'enterprise' ? (
        /* IBM STYLE ENTERPRISE DENSE VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start h-[calc(100vh-200px)]">
          
          {/* Left Column: Asset Hierarchy Tree */}
          <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
            <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase">Location / Asset Hierarchy</span>
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            
            <div className="p-2 text-xs font-mono text-slate-600 dark:text-slate-600 dark:text-slate-300">
              {/* Site Level */}
              <div className="py-1">
                <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1" onClick={() => toggleNode('Site-Main')}>
                  {expandedNodes['Site-Main'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500" />
                  <span className="font-bold">Global Headquarters</span>
                </div>
                
                {/* Building Level */}
                {expandedNodes['Site-Main'] && (
                  <div className="pl-4 border-l border-slate-200 dark:border-slate-700 ml-2 mt-1 space-y-1">
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1" onClick={() => toggleNode('B-TowerA')}>
                      {expandedNodes['B-TowerA'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <span>Tower A - Engineering</span>
                    </div>
                    
                    {/* System Level */}
                    {expandedNodes['B-TowerA'] && (
                      <div className="pl-4 border-l border-slate-200 dark:border-slate-700 ml-2 mt-1 space-y-1">
                        <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1" onClick={() => toggleNode('S-HVAC')}>
                          {expandedNodes['S-HVAC'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          <Settings2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          <span>HVAC Systems</span>
                        </div>
                        
                        {/* Asset Level */}
                        {expandedNodes['S-HVAC'] && (
                          <div className="pl-4 border-l border-slate-200 dark:border-slate-700 ml-2 mt-1 space-y-1">
                            {filteredAssets.filter(a => a.category === 'HVAC').map(a => (
                              <div key={a.id} onClick={() => onInspectAsset(a)} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'operational' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{a.code}</span>
                                <span className="truncate">{a.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dense Data Grid */}
          <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
            
            {/* Toolbar */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 w-1/2">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter asset list..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-2 py-1 w-full text-black dark:text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowNfcModal(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold transition-colors"
                  title="Scan NFC sans contact"
                >
                  <Radio className="w-3.5 h-3.5 text-orange-400" />
                  <span className="hidden sm:inline">NFC</span>
                </button>
                <button className="p-1 text-slate-500 dark:text-slate-400 hover:text-black dark:text-white"><Download className="w-4 h-4" /></button>
                <button className="p-1 text-slate-500 dark:text-slate-400 hover:text-black dark:text-white"><Filter className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse text-[11px] font-mono whitespace-nowrap">
                <thead className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Asset ID</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Location</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Class</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Health</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Next PM</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300">
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-blue-900/20 cursor-pointer" onClick={() => onInspectAsset(asset)}>
                      <td className="px-3 py-2 text-blue-400 font-bold">{asset.code}</td>
                      <td className="px-3 py-2 font-sans font-medium text-black dark:text-white">{asset.name}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                          asset.status === 'operational' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                          asset.status === 'maintenance' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                          'bg-red-900/30 text-red-400 border-red-500/30'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{asset.buildingName} - {asset.floor}</td>
                      <td className="px-3 py-2">{asset.category}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 overflow-hidden">
                            <div className={`h-full ${asset.healthScore > 80 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${asset.healthScore}%` }} />
                          </div>
                          <span className={asset.healthScore > 80 ? 'text-emerald-400' : 'text-red-400'}>{asset.healthScore}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">{asset.nextService}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setShowNfcModal(true); }} className="text-orange-400 hover:text-orange-300" title="Scanner Tag NFC">
                            <Radio className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onOpenQrTag(asset); }} className="text-slate-500 dark:text-slate-400 hover:text-black dark:text-white" title="View QR Tag">
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onCreateTicketForAsset(asset); }} className="text-blue-400 hover:text-blue-300" title="Create Work Order">
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span>Showing 1 to {filteredAssets.length} of {filteredAssets.length} records</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-0.5 bg-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:bg-slate-600">Prev</button>
                <button className="px-2 py-0.5 bg-blue-600 text-black dark:text-white">1</button>
                <button className="px-2 py-0.5 bg-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:bg-slate-600">Next</button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ORIGINAL GRID VIEW FOR FALLBACK */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onInspectAsset(asset)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-xl p-4 shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase block">{asset.code}</span>
                    <h3 className="text-sm font-bold text-black dark:text-white mt-1">{asset.name}</h3>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{asset.buildingName} • {asset.floor}</div>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <button onClick={(e) => { e.stopPropagation(); setShowNfcModal(true); }} className="flex items-center space-x-1 text-orange-400 hover:text-orange-300">
                    <Radio className="w-3.5 h-3.5" /> <span>NFC</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onOpenQrTag(asset); }} className="flex items-center space-x-1 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-black dark:text-white">
                    <QrCode className="w-3.5 h-3.5" /> <span>QR</span>
                  </button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onCreateTicketForAsset(asset); }} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                  <Wrench className="w-3.5 h-3.5" /> <span>WO</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-bold text-black dark:text-white font-mono uppercase">Enregistrer un Équipement (Asset)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-black dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 mt-4 text-xs font-mono">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Nom de l'équipement</label>
                <input
                  type="text"
                  required
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="Ex: Rooftop Chiller Unit 04"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Code Asset</label>
                  <input
                    type="text"
                    value={newAsset.code}
                    onChange={e => setNewAsset({ ...newAsset, code: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-black dark:text-white font-bold text-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Catégorie</label>
                  <select
                    value={newAsset.category}
                    onChange={e => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-black dark:text-white"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Elevator">Elevator</option>
                    <option value="Fire Safety">Fire Safety</option>
                    <option value="Solar/Renewable">Solar/Renewable</option>
                    <option value="IoT Sensor">IoT Sensor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Bâtiment</label>
                  <input
                    type="text"
                    value={newAsset.buildingName}
                    onChange={e => setNewAsset({ ...newAsset, buildingName: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Étage & Zone</label>
                  <input
                    type="text"
                    value={newAsset.floor}
                    onChange={e => setNewAsset({ ...newAsset, floor: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Fabricant / Marque</label>
                  <input
                    type="text"
                    value={newAsset.manufacturer}
                    onChange={e => setNewAsset({ ...newAsset, manufacturer: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Puissance (kW)</label>
                  <input
                    type="number"
                    value={newAsset.powerConsumptionKw}
                    onChange={e => setNewAsset({ ...newAsset, powerConsumptionKw: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:bg-slate-700 font-sans"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-black dark:text-white font-bold hover:bg-emerald-500 font-sans"
                >
                  Enregistrer dans PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Web NFC Asset Identification Modal */}
      <NfcAssetScannerModal
        isOpen={showNfcModal}
        onClose={() => setShowNfcModal(false)}
        assets={assets}
        onInspectAsset={onInspectAsset}
        onCreateTicketForAsset={onCreateTicketForAsset}
      />
    </div>
  );
};
