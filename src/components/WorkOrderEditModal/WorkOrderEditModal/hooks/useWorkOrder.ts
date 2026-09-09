import { useState, useEffect, useMemo, useCallback } from 'react';
import { WorkOrder, ProcedureStep, WorkOrderAuditEntry, Asset, Building, Intervenant } from '../../../types';
import { api } from '../../../services/api';
import { localCache } from '../../../services/localCache';
import { TECHNICIANS, DEFAULT_PROCEDURE_STEPS } from '../utils/constants';

export interface UseWorkOrderReturn {
  data: WorkOrder;
  isSaving: boolean;
  successMsg: string | null;
  availableAssets: Asset[];
  availableBuildings: Building[];
  availableIntervenants: any[];
  
  // Setters - General Info
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setPriority: (v: WorkOrder['priority']) => void;
  setStatus: (v: WorkOrder['status']) => void;
  setCategory: (v: WorkOrder['category']) => void;
  setSlaDeadline: (v: string) => void;
  setEstimatedHours: (v: number) => void;
  setActualHours: (v: number) => void;
  setRootCause: (v: string) => void;
  setResolutionNotes: (v: string) => void;

  // Setters - Location & Address
  setBuildingId: (v: string) => void;
  setBuildingName: (v: string) => void;
  setBuildingAddress: (v: string) => void;
  setBuildingCity: (v: string) => void;
  setBuildingContact: (v: string) => void;
  setBuildingPhone: (v: string) => void;
  setFloor: (v: string) => void;
  setAssetId: (v: string) => void;

  // Setters - Intervenant / Technician
  technicianName: string;
  technicianRole: string;
  technicianCompany: string;
  technicianPhone: string;
  technicianEmail: string;
  technicianType: 'internal' | 'subcontractor';
  setTechnicianName: (v: string) => void;
  setTechnicianRole: (v: string) => void;
  setTechnicianCompany: (v: string) => void;
  setTechnicianPhone: (v: string) => void;
  setTechnicianEmail: (v: string) => void;
  setTechnicianType: (v: 'internal' | 'subcontractor') => void;
  selectIntervenant: (intervenant: any) => void;
  
  // Collections
  procedureSteps: ProcedureStep[];
  partsUsed: Array<{ name: string; cost: number; quantity: number; partNumber?: string }>;
  auditLog: WorkOrderAuditEntry[];
  
  // Actions
  toggleStep: (id: string) => void;
  addStep: (title: string) => void;
  deleteStep: (id: string) => void;
  addPart: (part: { name: string; quantity: number; cost: number; partNumber?: string }) => void;
  deletePart: (index: number) => void;
  
  // Helpers
  isOnline: () => boolean;
  handleSave: () => Promise<void>;
}

export function useWorkOrder(initial: WorkOrder | null, onUpdated: (wo: WorkOrder) => void): UseWorkOrderReturn {
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [availableBuildings, setAvailableBuildings] = useState<Building[]>([]);
  const [availableIntervenants, setAvailableIntervenants] = useState<any[]>(TECHNICIANS);

  useEffect(() => {
    api.getAssets().then(data => {
      if (data && data.length > 0) setAvailableAssets(data);
    }).catch(err => console.warn('Could not fetch assets for work order editor:', err));

    api.getBuildings().then(data => {
      if (data && data.length > 0) setAvailableBuildings(data as any);
    }).catch(err => console.warn('Could not fetch buildings for work order editor:', err));

    api.getIntervenants().then(data => {
      if (data && data.length > 0) {
        // Merge with defaults if not present
        const merged = [...data];
        TECHNICIANS.forEach(t => {
          if (!merged.some(m => m.name === t.name)) {
            merged.push(t);
          }
        });
        setAvailableIntervenants(merged);
      }
    }).catch(err => console.warn('Could not fetch intervenants:', err));
  }, []);

  // Form State - General
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [priority, setPriority] = useState<WorkOrder['priority']>(initial?.priority || 'medium');
  const [status, setStatus] = useState<WorkOrder['status']>(initial?.status || 'open');
  const [category, setCategory] = useState<WorkOrder['category']>(initial?.category || 'preventive');
  const [slaDeadline, setSlaDeadline] = useState(
    initial?.slaDeadline?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );
  const [estimatedHours, setEstimatedHours] = useState(initial?.estimatedHours || 3.5);
  const [actualHours, setActualHours] = useState(initial?.actualHours || 0);
  const [rootCause, setRootCause] = useState(initial?.rootCause || '');
  const [resolutionNotes, setResolutionNotes] = useState(initial?.resolutionNotes || '');

  // Form State - Location & Address
  const [buildingId, setBuildingId] = useState(initial?.buildingId || 'bld-01');
  const [buildingName, setBuildingName] = useState(initial?.buildingName || 'Spider Cybernetics Tower A');
  const [buildingAddress, setBuildingAddress] = useState(initial?.buildingAddress || '42 Avenue des Champs-Élysées');
  const [buildingCity, setBuildingCity] = useState(initial?.buildingCity || 'Paris, 75008');
  const [buildingContact, setBuildingContact] = useState(initial?.buildingContact || 'Jean-Marc Delorme (Directeur Technique)');
  const [buildingPhone, setBuildingPhone] = useState(initial?.buildingPhone || '+33 1 42 68 55 00');
  const [floor, setFloor] = useState(initial?.floor || 'Floor 1');
  const [assetId, setAssetId] = useState(initial?.assetId || '');
  const [assetName, setAssetName] = useState(initial?.assetName || '');

  // Form State - Intervenant / Technician
  const initialTech = initial?.assignedTechnician;
  const matchedDefault = TECHNICIANS.find(t => t.name === initialTech?.name) || TECHNICIANS[0];

  const [technicianName, setTechnicianName] = useState(initialTech?.name || matchedDefault.name);
  const [technicianRole, setTechnicianRole] = useState(initialTech?.role || matchedDefault.role);
  const [technicianCompany, setTechnicianCompany] = useState(initialTech?.company || matchedDefault.company || 'BeeCarbonat Régie Interne');
  const [technicianPhone, setTechnicianPhone] = useState(initialTech?.phone || matchedDefault.phone || '+33 6 12 34 56 78');
  const [technicianEmail, setTechnicianEmail] = useState(initialTech?.email || matchedDefault.email || 'intervenant@beecarbonat.com');
  const [technicianType, setTechnicianType] = useState<'internal' | 'subcontractor'>(initialTech?.type || matchedDefault.type || 'internal');

  // Collections
  const [procedureSteps, setProcedureSteps] = useState<ProcedureStep[]>(
    initial?.procedureSteps?.length ? initial.procedureSteps : DEFAULT_PROCEDURE_STEPS
  );
  const [partsUsed, setPartsUsed] = useState<Array<{ name: string; cost: number; quantity: number; partNumber?: string }>>(
    initial?.partsUsed || [
      { name: 'Joint Torique Silicium HT-90', cost: 45, quantity: 2, partNumber: 'JT-904' },
      { name: 'Filtre Particulaire HEPA Grade 13', cost: 120, quantity: 1, partNumber: 'FL-HEPA-13' }
    ]
  );
  const [auditLog, setAuditLog] = useState<WorkOrderAuditEntry[]>(
    initial?.auditLog || [{
      id: 'aud-init',
      timestamp: initial?.createdAt || new Date().toISOString(),
      user: 'Système GMAO',
      action: 'Création initiale',
      details: `Ticket initialisé pour ${initial?.assetName || 'intervention sur site'}`
    }]
  );

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Computed data object
  const data: WorkOrder = useMemo(() => ({
    ...(initial || {} as WorkOrder),
    title,
    description,
    priority,
    status,
    category,
    buildingId,
    buildingName,
    buildingAddress,
    buildingCity,
    buildingContact,
    buildingPhone,
    floor,
    assetId,
    assetName,
    assignedTechnician: {
      name: technicianName,
      role: technicianRole,
      company: technicianCompany,
      phone: technicianPhone,
      email: technicianEmail,
      type: technicianType,
      avatar: availableIntervenants.find(t => t.name === technicianName)?.avatar || initialTech?.avatar || ''
    },
    slaDeadline: slaDeadline.includes(':') ? slaDeadline : `${slaDeadline} 18:00`,
    estimatedHours,
    actualHours,
    procedureSteps,
    partsUsed,
    auditLog,
    rootCause,
    resolutionNotes
  }), [
    initial, title, description, priority, status, category,
    buildingId, buildingName, buildingAddress, buildingCity, buildingContact, buildingPhone,
    floor, assetId, assetName,
    technicianName, technicianRole, technicianCompany, technicianPhone, technicianEmail, technicianType,
    availableIntervenants, initialTech,
    slaDeadline, estimatedHours, actualHours,
    procedureSteps, partsUsed, auditLog, rootCause, resolutionNotes
  ]);

  const selectIntervenant = useCallback((intervenant: any) => {
    if (!intervenant) return;
    setTechnicianName(intervenant.name || '');
    if (intervenant.role) setTechnicianRole(intervenant.role);
    if (intervenant.company) setTechnicianCompany(intervenant.company);
    if (intervenant.phone) setTechnicianPhone(intervenant.phone);
    if (intervenant.email) setTechnicianEmail(intervenant.email);
    if (intervenant.type) setTechnicianType(intervenant.type);
  }, []);

  const handleBuildingChange = useCallback((newId: string) => {
    setBuildingId(newId);
    const b = availableBuildings.find(item => item.id === newId);
    if (b) {
      setBuildingName(b.name);
      if (b.address) setBuildingAddress(b.address);
      if (b.city) setBuildingCity(b.postalCode ? `${b.city}, ${b.postalCode}` : b.city);
      if (b.contactPerson) setBuildingContact(b.contactPerson);
      if (b.contactPhone) setBuildingPhone(b.contactPhone);
    }
  }, [availableBuildings]);

  const handleAssetChange = useCallback((newId: string) => {
    setAssetId(newId);
    const a = availableAssets.find(item => item.id === newId);
    if (a) {
      setAssetName(a.name);
      if (a.buildingId) {
        setBuildingId(a.buildingId);
        setBuildingName(a.buildingName);
      }
      if (a.floor) setFloor(a.floor);
    }
  }, [availableAssets]);

  const toggleStep = useCallback((stepId: string) => {
    setProcedureSteps(prev => prev.map(step => {
      if (step.id !== stepId) return step;
      const nextCompleted = !step.completed;
      return {
        ...step,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
        completedBy: nextCompleted ? technicianName : undefined
      };
    }));
  }, [technicianName]);

  const addStep = useCallback((stepTitle: string) => {
    if (!stepTitle.trim()) return;
    setProcedureSteps(prev => [...prev, {
      id: `step-${Date.now()}`,
      stepNumber: prev.length + 1,
      title: stepTitle.trim(),
      completed: false,
      requiredValidation: false
    }]);
  }, []);

  const deleteStep = useCallback((stepId: string) => {
    setProcedureSteps(prev => prev
      .filter(s => s.id !== stepId)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }))
    );
  }, []);

  const addPart = useCallback((part: { name: string; quantity: number; cost: number; partNumber?: string }) => {
    if (!part.name.trim()) return;
    setPartsUsed(prev => [...prev, {
      name: part.name.trim(),
      quantity: part.quantity || 1,
      cost: part.cost || 0,
      partNumber: part.partNumber?.trim() || `PRT-${Math.floor(100 + Math.random() * 900)}`
    }]);
  }, []);

  const deletePart = useCallback((index: number) => {
    setPartsUsed(prev => prev.filter((_, i) => i !== index));
  }, []);

  const setStatusWithLog = useCallback((nextStatus: WorkOrder['status']) => {
    if (nextStatus === status) return;
    setAuditLog(prev => [{
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: technicianName || 'Opérateur',
      action: 'Changement de statut',
      oldValue: status,
      newValue: nextStatus,
      details: `Statut modifié vers "${nextStatus.toUpperCase()}"`
    }, ...prev]);
    setStatus(nextStatus);
  }, [status, technicianName]);

  const handleSave = useCallback(async () => {
    if (!initial) return;
    setIsSaving(true);
    try {
      const log: WorkOrderAuditEntry = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: technicianName || 'Gestionnaire GMAO',
        action: 'Mise à jour ticket & intervenant',
        details: `Intervenant: ${technicianName} (${technicianCompany || 'Interne'}), Adresse: ${buildingAddress}, ${buildingCity}, Statut: ${status}`
      };

      const finalAuditLog = [log, ...auditLog];
      setAuditLog(finalAuditLog);

      const payload: WorkOrder = { 
        ...data, 
        auditLog: finalAuditLog,
        buildingAddress,
        buildingCity,
        buildingContact,
        buildingPhone,
        assignedTechnician: {
          name: technicianName,
          role: technicianRole,
          company: technicianCompany,
          phone: technicianPhone,
          email: technicianEmail,
          type: technicianType,
          avatar: availableIntervenants.find(t => t.name === technicianName)?.avatar || initialTech?.avatar || ''
        }
      };

      const res = await api.updateWorkOrder(initial.id || initial.ticketNumber, payload);
      const finalResult = res || payload;
      
      onUpdated(finalResult);
      setSuccessMsg('✅ Modifications enregistrées avec succès (Intervenant & Adresse mis à jour)');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  }, [
    initial, data, auditLog, technicianName, technicianRole, technicianCompany, technicianPhone, 
    technicianEmail, technicianType, buildingAddress, buildingCity, buildingContact, buildingPhone,
    availableIntervenants, initialTech, status, onUpdated
  ]);

  return {
    data,
    isSaving,
    successMsg,
    availableAssets,
    availableBuildings,
    availableIntervenants,
    setTitle,
    setDescription,
    setPriority,
    setStatus: setStatusWithLog,
    setCategory,
    setBuildingId: handleBuildingChange,
    setBuildingName,
    setBuildingAddress,
    setBuildingCity,
    setBuildingContact,
    setBuildingPhone,
    setFloor,
    setAssetId: handleAssetChange,
    technicianName,
    technicianRole,
    technicianCompany,
    technicianPhone,
    technicianEmail,
    technicianType,
    setTechnicianName,
    setTechnicianRole,
    setTechnicianCompany,
    setTechnicianPhone,
    setTechnicianEmail,
    setTechnicianType,
    selectIntervenant,
    setSlaDeadline,
    setEstimatedHours,
    setActualHours,
    setRootCause,
    setResolutionNotes,
    procedureSteps,
    partsUsed,
    auditLog,
    toggleStep,
    addStep,
    deleteStep,
    addPart,
    deletePart,
    isOnline: () => localCache.isOnline(),
    handleSave
  };
}
