import { ProcedureStep } from '../../../types';

export const MOCK_BUILDINGS: any[] = [];
export const MOCK_ASSETS: any[] = [];

export const DEFAULT_PROCEDURE_STEPS: ProcedureStep[] = [
  { id: 's-1', stepNumber: 1, title: 'Consignation électrique & Isolation de sécurité (LOTO)', completed: true, completedAt: '2026-08-28 08:30', completedBy: 'Alexandre Mercer', requiredValidation: true },
  { id: 's-2', stepNumber: 2, title: 'Inspection visuelle et relevé télémétrique (vibration/pression)', completed: true, completedAt: '2026-08-28 09:15', completedBy: 'Alexandre Mercer', requiredValidation: false },
  { id: 's-3', stepNumber: 3, title: 'Remplacement des joints d\'étanchéité et vérification des roulements', completed: false, requiredValidation: true },
  { id: 's-4', stepNumber: 4, title: 'Purge du circuit hydraulique et réinjection de fluide caloporteur', completed: false, requiredValidation: false },
  { id: 's-5', stepNumber: 5, title: 'Essai en charge & Validation de conformité énergétique ESG', completed: false, requiredValidation: true }
];

export const TECHNICIANS = [
  { 
    id: 'tech-1',
    name: 'Alexandre Mercer', 
    role: 'Spécialiste Systèmes & Mobilité', 
    company: 'BeeCarbonat Régie Interne',
    phone: '+33 6 12 34 56 78',
    email: 'a.mercer@beecarbonat.com',
    type: 'internal' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'tech-2',
    name: 'Elena Rostova', 
    role: 'Ingénieure CVC & Fluides Thermiques', 
    company: 'Dalkia / Engie Solutions',
    phone: '+33 6 98 76 54 32',
    email: 'elena.rostova@prestataire.fr',
    type: 'subcontractor' as const,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'tech-3',
    name: 'Dr. Tariq Al-Mansoor', 
    role: 'Expert Réseau Électrique & Haute Tension', 
    company: 'Spie Batignolles Énergie',
    phone: '+33 7 45 67 89 01',
    email: 'tariq.almansoor@spie-partner.com',
    type: 'subcontractor' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'tech-4',
    name: 'Carlos Mendez', 
    role: 'Technicien Intervention Rapide & Plomberie', 
    company: 'BeeCarbonat Régie Interne',
    phone: '+33 6 55 44 33 22',
    email: 'carlos.m@beecarbonat.com',
    type: 'internal' as const,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'tech-5',
    name: 'Sophie Laurent', 
    role: 'Spécialiste Ascenseurs & Levage', 
    company: 'Schindler / Otis Maintenance',
    phone: '+33 1 44 55 66 77',
    email: 'slaurent@schindler-partner.fr',
    type: 'subcontractor' as const,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' 
  },
  { 
    id: 'tech-6',
    name: 'Marc Dubois', 
    role: 'Technicien Sécurité Incendie & SSI', 
    company: 'Chubb Sécurité',
    phone: '+33 6 88 99 00 11',
    email: 'mdubois@chubb-safety.com',
    type: 'subcontractor' as const,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' 
  }
];

export const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
};
