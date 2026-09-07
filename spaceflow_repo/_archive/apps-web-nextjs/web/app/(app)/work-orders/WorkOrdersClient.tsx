"use client";

import { useState } from 'react';
import { createWorkOrder, updateWorkOrderStatus } from '@/app/actions/workOrder.actions';
import { Plus, CheckCircle2, Clock, AlertTriangle, Search, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type WorkOrder = any;
type AssetOption = { id: string, name: string, code: string };

export default function WorkOrdersClient({ 
  initialWorkOrders, 
  availableAssets 
}: { 
  initialWorkOrders: WorkOrder[],
  availableAssets: AssetOption[]
}) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // FormData for Server Action
  async function handleCreateAction(formData: FormData) {
    setIsLoading(true);
    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const priority = formData.get('priority') as any;
      const assetId = formData.get('assetId') as string;

      const newWo = await createWorkOrder({
        title,
        description,
        priority,
        assetId: assetId || undefined,
        status: 'PENDING'
      });
      
      // Update local state for immediate feedback
      setWorkOrders([newWo, ...workOrders]);
      setIsCreating(false);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: any) {
    try {
      await updateWorkOrderStatus(id, newStatus);
      // Optimistic update
      setWorkOrders(workOrders.map(wo => wo.id === id ? { ...wo, status: newStatus } : wo));
      if (selectedWO?.id === id) {
        setSelectedWO({ ...selectedWO, status: newStatus });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const filteredWOs = workOrders.filter(wo => 
    wo.title?.toLowerCase().includes(search.toLowerCase()) || 
    wo.asset?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-full bg-zinc-950 overflow-hidden text-zinc-100 font-sans p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display uppercase text-zinc-50 flex items-center gap-3">
            Interventions (Work Orders)
            <span className="text-xs font-mono px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded normal-case">
              Server Actions
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsCreating(true); setSelectedWO(null); }}
            className="flex items-center gap-2 bg-brand-cyan text-black px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold hover:bg-cyan-400 transition-all rounded shadow-[0_0_15px_rgba(0,219,231,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Créer
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1">
        
        {/* Left Side: List */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/60 shadow-lg flex flex-col flex-1 overflow-hidden h-[700px]">
            <div className="p-5 border-b border-zinc-800/40">
              <div className="relative max-w-sm">
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
              {filteredWOs.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">Aucune intervention.</div>
              ) : (
                filteredWOs.map(wo => (
                  <div
                    key={wo.id}
                    onClick={() => { setSelectedWO(wo); setIsCreating(false); }}
                    className={clsx(
                      "p-4 rounded-lg cursor-pointer transition-colors border flex flex-col gap-2",
                      selectedWO?.id === wo.id 
                        ? "bg-zinc-800 border-zinc-700" 
                        : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-sm">{wo.title}</div>
                      <span className={clsx(
                        "text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-mono shrink-0 ml-2",
                        wo.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        wo.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        wo.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-zinc-800 text-zinc-400'
                      )}>
                        {wo.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-mono">{wo.asset?.name || 'Sans équipement'}</span>
                      <span className="flex items-center gap-1">
                        {wo.priority === 'CRITICAL' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                        {wo.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Form or Details */}
        <div className="w-full lg:w-[450px] shrink-0 bg-zinc-900/80 border border-zinc-800/60 shadow-2xl rounded-xl overflow-hidden flex flex-col h-[700px]">
          
          {isCreating ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-zinc-800 bg-zinc-950">
                <h3 className="text-xl font-bold tracking-tight text-brand-cyan">Nouvelle Intervention</h3>
                <p className="text-xs text-zinc-500 mt-1">Formulaire Server Actions (Zero JS submission)</p>
              </div>
              <form action={handleCreateAction} className="p-6 flex-1 overflow-y-auto space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase">Titre</label>
                  <input required name="title" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-brand-cyan focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase">Description</label>
                  <textarea name="description" rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-brand-cyan focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase">Priorité</label>
                  <select name="priority" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-brand-cyan focus:outline-none text-zinc-300">
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase">Équipement associé</label>
                  <select name="assetId" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:border-brand-cyan focus:outline-none text-zinc-300">
                    <option value="">-- Aucun équipement --</option>
                    {availableAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-6">
                  <button disabled={isLoading} type="submit" className="w-full bg-brand-cyan text-black font-bold font-mono text-sm uppercase py-3 rounded hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer l\'intervention'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedWO ? (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-zinc-800 bg-zinc-950">
                <span className={clsx(
                  "font-mono text-[10px] border px-2 py-0.5 rounded uppercase mb-3 inline-block font-bold tracking-widest",
                  selectedWO.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                  selectedWO.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                  'bg-zinc-800 text-zinc-400 border-zinc-700'
                )}>
                  Priorité {selectedWO.priority}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-zinc-100">{selectedWO.title}</h3>
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1"><Clock className="w-3 h-3"/> Créé le {new Date(selectedWO.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                
                <div>
                  <div className="text-xs text-zinc-500 uppercase font-mono mb-2">Description</div>
                  <div className="text-sm text-zinc-300 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                    {selectedWO.description || 'Aucune description fournie.'}
                  </div>
                </div>

                {selectedWO.asset && (
                  <div>
                    <div className="text-xs text-zinc-500 uppercase font-mono mb-2">Équipement Concerne</div>
                    <div className="text-sm text-brand-cyan bg-cyan-950/20 p-3 rounded border border-cyan-900/30 font-mono">
                      {selectedWO.asset.code} - {selectedWO.asset.name}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-800">
                  <div className="text-xs text-zinc-500 uppercase font-mono mb-4">Mettre à jour le statut</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleStatusChange(selectedWO.id, 'IN_PROGRESS')}
                      disabled={selectedWO.status === 'IN_PROGRESS'}
                      className="py-2 text-xs font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded disabled:opacity-50"
                    >
                      En cours
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedWO.id, 'COMPLETED')}
                      disabled={selectedWO.status === 'COMPLETED'}
                      className="py-2 text-xs font-mono uppercase bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded disabled:opacity-50"
                    >
                      Terminer
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
              Sélectionnez une intervention ou créez-en une
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
