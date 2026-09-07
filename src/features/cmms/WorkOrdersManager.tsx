import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, Filter, Wrench, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, LayoutGrid, List, FileText, Settings, Download,
  Database, Wifi, WifiOff, RefreshCw, Edit3, Plus
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../../services/api';
import { localCache } from '../../services/localCache';
import { WorkOrder } from '../../types';
import { WorkOrderEditModal } from '../../components/WorkOrderEditModal';

interface WorkOrdersManagerProps {
  onOpenCreateModal?: () => void;
  onSelectTicketDetail?: (ticket: any) => void;
  lang?: 'fr' | 'en';
}

export const WorkOrdersManager: React.FC<WorkOrdersManagerProps> = ({
  onOpenCreateModal,
  onSelectTicketDetail,
  lang = 'fr'
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'enterprise'>('enterprise');
  const [rawWorkOrders, setRawWorkOrders] = useState<WorkOrder[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!localCache.isOnline());
  const [cachedCount, setCachedCount] = useState(0);

  // Edit / Procedure Modal State
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadWorkOrders = async () => {
    try {
      const data = await api.getWorkOrders();
      if (Array.isArray(data)) {
        setRawWorkOrders(data);
        const mapped = data.map((t: any) => ({
          id: t.ticketNumber || t.id,
          rawId: t.id,
          rawObject: t,
          desc: t.title || t.description || 'Intervention de maintenance',
          priority: typeof t.priority === 'string' ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
          status: typeof t.status === 'string' ? t.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Open',
          assignee: t.assignedTechnician ? (typeof t.assignedTechnician === 'string' ? t.assignedTechnician : t.assignedTechnician.name) : 'Unassigned',
          due: t.slaDeadline ? new Date(t.slaDeadline).toLocaleDateString() : new Date().toLocaleDateString(),
          asset: t.assetName || t.assetId || 'Équipement Principal',
          category: t.category || 'Maintenance',
          completedAt: t.status === 'closed' || t.status === 'resolved' || t.status === 'completed' ? new Date().toISOString() : null
        }));
        setTickets(mapped);
        setCachedCount(mapped.length);
      }
    } catch (e) {
      console.error('Failed to load work orders:', e);
    }
  };

  useEffect(() => {
    loadWorkOrders();

    const unsub = localCache.subscribe(() => {
      setIsOffline(!localCache.isOnline());
      loadWorkOrders();
    });

    const handleNetChange = () => {
      setIsOffline(!localCache.isOnline());
      loadWorkOrders();
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
      await loadWorkOrders();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenEdit = (ticket: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Find the original full WorkOrder object
    const target = rawWorkOrders.find(w => w.id === ticket.rawId || w.id === ticket.id || w.ticketNumber === ticket.id) || ticket.rawObject;
    if (target) {
      setEditingWorkOrder(target);
      setIsEditModalOpen(true);
    } else {
      // Fallback
      setEditingWorkOrder({
        id: ticket.rawId || ticket.id,
        ticketNumber: ticket.id,
        title: ticket.desc,
        description: ticket.desc,
        priority: (ticket.priority || 'medium').toLowerCase(),
        status: (ticket.status || 'open').toLowerCase().replace(' ', '_'),
        category: (ticket.category || 'preventive').toLowerCase(),
        buildingId: 'bld-01',
        buildingName: 'Spider Cybernetics Tower A',
        floor: 'Floor 1',
        assignedTechnician: {
          name: ticket.assignee,
          role: 'Technicien de Maintenance',
          avatar: ''
        },
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        slaDeadline: ticket.due || new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 16),
        estimatedHours: 3.5
      });
      setIsEditModalOpen(true);
    }
  };

  const handleWorkOrderUpdated = (updatedWo: WorkOrder) => {
    setRawWorkOrders(prev => prev.map(w => (w.id === updatedWo.id || w.ticketNumber === updatedWo.ticketNumber ? updatedWo : w)));
    loadWorkOrders();
  };

  const generatePDFReport = (ticket: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.text('INTERVENTION REPORT', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    // Status Badge Simulation
    doc.setDrawColor(22, 163, 74); // Emerald
    doc.setFillColor(220, 252, 231); // Light Emerald
    doc.rect(160, 14, 35, 10, 'FD');
    doc.setTextColor(21, 128, 61);
    doc.text('VALIDATED', 165, 21);

    // Ticket Details
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text(`Work Order: ${ticket.id}`, 14, 45);
    
    autoTable(doc, {
      startY: 55,
      head: [['Field', 'Details']],
      body: [
        ['Description', ticket.desc],
        ['Asset ID', ticket.asset],
        ['Category', ticket.category || 'N/A'],
        ['Priority', ticket.priority],
        ['Assigned Technician', ticket.assignee],
        ['Target Date', ticket.due],
        ['Status', ticket.status],
        ['Completion Date', ticket.completedAt || 'Pending'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175] }
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.text('Technician Signature:', 14, finalY + 30);
    doc.line(14, finalY + 45, 80, finalY + 45);
    
    doc.text('Super Admin Validation:', 120, finalY + 30);
    doc.line(120, finalY + 45, 190, finalY + 45);

    doc.save(`Report_${ticket.id}.pdf`);
  };

  return (
    <div id="cmms-manager-view" className="space-y-4 animate-in fade-in duration-300">
      
      {/* Enterprise Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-600 p-2 text-black dark:text-white shadow-lg">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-black dark:text-white tracking-tight uppercase">
                Enterprise Work Order Management
              </h2>
              <span className="bg-amber-900/50 text-amber-400 text-[10px] px-2 py-0.5 border border-amber-700 uppercase tracking-widest font-mono font-bold">
                MAXIMO CMMS ENGINE
              </span>
              {/* Offline / Cache status badge */}
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                isOffline 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Database className="w-3 h-3 text-emerald-400" />}
                {isOffline ? 'Cache Local Actif' : 'IndexedDB Sync'} ({cachedCount} OTs)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Work Tasks, Preventative Maintenance (PM) Generation, and Resource Balancing
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
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 border transition-colors ${viewMode === 'cards' ? 'bg-amber-600 border-amber-500 text-black dark:text-white' : 'bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('enterprise')}
            className={`p-1.5 border transition-colors ${viewMode === 'enterprise' ? 'bg-amber-600 border-amber-500 text-black dark:text-white' : 'bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-2" />
          <button 
            onClick={onOpenCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-black dark:text-white px-3 py-1.5 text-xs font-bold font-mono border border-emerald-500 flex items-center gap-1"
          >
            + CREATE WO
          </button>
        </div>
      </div>

      {viewMode === 'enterprise' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start h-[calc(100vh-200px)]">
          {/* Left Column: Job Plans & PMs */}
          <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
            <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase">PM Schedules & Job Plans</span>
              <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="p-2 space-y-2 font-mono text-[10px]">
              {['Monthly HVAC Insp.', 'Quarterly Fire Test', 'Weekly Generator Run', 'Annual Thermography', 'Daily Cleaning Log'].map((pm, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="text-black dark:text-white">{pm}</span>
                  </div>
                  <span className="text-emerald-400">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Dense Data Grid */}
          <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-full flex flex-col">
            <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase">Work Task Execution Registry</span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse text-[11px] font-mono whitespace-nowrap">
                <thead className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">WO Number</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Priority</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Asset</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Assignee</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Target Date</th>
                    <th className="px-3 py-2 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300">
                  {tickets.map((t, i) => (
                    <tr 
                      key={i} 
                      className="hover:bg-amber-900/20 cursor-pointer transition-colors group"
                      onClick={() => handleOpenEdit(t)}
                    >
                      <td className="px-3 py-2 text-amber-400 font-bold flex items-center gap-1.5">
                        <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity" />
                        {t.id}
                      </td>
                      <td className="px-3 py-2 text-black dark:text-white font-sans font-medium">{t.desc}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                          t.priority === 'Critical' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                          t.priority === 'High' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                          'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                          t.status === 'Completed' || t.status === 'Resolved' || t.status === 'Closed'
                            ? 'bg-emerald-900/30 text-emerald-300 border-emerald-600'
                            : t.status === 'In Progress'
                              ? 'bg-blue-900/30 text-blue-300 border-blue-600'
                              : 'bg-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300 border-slate-600'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-blue-300">{t.asset}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-600 dark:text-slate-300">{t.assignee}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{t.due}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleOpenEdit(t, e)}
                            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded text-[10px] font-bold transition-all shadow-sm shadow-amber-500/20"
                            title="Modifier ce ticket et sa procédure d'intervention"
                          >
                            <Edit3 className="w-3 h-3" /> Modifier
                          </button>
                          {t.status !== 'Completed' && t.status !== 'Closed' && t.status !== 'Resolved' && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const targetId = t.rawId || t.id;
                                await api.updateWorkOrderStatus(targetId, 'resolved');
                                setTickets(prev => prev.map(item => (item.id === t.id || item.rawId === targetId) ? { ...item, status: 'Resolved', completedAt: new Date().toISOString() } : item));
                              }}
                              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                              title="Valider l'intervention"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Valider
                            </button>
                          )}
                          <button 
                            onClick={(e) => generatePDFReport(t, e)}
                            className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                            title="Télécharger le Rapport PDF"
                          >
                            <Download className="w-3 h-3 text-emerald-400" /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VISUAL CARDS FALLBACK */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tickets.map((t, i) => (
            <div 
              key={i} 
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between cursor-pointer hover:border-amber-500/50 relative group transition-all"
              onClick={() => handleOpenEdit(t)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">{t.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase border font-mono ${
                      t.priority === 'Critical' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                      t.priority === 'High' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                      'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <h3 className="text-sm text-black dark:text-white font-bold mt-1 group-hover:text-amber-300 transition-colors">{t.desc}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleOpenEdit(t, e)}
                    className="p-1.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1 text-[10px] font-mono"
                    title="Modifier ce ticket"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button
                    onClick={(e) => generatePDFReport(t, e)}
                    className="p-1.5 bg-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 text-[10px] font-mono"
                    title="Télécharger le Rapport PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> PDF
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="text-blue-400">{t.asset}</span>
                <span>{t.assignee}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Work Order Modification Procedure Modal */}
      <WorkOrderEditModal
        isOpen={isEditModalOpen}
        workOrder={editingWorkOrder}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={handleWorkOrderUpdated}
        lang={lang}
      />
    </div>
  );
};

