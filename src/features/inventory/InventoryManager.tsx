import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  CheckCircle2, 
  FileText,
  Boxes,
  Barcode
} from 'lucide-react';

interface InventoryManagerProps {
  lang?: 'fr' | 'en';
}

interface InventoryItem {
  id: string;
  name: string;
  reference: string;
  category: 'HVAC' | 'Electrical' | 'Plumbing' | 'Elevator' | 'Sensors';
  quantity: number;
  minQuantity: number;
  unit: string;
  unitCostUsd: number;
  location: string;
}

const initialInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Filtre plissé F7 (610x610x292)', reference: 'FLT-F7-610', category: 'HVAC', quantity: 4, minQuantity: 10, unit: 'pcs', unitCostUsd: 45.0, location: 'Magasin Central A - Rayon 02' },
  { id: 'inv-2', name: 'Disjoncteur différentiel 4P 63A 30mA', reference: 'DISJ-63A-4P', category: 'Electrical', quantity: 12, minQuantity: 5, unit: 'pcs', unitCostUsd: 85.0, location: 'Atelier Élec B - Tiroir 14' },
  { id: 'inv-3', name: 'Garniture mécanique pompe PC-02 (28mm)', reference: 'GARN-MEC-28', category: 'Plumbing', quantity: 2, minQuantity: 4, unit: 'pcs', unitCostUsd: 120.0, location: 'Magasin A - Bac 08' },
  { id: 'inv-4', name: 'Sonde de température immersion PT1000', reference: 'SND-PT1000', category: 'Sensors', quantity: 18, minQuantity: 8, unit: 'pcs', unitCostUsd: 32.5, location: 'Laboratoire IoT' },
  { id: 'inv-5', name: 'Huile réducteur ascenseur ISO VG 220', reference: 'OIL-VG-220', category: 'Elevator', quantity: 60, minQuantity: 30, unit: 'liters', unitCostUsd: 14.0, location: 'Local Huiles R-1' },
  { id: 'inv-6', name: 'Contacteur Schneider LC1D25P7', reference: 'CONT-LC1D25', category: 'Electrical', quantity: 8, minQuantity: 6, unit: 'pcs', unitCostUsd: 58.0, location: 'Atelier Élec B' },
];

export const InventoryManager: React.FC<InventoryManagerProps> = ({ lang = 'fr' }) => {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    reference: '',
    category: 'HVAC',
    quantity: 10,
    minQuantity: 5,
    unit: 'pcs',
    unitCostUsd: 25,
    location: 'Magasin Central A'
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdjustQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.reference) return;

    const created: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItem.name || 'Pièce détachée',
      reference: newItem.reference || 'REF-CUSTOM',
      category: (newItem.category as any) || 'HVAC',
      quantity: Number(newItem.quantity) || 1,
      minQuantity: Number(newItem.minQuantity) || 5,
      unit: newItem.unit || 'pcs',
      unitCostUsd: Number(newItem.unitCostUsd) || 0,
      location: newItem.location || 'Magasin A'
    };

    setItems([created, ...items]);
    setShowAddModal(false);
    setNewItem({
      name: '',
      reference: '',
      category: 'HVAC',
      quantity: 10,
      minQuantity: 5,
      unit: 'pcs',
      unitCostUsd: 25,
      location: 'Magasin Central A'
    });
  };

  const lowStockCount = items.filter(i => i.quantity <= i.minQuantity).length;
  const totalStockValue = items.reduce((acc, i) => acc + (i.quantity * i.unitCostUsd), 0);

  return (
    <div id="inventory-manager-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-950/40">
            <Boxes className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-2">
              {lang === 'fr' ? 'Gestion des Stocks & Pièces de Rechange' : 'Inventory & Spare Parts Management'}
              {lowStockCount > 0 && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {lang === 'fr' ? `${lowStockCount} Alertes Réappro` : `${lowStockCount} Low Stock`}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {lang === 'fr'
                ? 'Suivi des seuils critiques, codes-barres, coûts unitaires et affectation aux ordres GMAO'
                : 'Stock threshold monitoring, barcode references, unit valuations and CMMS order allocation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'fr' ? 'Nouvelle Référence' : 'Add Spare Part'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Références Actives</span>
          <div className="text-2xl font-black text-black dark:text-white mt-1">{items.length}</div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Répertoriées</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Valeur du Stock</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Inventaire valorisé</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Seuils Critiques Atteints</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{lowStockCount}</div>
          <span className="text-[10px] text-rose-300 font-mono">Commande auto suggérée</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">Taux de Disponibilité</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">96.8%</div>
          <span className="text-[10px] text-cyan-300 font-mono">SLA Maintenance Préventive</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'fr' ? 'Rechercher référence, nom, rayon...' : 'Search part name, code, location...'}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'HVAC', 'Electrical', 'Plumbing', 'Elevator', 'Sensors'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-black dark:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Référence / Article</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Emplacement</th>
                <th className="py-3 px-4">Prix Unitaire</th>
                <th className="py-3 px-4">Quantité en Stock</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minQuantity;
                return (
                  <tr key={item.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-black dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                        <Barcode className="w-3 h-3 text-slate-500 dark:text-slate-500" />
                        <span>{item.reference}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-600 dark:text-slate-300 font-mono">{item.location}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-black dark:text-white">${item.unitCostUsd.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className={`text-sm font-black ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-500">(Min: {item.minQuantity})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[10px] font-bold">
                          Réappro requis
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleAdjustQuantity(item.id, -1)}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-black dark:text-white border border-slate-200 dark:border-slate-700 transition-colors text-xs font-mono"
                          title="Décrémenter (-1)"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjustQuantity(item.id, 1)}
                          className="p-1 rounded bg-slate-800 hover:bg-emerald-900/60 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-black dark:text-white border border-slate-200 dark:border-slate-700 transition-colors text-xs font-mono"
                          title="Incrémenter (+1)"
                        >
                          +1
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider font-mono">
              {lang === 'fr' ? 'Ajouter une Pièce Détachée' : 'Add New Spare Part'}
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Désignation :</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="ex: Vanne d'équilibrage DN50"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Référence / Code :</label>
                  <input
                    type="text"
                    required
                    value={newItem.reference}
                    onChange={(e) => setNewItem({ ...newItem, reference: e.target.value })}
                    placeholder="VAN-DN50-B"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Catégorie :</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Elevator">Elevator</option>
                    <option value="Sensors">Sensors</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Quantité :</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Seuil Min :</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minQuantity}
                    onChange={(e) => setNewItem({ ...newItem, minQuantity: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Coût Unit ($) :</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItem.unitCostUsd}
                    onChange={(e) => setNewItem({ ...newItem, unitCostUsd: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">Emplacement Magasin :</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  placeholder="Magasin Central - Étagère C3"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-black dark:text-white bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white font-semibold"
                >
                  Enregistrer l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
