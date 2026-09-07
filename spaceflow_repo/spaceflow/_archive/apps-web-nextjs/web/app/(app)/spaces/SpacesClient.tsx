"use client";

import React, { useState } from 'react';
import { ChevronRight, Building2, MapPin, Search, Plus, Layers } from 'lucide-react';
import clsx from 'clsx';

type Space = any;
type Building = any;

export default function SpacesClient({ initialBuildings }: { initialBuildings: Building[] }) {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>(
    initialBuildings.reduce((acc, b) => ({ ...acc, [b.id]: true }), {})
  );
  const [search, setSearch] = useState('');

  const toggleBuilding = (id: string) => {
    setExpandedBuildings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredBuildings = buildings.map(b => {
    const bMatch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchedSpaces = b.spaces?.filter((s: Space) => s.name.toLowerCase().includes(search.toLowerCase())) || [];
    return {
      ...b,
      spaces: matchedSpaces,
      isVisible: bMatch || matchedSpaces.length > 0
    };
  }).filter(b => b.isVisible);

  return (
    <div className="relative min-h-full bg-zinc-950 overflow-hidden text-zinc-100 font-sans p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display uppercase text-zinc-50 flex items-center gap-3">
            Espaces & Bâtiments
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-brand-cyan text-black px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-cyan-400 transition-all rounded shadow-[0_0_15px_rgba(0,219,231,0.3)]">
            <Plus className="w-4 h-4" />
            Ajouter un Bâtiment
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 bg-zinc-900/60 rounded-xl border border-zinc-800/60 shadow-lg overflow-hidden">
        
        <div className="p-5 border-b border-zinc-800/40 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Filtrer espaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 pl-9 pr-4 py-2 rounded-lg border border-zinc-800 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan w-full text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800/60">
              <tr className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
                <th className="p-4 w-12 text-center"></th>
                <th className="p-4">Nom de l'Espace</th>
                <th className="p-4">Type</th>
                <th className="p-4">Capacité / Surface</th>
                <th className="p-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800/30">
              {filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-500">Aucun bâtiment ou espace trouvé.</td>
                </tr>
              ) : (
                filteredBuildings.map(building => (
                  <React.Fragment key={building.id}>
                    {/* Ligne Bâtiment */}
                    <tr 
                      className="bg-zinc-900/40 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      onClick={() => toggleBuilding(building.id)}
                    >
                      <td className="p-4 text-center">
                        <ChevronRight className={clsx("w-4 h-4 text-zinc-500 transition-transform mx-auto", expandedBuildings[building.id] && "rotate-90")} />
                      </td>
                      <td className="p-4 font-bold text-zinc-100 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-cyan" />
                        {building.name}
                      </td>
                      <td className="p-4 text-zinc-500 font-mono text-xs uppercase">Bâtiment</td>
                      <td className="p-4 text-zinc-400 text-xs">
                        {building.totalArea ? `${building.totalArea} m²` : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono uppercase">
                          Actif
                        </span>
                      </td>
                    </tr>
                    
                    {/* Lignes Espaces (si étendu) */}
                    {expandedBuildings[building.id] && building.spaces?.map((space: Space) => (
                      <tr key={space.id} className="bg-zinc-950 hover:bg-zinc-900/50 transition-colors">
                        <td className="p-4"></td>
                        <td className="p-4 pl-10 flex items-center gap-2 text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                          {space.name}
                        </td>
                        <td className="p-4 text-zinc-500 font-mono text-[10px] uppercase">{space.type}</td>
                        <td className="p-4 text-zinc-400 text-xs">
                          {space.capacity} pers. / {space.area} m²
                        </td>
                        <td className="p-4 text-right">
                          <span className={clsx(
                            "text-[10px] px-2 py-0.5 rounded font-mono uppercase",
                            space.status === 'available' ? 'bg-green-500/10 text-green-400' :
                            space.status === 'occupied' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-orange-500/10 text-orange-400'
                          )}>
                            {space.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
