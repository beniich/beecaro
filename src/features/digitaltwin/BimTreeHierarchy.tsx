import React, { useState } from 'react';
import { BimDiscipline, BimElement } from '../../types/bim';
import { 
  Folder, 
  FolderOpen, 
  Layers, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Wind, 
  Droplets, 
  Zap, 
  Cpu, 
  Building2,
  Box,
  Eye,
  EyeOff
} from 'lucide-react';

interface BimTreeHierarchyProps {
  elements: BimElement[];
  selectedElement: BimElement | null;
  onSelectElement: (element: BimElement) => void;
  isLightMode?: boolean;
}

export const BimTreeHierarchy: React.FC<BimTreeHierarchyProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  isLightMode = false
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'storey-all': true,
    'storey-0': true,
    'storey-3': true,
    'storey-5': true
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Group elements by storey
  const storeysMap = new Map<string, BimElement[]>();
  elements.forEach(el => {
    const key = String(el.floor || 'Général');
    if (!storeysMap.has(key)) storeysMap.set(key, []);
    storeysMap.get(key)!.push(el);
  });

  // Filter elements by search term
  const filteredElements = elements.filter(el => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      el.name.toLowerCase().includes(term) ||
      el.ifcType.toLowerCase().includes(term) ||
      el.guid.toLowerCase().includes(term) ||
      (el.systemName && el.systemName.toLowerCase().includes(term))
    );
  });

  const getDisciplineIcon = (disc: BimDiscipline) => {
    switch (disc) {
      case 'hvac': return <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'plumbing': return <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'electrical': return <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'equipment': return <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      default: return <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className={`h-full flex flex-col rounded-2xl border shadow-xl overflow-hidden ${
      isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-xl'
    }`}>
      {/* Search Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Arborescence Spatiale IFC
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {elements.length} entités
          </span>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer (ex: Gaine, Mur, CTA)..."
            className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-xl outline-none font-mono ${
              isLightMode ? 'bg-slate-100 border border-slate-200 text-slate-800' : 'bg-slate-950 border border-white/10 text-white'
            }`}
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-grow p-3 overflow-y-auto space-y-1 text-xs font-mono">
        {searchTerm ? (
          // Flat search results
          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 mb-2">
              {filteredElements.length} éléments trouvés
            </div>
            {filteredElements.map(el => (
              <div
                key={el.id}
                onClick={() => onSelectElement(el)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                  selectedElement?.id === el.id
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getDisciplineIcon(el.discipline)}
                  <span className="truncate">{el.name}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                  {el.ifcType}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Hierarchical storey grouping
          Array.from(storeysMap.entries()).map(([storeyName, storeyElems]) => {
            const isExpanded = !!expandedNodes[`storey-${storeyName}`];
            return (
              <div key={storeyName} className="space-y-1">
                <button
                  onClick={() => toggleNode(`storey-${storeyName}`)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-slate-300 transition-colors font-bold text-left"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                    <span>Niveau {storeyName}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                    {storeyElems.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pl-6 space-y-1 border-l border-white/5 ml-3">
                    {storeyElems.map(el => (
                      <div
                        key={el.id}
                        onClick={() => onSelectElement(el)}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                          selectedElement?.id === el.id
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold'
                            : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getDisciplineIcon(el.discipline)}
                          <span className="truncate text-[11px]">{el.name}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0">
                          {el.ifcType.replace('Ifc', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
