import React, { useState } from 'react';
import { UseWorkOrderReturn } from '../hooks/useWorkOrder';
import { 
  UserCheck, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  PlusCircle, 
  Wrench,
  Sparkles
} from 'lucide-react';

interface GeneralTabProps {
  wo: UseWorkOrderReturn;
}

const SectionHeader = ({ icon: Icon, title, badge }: { icon: any; title: string; badge?: string }) => (
  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
    <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
      <Icon className="w-4 h-4 text-amber-500" />
      <span>{title}</span>
    </div>
    {badge && (
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
        {badge}
      </span>
    )}
  </div>
);

const Field = ({ label, children, fullWidth = false, required = false }: { label: string; children: React.ReactNode; fullWidth?: boolean; required?: boolean }) => (
  <div className={fullWidth ? 'col-span-full' : ''}>
    <label className="block text-slate-600 dark:text-slate-400 mb-1 text-xs font-mono font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export const GeneralTab: React.FC<GeneralTabProps> = ({ wo }) => {
  const [customIntervenantMode, setCustomIntervenantMode] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* ── Section 1: Informations Générales du Ticket ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
        <SectionHeader icon={Wrench} title="Paramètres Généraux du Ticket" badge={`OT: ${wo.data.ticketNumber || wo.data.id}`} />
        
        <Field label="Titre du Ticket / Objet de l'intervention" fullWidth required>
          <input
            type="text"
            value={wo.data.title}
            onChange={(e) => wo.setTitle(e.target.value)}
            placeholder="Ex: Remplacement du compresseur frigorifique et vérification étanchéité"
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          <Field label="Niveau de Priorité" required>
            <select 
              value={wo.data.priority} 
              onChange={(e) => wo.setPriority(e.target.value as any)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="low">🟢 Faible (Low)</option>
              <option value="medium">🔵 Moyenne (Medium)</option>
              <option value="high">🟠 Élevée (High)</option>
              <option value="critical">🔴 Critique (Urgence Immédiate)</option>
            </select>
          </Field>

          <Field label="Statut du Ticket">
            <select 
              value={wo.data.status} 
              onChange={(e) => wo.setStatus(e.target.value as any)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500"
            >
              <option value="open">Ouvert / À planifier</option>
              <option value="in_progress">En cours d'intervention</option>
              <option value="pending_parts">En attente pièces / Devis</option>
              <option value="resolved">Résolu / À valider</option>
              <option value="closed">Clôturé & Validé</option>
            </select>
          </Field>

          <Field label="Catégorie GMAO">
            <select 
              value={wo.data.category} 
              onChange={(e) => wo.setCategory(e.target.value as any)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="preventive">Maintenance Préventive (PM)</option>
              <option value="corrective">Maintenance Corrective</option>
              <option value="inspection">Contrôle / Diagnostic</option>
              <option value="emergency">Dépannage d'Urgence</option>
              <option value="esg_audit">Audit ESG & Efficience</option>
            </select>
          </Field>

          <Field label="Échéance SLA Cible">
            <input 
              type="date" 
              value={wo.data.slaDeadline ? wo.data.slaDeadline.slice(0, 10) : ''} 
              onChange={(e) => wo.setSlaDeadline(e.target.value)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>
        </div>
      </div>

      {/* ── Section 2: Modification de l'Intervenant & Prestataire ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-amber-500/30 dark:border-amber-500/20 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-amber-500" />
            <span>Intervenant & Technicien Assigné</span>
          </div>
          <button
            type="button"
            onClick={() => setCustomIntervenantMode(!customIntervenantMode)}
            className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            {customIntervenantMode ? '← Choisir parmi l\'équipe / prestataires' : '+ Saisir un intervenant externe / personnalisé'}
          </button>
        </div>

        {!customIntervenantMode ? (
          <div className="space-y-3">
            <Field label="Sélectionner l'Intervenant / Prestataire Référencé">
              <select 
                value={wo.technicianName} 
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const found = wo.availableIntervenants.find(t => t.name === selectedName);
                  if (found) {
                    wo.selectIntervenant(found);
                  } else {
                    wo.setTechnicianName(selectedName);
                  }
                }} 
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <optgroup label="Intervenants & Techniciens Disponibles">
                  {wo.availableIntervenants.map((t, idx) => (
                    <option key={t.id || idx} value={t.name}>
                      {t.name} — {t.company || 'BeeCarbonat'} ({t.role || 'Technicien'})
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>

            {/* Editable summary cards for the selected intervenant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Nom de l'intervenant</label>
                <input
                  type="text"
                  value={wo.technicianName}
                  onChange={(e) => wo.setTechnicianName(e.target.value)}
                  placeholder="Nom Prénom"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Entreprise / Société</label>
                <input
                  type="text"
                  value={wo.technicianCompany}
                  onChange={(e) => wo.setTechnicianCompany(e.target.value)}
                  placeholder="Ex: Dalkia / Interne"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Téléphone Mobile Direct</label>
                <input
                  type="text"
                  value={wo.technicianPhone}
                  onChange={(e) => wo.setTechnicianPhone(e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Spécialité / Rôle</label>
                <input
                  type="text"
                  value={wo.technicianRole}
                  onChange={(e) => wo.setTechnicianRole(e.target.value)}
                  placeholder="Ex: Expert CVC"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Custom Intervenant Entry Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
            <Field label="Nom Complet de l'Intervenant *" required>
              <input
                type="text"
                value={wo.technicianName}
                onChange={(e) => wo.setTechnicianName(e.target.value)}
                placeholder="Ex: Julien Vasseur"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label="Société / Sous-traitant *" required>
              <input
                type="text"
                value={wo.technicianCompany}
                onChange={(e) => wo.setTechnicianCompany(e.target.value)}
                placeholder="Ex: Spie Énergie / Engie / Schindler"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label="Spécialité / Qualification">
              <input
                type="text"
                value={wo.technicianRole}
                onChange={(e) => wo.setTechnicianRole(e.target.value)}
                placeholder="Ex: Frigoriste certifié Cat. 1"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label="Téléphone Direct">
              <input
                type="text"
                value={wo.technicianPhone}
                onChange={(e) => wo.setTechnicianPhone(e.target.value)}
                placeholder="+33 6 11 22 33 44"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
              />
            </Field>

            <Field label="Email de Contact">
              <input
                type="email"
                value={wo.technicianEmail}
                onChange={(e) => wo.setTechnicianEmail(e.target.value)}
                placeholder="technicien@prestataire.fr"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label="Type d'Intervenant">
              <select
                value={wo.technicianType}
                onChange={(e) => wo.setTechnicianType(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="internal">Technicien Régie Interne</option>
                <option value="subcontractor">Prestataire Externe Sous-Traitant</option>
              </select>
            </Field>
          </div>
        )}
      </div>

      {/* ── Section 3: Modification de l'Adresse & Localisation du Site ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
        <SectionHeader icon={Building2} title="Localisation & Adresse d'Intervention" badge="Site Physique" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <Field label="Bâtiment / Complexe Immobilier">
            <select 
              value={wo.data.buildingId} 
              onChange={(e) => wo.setBuildingId(e.target.value)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              {wo.availableBuildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Adresse Rue / Voie d'Accès *" required>
            <input 
              type="text" 
              value={wo.data.buildingAddress || ''} 
              onChange={(e) => wo.setBuildingAddress(e.target.value)} 
              placeholder="Ex: 42 Avenue des Champs-Élysées" 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label="Ville & Code Postal *" required>
            <input 
              type="text" 
              value={wo.data.buildingCity || ''} 
              onChange={(e) => wo.setBuildingCity(e.target.value)} 
              placeholder="Ex: Paris, 75008" 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <Field label="Étage / Zone / Local Technique">
            <input 
              type="text" 
              value={wo.data.floor} 
              onChange={(e) => wo.setFloor(e.target.value)} 
              placeholder="Ex: R-1 / Chaufferie Centrale Bâtiment A" 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label="Contact d'Accès sur Place">
            <input 
              type="text" 
              value={wo.data.buildingContact || ''} 
              onChange={(e) => wo.setBuildingContact(e.target.value)} 
              placeholder="Ex: Gardien / Accueil / Dir. Technique" 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label="Téléphone d'Urgence / Accès Site">
            <input 
              type="text" 
              value={wo.data.buildingPhone || ''} 
              onChange={(e) => wo.setBuildingPhone(e.target.value)} 
              placeholder="Ex: +33 1 42 68 55 00" 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500" 
            />
          </Field>
        </div>
      </div>

      {/* ── Section 4: Équipement & Durées ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
        <SectionHeader icon={Clock} title="Équipement & Temps Opérationnels" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <Field label="Équipement Technique Cible">
            <select 
              value={wo.data.assetId || ''} 
              onChange={(e) => wo.setAssetId(e.target.value)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Sélectionner un équipement...</option>
              {wo.availableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.category})</option>
              ))}
            </select>
          </Field>

          <Field label="Temps Estimé (Heures)">
            <input 
              type="number" 
              step="0.5" 
              min="0.5" 
              value={wo.data.estimatedHours} 
              onChange={(e) => wo.setEstimatedHours(Number(e.target.value))} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label="Temps Réel Passé (Heures)">
            <input 
              type="number" 
              step="0.5" 
              min="0" 
              value={wo.data.actualHours || 0} 
              onChange={(e) => wo.setActualHours(Number(e.target.value))} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>
        </div>

        <Field label="Description des Symptômes, Consignes de Sécurité & Clés d'Accès" fullWidth>
          <textarea
            rows={3}
            value={wo.data.description}
            onChange={(e) => wo.setDescription(e.target.value)}
            placeholder="Décrivez précisément les symptômes observés, les consignes d'accès (badge, code portail), les EPI requis (casque, gants, habilitation électrique)..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-y"
          />
        </Field>
      </div>

    </div>
  );
};
