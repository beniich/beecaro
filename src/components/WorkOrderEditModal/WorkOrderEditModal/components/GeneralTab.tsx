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
  lang?: 'fr' | 'en';
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

export const GeneralTab: React.FC<GeneralTabProps> = ({ wo, lang = 'fr' }) => {
  const [customIntervenantMode, setCustomIntervenantMode] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* ── Section 1: Informations Générales du Ticket ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
        <SectionHeader 
          icon={Wrench} 
          title={lang === 'fr' ? 'Paramètres Généraux du Ticket' : 'General Work Order Settings'} 
          badge={`WO: ${wo.data.ticketNumber || wo.data.id}`} 
        />
        
        <Field label={lang === 'fr' ? "Titre du Ticket / Objet de l'intervention" : "Ticket Title / Intervention Purpose"} fullWidth required>
          <input
            type="text"
            value={wo.data.title}
            onChange={(e) => wo.setTitle(e.target.value)}
            placeholder={lang === 'fr' ? "Ex: Remplacement du compresseur frigorifique et vérification étanchéité" : "e.g. Chiller compressor overhaul and refrigerant seal inspection"}
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          <Field label={lang === 'fr' ? "Niveau de Priorité" : "Priority Level"} required>
            <select 
              value={wo.data.priority} 
              onChange={(e) => wo.setPriority(e.target.value as any)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="low">{lang === 'fr' ? '🟢 Faible (Low)' : '🟢 Low'}</option>
              <option value="medium">{lang === 'fr' ? '🔵 Moyenne (Medium)' : '🔵 Medium'}</option>
              <option value="high">{lang === 'fr' ? '🟠 Élevée (High)' : '🟠 High'}</option>
              <option value="critical">{lang === 'fr' ? '🔴 Critique (Urgence Immédiate)' : '🔴 Critical (Immediate Emergency)'}</option>
            </select>
          </Field>

          <Field label={lang === 'fr' ? "Statut du Ticket" : "Ticket Status"}>
            <select 
              value={wo.data.status} 
              onChange={(e) => wo.setStatus(e.target.value as any)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500"
            >
              <option value="open">{lang === 'fr' ? 'Ouvert / À planifier' : 'Open / Scheduled'}</option>
              <option value="in_progress">{lang === 'fr' ? "En cours d'intervention" : 'In Progress'}</option>
              <option value="pending_parts">{lang === 'fr' ? 'En attente pièces / Devis' : 'Pending Parts / Quote'}</option>
              <option value="resolved">{lang === 'fr' ? 'Résolu / À valider' : 'Resolved / Pending Sign-off'}</option>
              <option value="closed">{lang === 'fr' ? 'Clôturé & Validé' : 'Closed & Verified'}</option>
            </select>
          </Field>

          <Field label={lang === 'fr' ? "Catégorie GMAO" : "CMMS Category"}>
            <select 
              value={wo.data.category} 
              onChange={(e) => wo.setCategory(e.target.value as any)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="preventive">{lang === 'fr' ? 'Maintenance Préventive (PM)' : 'Preventive Maintenance (PM)'}</option>
              <option value="corrective">{lang === 'fr' ? 'Maintenance Corrective' : 'Corrective Maintenance'}</option>
              <option value="inspection">{lang === 'fr' ? 'Contrôle / Diagnostic' : 'Inspection / Diagnostics'}</option>
              <option value="emergency">{lang === 'fr' ? "Dépannage d'Urgence" : 'Emergency Response'}</option>
              <option value="esg_audit">{lang === 'fr' ? 'Audit ESG & Efficience' : 'ESG & Efficiency Audit'}</option>
            </select>
          </Field>

          <Field label={lang === 'fr' ? "Échéance SLA Cible" : "Target SLA Deadline"}>
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
            <span>{lang === 'fr' ? 'Intervenant & Technicien Assigné' : 'Assigned Technician & Contractor'}</span>
          </div>
          <button
            type="button"
            onClick={() => setCustomIntervenantMode(!customIntervenantMode)}
            className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            {customIntervenantMode 
              ? (lang === 'fr' ? '← Choisir parmi l\'équipe / prestataires' : '← Choose from registered staff / contractors') 
              : (lang === 'fr' ? '+ Saisir un intervenant externe / personnalisé' : '+ Enter custom external contractor')}
          </button>
        </div>

        {!customIntervenantMode ? (
          <div className="space-y-3">
            <Field label={lang === 'fr' ? "Sélectionner l'Intervenant / Prestataire Référencé" : "Select Qualified Technician / Vendor"}>
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
                <optgroup label={lang === 'fr' ? "Intervenants & Techniciens Disponibles" : "Available Field Technicians & Contractors"}>
                  {wo.availableIntervenants.map((t, idx) => (
                    <option key={t.id || idx} value={t.name}>
                      {t.name} — {t.company || 'BeeCarbonat'} ({t.role || (lang === 'fr' ? 'Technicien' : 'Technician')})
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>

            {/* Editable summary cards for the selected intervenant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? "Nom de l'intervenant" : "Technician Name"}
                </label>
                <input
                  type="text"
                  value={wo.technicianName}
                  onChange={(e) => wo.setTechnicianName(e.target.value)}
                  placeholder={lang === 'fr' ? "Nom Prénom" : "Full Name"}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? "Entreprise / Société" : "Company / Contractor"}
                </label>
                <input
                  type="text"
                  value={wo.technicianCompany}
                  onChange={(e) => wo.setTechnicianCompany(e.target.value)}
                  placeholder="e.g. Dalkia / Interne"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? "Téléphone Mobile Direct" : "Direct Mobile Phone"}
                </label>
                <input
                  type="text"
                  value={wo.technicianPhone}
                  onChange={(e) => wo.setTechnicianPhone(e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {lang === 'fr' ? "Spécialité / Rôle" : "Role / Specialty"}
                </label>
                <input
                  type="text"
                  value={wo.technicianRole}
                  onChange={(e) => wo.setTechnicianRole(e.target.value)}
                  placeholder={lang === 'fr' ? "Ex: Expert CVC" : "e.g. HVAC Specialist"}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Custom Intervenant Entry Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
            <Field label={lang === 'fr' ? "Nom Complet de l'Intervenant *" : "Full Technician Name *"} required>
              <input
                type="text"
                value={wo.technicianName}
                onChange={(e) => wo.setTechnicianName(e.target.value)}
                placeholder={lang === 'fr' ? "Ex: Julien Vasseur" : "e.g. John Miller"}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label={lang === 'fr' ? "Société / Sous-traitant *" : "Company / Subcontractor *"} required>
              <input
                type="text"
                value={wo.technicianCompany}
                onChange={(e) => wo.setTechnicianCompany(e.target.value)}
                placeholder="e.g. Spie / Engie / Carrier / Otis"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label={lang === 'fr' ? "Spécialité / Qualification" : "Specialty / Certification"}>
              <input
                type="text"
                value={wo.technicianRole}
                onChange={(e) => wo.setTechnicianRole(e.target.value)}
                placeholder={lang === 'fr' ? "Ex: Frigoriste certifié Cat. 1" : "e.g. EPA Certified HVAC Technician"}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label={lang === 'fr' ? "Téléphone Direct" : "Direct Phone"}>
              <input
                type="text"
                value={wo.technicianPhone}
                onChange={(e) => wo.setTechnicianPhone(e.target.value)}
                placeholder="+33 6 11 22 33 44"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
              />
            </Field>

            <Field label={lang === 'fr' ? "Email de Contact" : "Contact Email"}>
              <input
                type="email"
                value={wo.technicianEmail}
                onChange={(e) => wo.setTechnicianEmail(e.target.value)}
                placeholder="tech@vendor-contractor.com"
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </Field>

            <Field label={lang === 'fr' ? "Type d'Intervenant" : "Contractor Classification"}>
              <select
                value={wo.technicianType}
                onChange={(e) => wo.setTechnicianType(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="internal">{lang === 'fr' ? 'Technicien Régie Interne' : 'In-House Maintenance Staff'}</option>
                <option value="subcontractor">{lang === 'fr' ? 'Prestataire Externe Sous-Traitant' : 'Third-Party Contractor'}</option>
              </select>
            </Field>
          </div>
        )}
      </div>

      {/* ── Section 3: Modification de l'Adresse & Localisation du Site ── */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
        <SectionHeader 
          icon={Building2} 
          title={lang === 'fr' ? "Localisation & Adresse d'Intervention" : "Intervention Location & Facility Address"} 
          badge={lang === 'fr' ? "Site Physique" : "Physical Site"} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <Field label={lang === 'fr' ? "Bâtiment / Complexe Immobilier" : "Building / Facility Complex"}>
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

          <Field label={lang === 'fr' ? "Adresse Rue / Voie d'Accès *" : "Street Address / Access Route *"} required>
            <input 
              type="text" 
              value={wo.data.buildingAddress || ''} 
              onChange={(e) => wo.setBuildingAddress(e.target.value)} 
              placeholder={lang === 'fr' ? "Ex: 42 Avenue des Champs-Élysées" : "e.g. 42 Tech Park Blvd"} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label={lang === 'fr' ? "Ville & Code Postal *" : "City & Postal Code *"} required>
            <input 
              type="text" 
              value={wo.data.buildingCity || ''} 
              onChange={(e) => wo.setBuildingCity(e.target.value)} 
              placeholder={lang === 'fr' ? "Ex: Paris, 75008" : "e.g. New York, NY 10001"} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <Field label={lang === 'fr' ? "Étage / Zone / Local Technique" : "Floor / Zone / Plant Room"}>
            <input 
              type="text" 
              value={wo.data.floor} 
              onChange={(e) => wo.setFloor(e.target.value)} 
              placeholder={lang === 'fr' ? "Ex: R-1 / Chaufferie Centrale Bâtiment A" : "e.g. Basement 1 / Central Boiler Room Bldg A"} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label={lang === 'fr' ? "Contact d'Accès sur Place" : "On-Site Access Contact"}>
            <input 
              type="text" 
              value={wo.data.buildingContact || ''} 
              onChange={(e) => wo.setBuildingContact(e.target.value)} 
              placeholder={lang === 'fr' ? "Ex: Gardien / Accueil / Dir. Technique" : "e.g. Front Desk / Security / Facility Manager"} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label={lang === 'fr' ? "Téléphone d'Urgence / Accès Site" : "Emergency Access / Facility Phone"}>
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
        <SectionHeader 
          icon={Clock} 
          title={lang === 'fr' ? "Équipement & Temps Opérationnels" : "Target Asset & Operational Hours"} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <Field label={lang === 'fr' ? "Équipement Technique Cible" : "Target Technical Asset"}>
            <select 
              value={wo.data.assetId || ''} 
              onChange={(e) => wo.setAssetId(e.target.value)} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">{lang === 'fr' ? 'Sélectionner un équipement...' : 'Select technical asset...'}</option>
              {wo.availableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.category})</option>
              ))}
            </select>
          </Field>

          <Field label={lang === 'fr' ? "Temps Estimé (Heures)" : "Estimated Duration (Hours)"}>
            <input 
              type="number" 
              step="0.5" 
              min="0.5" 
              value={wo.data.estimatedHours} 
              onChange={(e) => wo.setEstimatedHours(Number(e.target.value))} 
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" 
            />
          </Field>

          <Field label={lang === 'fr' ? "Temps Réel Passé (Heures)" : "Actual Logged Hours"}>
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

        <Field label={lang === 'fr' ? "Description des Symptômes, Consignes de Sécurité & Clés d'Accès" : "Symptom Description, Safety Instructions & Access Keys"} fullWidth>
          <textarea
            rows={3}
            value={wo.data.description}
            onChange={(e) => wo.setDescription(e.target.value)}
            placeholder={lang === 'fr' 
              ? "Décrivez précisément les symptômes observés, les consignes d'accès (badge, code portail), les EPI requis (casque, gants, habilitation électrique)..." 
              : "Describe detailed symptoms, on-site access instructions (badge, gate code), PPE requirements (hard hat, safety boots, electrical certification)..."}
            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-y"
          />
        </Field>
      </div>

    </div>
  );
};
