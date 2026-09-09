import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Search, Filter, Wrench, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, LayoutGrid, List, FileText, Settings, Download,
  Database, Wifi, WifiOff, RefreshCw, Edit3, Plus, Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');

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

  const handleDeleteWorkOrder = async (ticket: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetId = ticket.rawId || ticket.id;
    try {
      await api.deleteWorkOrder(targetId);
      // Immediately remove from the visual list triggering the framer motion exit animation
      setTickets(prev => prev.filter(item => item.id !== ticket.id && item.rawId !== targetId));
      setCachedCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete work order:', err);
    }
  };

  const handleMarkAsCompleted = async (ticket: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetId = ticket.rawId || ticket.id;
    try {
      await api.updateWorkOrderStatus(targetId, 'resolved');
      setTickets(prev => prev.map(item => 
        (item.id === ticket.id || item.rawId === targetId) 
          ? { ...item, status: 'Resolved', completedAt: new Date().toISOString() } 
          : item
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const generatePDFReport = (ticket: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('INTERVENTION REPORT', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    // Status Badge Simulation
    doc.rect(160, 14, 35, 10, 'FD');
    doc.text('VALIDATED', 165, 21);

    // Ticket Details
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
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.text('Technician Signature:', 14, finalY + 30);
    doc.line(14, finalY + 45, 80, finalY + 45);
    
    doc.text('Super Admin Validation:', 120, finalY + 30);
    doc.line(120, finalY + 45, 190, finalY + 45);

    doc.save(`Report_${ticket.id}.pdf`);
  };

  // Perform client-side searching & filtering
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchTerm.toLowerCase());

    const isDone = t.status === 'Completed' || t.status === 'Resolved' || t.status === 'Closed';

    if (statusFilter === 'active') {
      return matchesSearch && !isDone;
    }
    if (statusFilter === 'completed') {
      return matchesSearch && isDone;
    }
    return matchesSearch;
  });

  return (
    <div id="cmms-manager-view" className="work-orders-manager space-y-4 animate-in fade-in duration-300">
      
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
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-300 hover:text-white transition-colors"
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

      {/* Advanced Search and Filter Ribbon */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'fr' ? "Rechercher un ticket..." : "Search tickets..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded font-mono"
          />
        </div>
        
        <div className="flex items-center gap-2 font-mono text-[11px] w-full sm:w-auto justify-end">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            {lang === 'fr' ? "Filtrer :" : "Filter :"}
          </span>
          <div className="flex bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-0.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-600 text-black dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {lang === 'fr' ? "Tous" : "All"}
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                statusFilter === 'active'
                  ? 'bg-amber-600 text-black dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {lang === 'fr' ? "En cours" : "Active"}
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                statusFilter === 'completed'
                  ? 'bg-amber-600 text-black dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {lang === 'fr' ? "Validés" : "Completed"}
            </button>
          </div>
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
              <span className="text-[10px] font-mono text-slate-400">
                {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
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
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <AnimatePresence initial={false}>
                    {filteredTickets.map((t) => (
                      <motion.tr 
                        key={t.id} 
                        initial={{ opacity: 1, x: 0 }}
                        exit={{ 
                          opacity: 0, 
                          x: -30,
                          transition: { duration: 0.25, ease: 'easeOut' }
                        }}
                        layout
                        className="hover:bg-amber-500/10 dark:hover:bg-amber-900/20 cursor-pointer transition-colors group"
                        onClick={() => handleOpenEdit(t)}
                      >
                        <td className="px-3 py-2 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                          <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-600 dark:text-amber-400 transition-opacity" />
                          {t.id}
                        </td>
                        <td className="px-3 py-2 text-slate-800 dark:text-slate-200 font-sans font-medium whitespace-normal max-w-xs">{t.desc}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                            t.priority === 'Critical' ? 'bg-red-500/10 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-500/30' :
                            t.priority === 'High' ? 'bg-amber-500/10 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                            'bg-emerald-500/10 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                            t.status === 'Completed' || t.status === 'Resolved' || t.status === 'Closed'
                              ? 'bg-emerald-500/10 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                              : t.status === 'In Progress'
                                ? 'bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-500/40'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{t.asset}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{t.assignee}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{t.due}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => handleOpenEdit(t, e)}
                              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded text-[10px] font-bold transition-all shadow-sm"
                              title={lang === 'fr' ? "Modifier" : "Edit"}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {t.status !== 'Completed' && t.status !== 'Closed' && t.status !== 'Resolved' && (
                              <button
                                onClick={(e) => handleMarkAsCompleted(t, e)}
                                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 transition-colors"
                                title={lang === 'fr' ? "Valider l'intervention" : "Approve Work"}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => generatePDFReport(t, e)}
                              className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 transition-colors"
                              title="Report PDF"
                            >
                              <Download className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteWorkOrder(t, e)}
                              className="inline-flex items-center gap-1 bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white px-2 py-1 rounded border border-red-500/20 transition-all"
                              title={lang === 'fr' ? "Supprimer l'intervention" : "Delete"}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VISUAL CARDS FALLBACK WITH SLIDE-OUT TRANSITION */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence initial={false}>
            {filteredTickets.map((t) => (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.95, 
                  x: 40,
                  transition: { duration: 0.25, ease: 'easeOut' }
                }}
                layout
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between cursor-pointer hover:border-amber-500/50 relative group transition-all"
                onClick={() => handleOpenEdit(t)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
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
                    <h3 className="text-sm text-black dark:text-white font-bold group-hover:text-amber-300 transition-colors">{t.desc}</h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                    {t.status !== 'Completed' && t.status !== 'Closed' && t.status !== 'Resolved' && (
                      <button
                        onClick={(e) => handleMarkAsCompleted(t, e)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors"
                        title={lang === 'fr' ? "Valider l'intervention" : "Complete Work"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleOpenEdit(t, e)}
                      className="p-1.5 bg-amber-500 text-black font-bold rounded hover:bg-amber-400 transition-colors"
                      title={lang === 'fr' ? "Modifier" : "Edit"}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => generatePDFReport(t, e)}
                      className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 border border-slate-700 transition-colors"
                      title="PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteWorkOrder(t, e)}
                      className="p-1.5 bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white rounded transition-colors"
                      title={lang === 'fr' ? "Supprimer" : "Delete"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="text-blue-400">{t.asset}</span>
                  <span>{t.assignee}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
