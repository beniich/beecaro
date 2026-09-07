import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, Plus, Edit2, Trash2, Shield, Wrench, Search, Building2, Phone, Mail, User, X
} from 'lucide-react';

interface Props {
  lang: 'fr' | 'en';
  isLightMode: boolean;
}

export const IntervenantsPanel: React.FC<Props> = ({ lang, isLightMode }) => {
  const [intervenants, setIntervenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntervenant, setEditingIntervenant] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    type: 'internal', // internal or subcontractor
    email: '',
    phone: '',
    role: '',
    specialties: '',
    hourlyRateEur: 0,
  });

  const loadIntervenants = async () => {
    setLoading(true);
    try {
      const data = await api.getIntervenants();
      setIntervenants(data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadIntervenants();
  }, []);

  const openAddModal = () => {
    setEditingIntervenant(null);
    setFormData({
      name: '',
      company: '',
      type: 'internal',
      email: '',
      phone: '',
      role: '',
      specialties: '',
      hourlyRateEur: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (intervenant: any) => {
    setEditingIntervenant(intervenant);
    setFormData({
      name: intervenant.name || '',
      company: intervenant.company || '',
      type: intervenant.type || 'internal',
      email: intervenant.email || '',
      phone: intervenant.phone || '',
      role: intervenant.role || '',
      specialties: Array.isArray(intervenant.specialties) ? intervenant.specialties.join(', ') : (intervenant.specialties || ''),
      hourlyRateEur: intervenant.hourlyRateEur || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm(lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet intervenant ?' : 'Are you sure you want to delete this operator?')) {
      await api.deleteIntervenant(id);
      loadIntervenants();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (editingIntervenant && editingIntervenant.id) {
      await api.updateIntervenant(editingIntervenant.id, payload);
    } else {
      await api.createIntervenant(payload);
    }
    setIsModalOpen(false);
    loadIntervenants();
  };

  const filtered = intervenants.filter(i => 
    i.name?.toLowerCase().includes(search.toLowerCase()) || 
    i.company?.toLowerCase().includes(search.toLowerCase()) ||
    i.specialties?.some?.((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            {lang === 'fr' ? 'Gestion des Intervenants' : 'Field Operators Management'}
          </h1>
          <p className="text-sm opacity-60 mt-1">
            {lang === 'fr' ? 'Ajoutez et gérez vos techniciens internes et prestataires externes.' : 'Add and manage your internal technicians and external subcontractors.'}
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          {lang === 'fr' ? 'Ajouter un intervenant' : 'Add Operator'}
        </button>
      </div>

      <div className="bg-white/5 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input 
              type="text" 
              placeholder={lang === 'fr' ? 'Rechercher un nom, une entreprise, une spécialité...' : 'Search name, company, specialty...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Intervenant' : 'Operator'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Type' : 'Type'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Contact' : 'Contact'}</th>
                <th className="px-6 py-4 font-semibold">{lang === 'fr' ? 'Spécialités' : 'Specialties'}</th>
                <th className="px-6 py-4 font-semibold text-right">{lang === 'fr' ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center opacity-50">
                    {lang === 'fr' ? 'Chargement...' : 'Loading...'}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center opacity-50">
                    {lang === 'fr' ? 'Aucun intervenant trouvé.' : 'No operators found.'}
                  </td>
                </tr>
              ) : filtered.map((i, idx) => (
                <tr key={i.id || idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-300 dark:border-slate-700">
                        {i.avatar ? (
                          <img src={i.avatar} alt={i.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 opacity-50" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold">{i.name}</div>
                        <div className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {i.company || 'Interne'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {i.type === 'subcontractor' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <Wrench className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Prestataire' : 'Subcontractor'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Shield className="w-3.5 h-3.5" /> {lang === 'fr' ? 'Interne' : 'Internal'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs opacity-80">
                      {i.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {i.phone}</div>}
                      {i.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {i.email}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(i.specialties) ? i.specialties.map((s: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s}
                        </span>
                      )) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(i)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                        title={lang === 'fr' ? 'Modifier' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(i.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                        title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg">
                {editingIntervenant 
                  ? (lang === 'fr' ? 'Modifier l\'intervenant' : 'Edit Operator') 
                  : (lang === 'fr' ? 'Ajouter un intervenant' : 'Add Operator')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{lang === 'fr' ? 'Type' : 'Type'}</label>
                  <select 
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="internal">{lang === 'fr' ? 'Technicien Interne' : 'Internal Technician'}</option>
                    <option value="subcontractor">{lang === 'fr' ? 'Prestataire Externe' : 'External Subcontractor'}</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{lang === 'fr' ? 'Nom complet' : 'Full Name'}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{lang === 'fr' ? 'Entreprise' : 'Company'}</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    placeholder={formData.type === 'internal' ? 'BeeCarbonat Maintenance' : ''}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{lang === 'fr' ? 'Rôle / Titre' : 'Role / Title'}</label>
                  <input 
                    type="text" 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">{lang === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">{lang === 'fr' ? 'Spécialités (séparées par des virgules)' : 'Specialties (comma separated)'}</label>
                  <input 
                    type="text" 
                    value={formData.specialties}
                    onChange={e => setFormData({...formData, specialties: e.target.value})}
                    placeholder="HVAC, Électricité, Plomberie..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-slate-200 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                >
                  {lang === 'fr' ? 'Enregistrer' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
