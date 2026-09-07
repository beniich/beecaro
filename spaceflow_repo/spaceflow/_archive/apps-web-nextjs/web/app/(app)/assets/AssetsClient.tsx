"use client";

import { useState } from 'react';
import { Layers, ChevronRight, CheckCircle2, AlertTriangle, Plus, Search } from 'lucide-react';
import clsx from 'clsx';

// Type générique temporaire
type Asset = any;

export default function AssetsClient({ initialAssets }: { initialAssets: Asset[] }) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(initialAssets[0] || null);
  const [search, setSearch] = useState('');

  const filteredAssets = initialAssets.filter(a => 
    a.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.serialNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-full bg-zinc-950 overflow-hidden text-zinc-100 font-sans p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display uppercase text-zinc-50 flex items-center gap-3">
            Inventaire des Actifs
            <span className="text-xs font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-brand-cyan rounded normal-case">
              Server Components
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-orange-500 text-black px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-orange-600 transition-all rounded">
            <Plus className="w-4 h-4" />
            Nouvel Actif
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1">
        {/* Left Side: List */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/60 shadow-lg flex flex-col flex-1 overflow-hidden h-[700px]">
            <div className="p-5 border-b border-zinc-800/40 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 pl-9 pr-4 py-2 rounded-lg border border-zinc-800 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan w-full text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">Aucun équipement trouvé.</div>
              ) : (
                filteredAssets.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={clsx(
                      "p-4 rounded-lg cursor-pointer transition-colors border",
                      selectedAsset?.id === asset.id 
                        ? "bg-zinc-800 border-zinc-700" 
                        : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{asset.name}</div>
                        <div className="text-xs text-zinc-500 mt-1 font-mono">SN: {asset.serialNumber || 'N/A'}</div>
                      </div>
                      <span className={clsx(
                        "text-[10px] px-2 py-1 rounded-full uppercase tracking-widest",
                        asset.status === 'OPERATIONAL' ? 'bg-green-500/10 text-green-400' :
                        asset.status === 'MAINTENANCE' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-zinc-800 text-zinc-400'
                      )}>
                        {asset.status || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="w-full lg:w-[400px] shrink-0 bg-zinc-900/80 border border-zinc-800/60 shadow-2xl rounded-xl overflow-hidden flex flex-col h-[700px]">
          {selectedAsset ? (
            <>
              <div className="p-6 border-b border-zinc-800 bg-zinc-950">
                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase mb-3 inline-block">
                  {selectedAsset.category || 'GENERAL'}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-zinc-100">{selectedAsset.name}</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-sm text-zinc-500 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-zinc-300">{selectedAsset.status}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500 mb-1">Modèle / Constructeur</div>
                  <div className="text-zinc-300">{selectedAsset.model || '-'} / {selectedAsset.manufacturer || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500 mb-1">Date d'installation</div>
                  <div className="text-zinc-300">
                    {selectedAsset.installationDate ? new Date(selectedAsset.installationDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              Sélectionnez un équipement
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
