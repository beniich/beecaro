import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { UseWorkOrderReturn } from '../hooks/useWorkOrder';

export const PartsTab: React.FC<{ wo: UseWorkOrderReturn }> = ({ wo }) => {
  const [part, setPart] = useState({ name: '', quantity: 1, cost: 50, partNumber: '' });

  const total = wo.partsUsed.reduce((sum, p) => sum + (p.cost * p.quantity), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!part.name.trim()) return;
    wo.addPart(part);
    setPart({ name: '', quantity: 1, cost: 50, partNumber: '' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
        <span className="text-xs text-slate-600 dark:text-slate-300">Total des pièces et consommables alloués :</span>
        <span className="font-bold text-sm text-emerald-400">{total} €</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 font-mono">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase">
            <tr>
              <th className="px-3.5 py-2.5">Référence</th>
              <th className="px-3.5 py-2.5">Désignation</th>
              <th className="px-3.5 py-2.5">Quantité</th>
              <th className="px-3.5 py-2.5">PU</th>
              <th className="px-3.5 py-2.5">Sous-Total</th>
              <th className="px-3.5 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-600 dark:text-slate-300">
            {wo.partsUsed.map((p, i) => (
              <tr key={i} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                <td className="px-3.5 py-2 text-amber-400 font-bold">{p.partNumber || '-'}</td>
                <td className="px-3.5 py-2 text-black dark:text-white font-medium">{p.name}</td>
                <td className="px-3.5 py-2">{p.quantity}</td>
                <td className="px-3.5 py-2">{p.cost} €</td>
                <td className="px-3.5 py-2 font-bold text-emerald-400">{p.cost * p.quantity} €</td>
                <td className="px-3.5 py-2 text-right">
                  <button 
                    type="button"
                    onClick={() => wo.deletePart(i)} 
                    className="p-1 text-slate-500 dark:text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {wo.partsUsed.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3.5 py-4 text-center text-slate-500 dark:text-slate-500 italic">
                  Aucune pièce enregistrée pour cette intervention.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono">
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block uppercase">Ajouter une Pièce de Rechange</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input 
            type="text" 
            value={part.partNumber} 
            onChange={(e) => setPart({ ...part, partNumber: e.target.value })} 
            placeholder="Réf (ex: JT-904)" 
            className="form-input" 
          />
          <input 
            type="text" 
            value={part.name} 
            onChange={(e) => setPart({ ...part, name: e.target.value })} 
            placeholder="Désignation pièce..." 
            className="form-input" 
          />
          <input 
            type="number" 
            min="1" 
            value={part.quantity} 
            onChange={(e) => setPart({ ...part, quantity: Number(e.target.value) })} 
            placeholder="Qté" 
            className="form-input" 
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              min="0" 
              value={part.cost} 
              onChange={(e) => setPart({ ...part, cost: Number(e.target.value) })} 
              placeholder="Prix €" 
              className="w-full form-input" 
            />
            <button 
              type="submit" 
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg shrink-0 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
