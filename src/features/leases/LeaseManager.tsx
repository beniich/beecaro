import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Download,
  Mail,
  ShieldCheck,
  X
} from 'lucide-react';
import { LeaseRecord } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';

export const LeaseManager: React.FC = () => {
  const [leases, setLeases] = useState<LeaseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLease, setNewLease] = useState({
    tenantName: '',
    tenantIndustry: 'CleanTech & ESG Consulting',
    contactPerson: '',
    contactEmail: '',
    buildingName: 'Spider Cybernetics Tower A',
    unitCode: 'Suite 310',
    areaSqM: 450,
    monthlyRentUsd: 18500,
    depositUsd: 55500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'active' as const,
    esgClauseCompliant: true,
    paymentStatus: 'paid' as const
  });

  const loadLeases = () => {
    api.getLeases().then(data => {
      if (data && data.length > 0) {
        setLeases(data);
      }
    });
  };

  useEffect(() => {
    loadLeases();
  }, []);

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLease.tenantName.trim()) return;
    const created = await api.createLease(newLease);
    setLeases(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewLease({
      tenantName: '',
      tenantIndustry: 'CleanTech & ESG Consulting',
      contactPerson: '',
      contactEmail: '',
      buildingName: 'Spider Cybernetics Tower A',
      unitCode: 'Suite 310',
      areaSqM: 450,
      monthlyRentUsd: 18500,
      depositUsd: 55500,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'active',
      esgClauseCompliant: true,
      paymentStatus: 'paid'
    });
  };

  const totalMonthlyRevenue = leases.reduce((sum, l) => sum + (Number(l.monthlyRentUsd) || 0), 0);
  const totalLeasedArea = leases.reduce((sum, l) => sum + (Number(l.areaSqM) || 0), 0);

  const filteredLeases = leases.filter(l => 
    (l.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.buildingName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.unitCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.tenantIndustry || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="leases-manager-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-black dark:text-white">Commercial Tenants & Green Leases</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PostgreSQL Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real estate space occupancy, contract expiry horizons, revenue invoicing, and mandatory ESG sustainability clauses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-500">Monthly Contracted Rent: </span>
            <span className="text-emerald-400 font-bold">${totalMonthlyRevenue.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-500">Leased Area: </span>
            <span className="text-cyan-400 font-bold">{totalLeasedArea.toLocaleString()} m²</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-black dark:text-white font-sans font-bold px-3 py-1.5 rounded-xl shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Bail</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenant name, building, unit..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-600 dark:text-slate-300">
            <thead className="bg-white dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Tenant / Industry</th>
                <th className="py-3 px-4">Building & Unit</th>
                <th className="py-3 px-4">Area (m²)</th>
                <th className="py-3 px-4">Term & Expiry</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Green Clause</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLeases.map((lease) => (
                <tr key={lease.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-black dark:text-white">{lease.tenantName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{lease.tenantIndustry}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="text-slate-200">{lease.buildingName}</div>
                    <div className="text-[11px] text-emerald-400">{lease.unitCode}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                    {Number(lease.areaSqM || 0).toLocaleString()} m²
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                    <div>{lease.startDate} →</div>
                    <div className="font-bold text-slate-200">{lease.endDate}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ${Number(lease.monthlyRentUsd || 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {lease.esgClauseCompliant ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px] font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Compliant</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px] font-mono">
                        <AlertCircle className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={lease.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`mailto:${lease.contactEmail || 'contact@tenant.corp'}`}
                      className="inline-flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-emerald-400 font-mono text-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{lease.contactPerson ? lease.contactPerson.split(' ')[0] : 'Contact'}</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lease Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-black dark:text-white">Créer un Contrat de Bail Commercial</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-black dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLease} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Nom du Locataire / Entreprise</label>
                <input
                  type="text"
                  required
                  value={newLease.tenantName}
                  onChange={e => setNewLease({ ...newLease, tenantName: e.target.value })}
                  placeholder="Ex: Quantum Horizon Labs"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Secteur d'Activité</label>
                  <input
                    type="text"
                    value={newLease.tenantIndustry}
                    onChange={e => setNewLease({ ...newLease, tenantIndustry: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Bâtiment & Unité</label>
                  <input
                    type="text"
                    value={newLease.unitCode}
                    onChange={e => setNewLease({ ...newLease, unitCode: e.target.value })}
                    placeholder="Suite 402"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Surface (m²)</label>
                  <input
                    type="number"
                    value={newLease.areaSqM}
                    onChange={e => setNewLease({ ...newLease, areaSqM: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Loyer Mensuel ($)</label>
                  <input
                    type="number"
                    value={newLease.monthlyRentUsd}
                    onChange={e => setNewLease({ ...newLease, monthlyRentUsd: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="esgClause"
                  checked={newLease.esgClauseCompliant}
                  onChange={e => setNewLease({ ...newLease, esgClauseCompliant: e.target.checked })}
                  className="rounded bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-emerald-500"
                />
                <label htmlFor="esgClause" className="text-slate-600 dark:text-slate-600 dark:text-slate-300">Clause Environnementale & ESG Certifiée</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-black dark:text-white font-bold hover:bg-emerald-500"
                >
                  Enregistrer dans PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

