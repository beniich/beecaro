import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkOrder } from '../../../types';

export function usePdfGenerator(wo: WorkOrder) {
  const generate = useCallback(() => {
    const doc = new jsPDF();
    
    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 42, 'F');

    // Title
    doc.setTextColor(255, 157, 43); // #ff9d2b amber
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BEECARBONAT SPIDER CAFM - FICHE D\'INTERVENTION', 14, 18);

    doc.setTextColor(203, 213, 225); // slate-300
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`TICKET N°: ${wo.ticketNumber || wo.id} | STATUT: ${wo.status?.toUpperCase()} | PRIORITÉ: ${wo.priority?.toUpperCase()}`, 14, 28);
    doc.text(`Généré le: ${new Date().toLocaleString()}`, 14, 35);

    // Meta Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAILS GÉNÉRAUX DE L\'INTERVENTION', 14, 50);

    autoTable(doc, {
      startY: 54,
      head: [['Paramètre', 'Valeur Actuelle', 'Localisation & Assignation', 'Détails']],
      body: [
        ['Titre Ticket', wo.title || '-', 'Bâtiment', wo.buildingName || '-'],
        ['Catégorie', wo.category?.toUpperCase() || '-', 'Étage / Zone', wo.floor || '-'],
        ['Priorité', wo.priority?.toUpperCase() || '-', 'Équipement', wo.assetName || wo.assetId || 'Principal'],
        ['Statut Actuel', wo.status?.toUpperCase() || '-', 'Technicien Référent', wo.assignedTechnician?.name || '-'],
        ['Échéance SLA', wo.slaDeadline || '-', 'Heures Prévues / Réelles', `${wo.estimatedHours || 0}h / ${wo.actualHours || 0}h`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });

    // Procedure Checklist Table
    const lastY1 = (doc as any).lastAutoTable.finalY || 100;
    doc.text('PROCÉDURE TECHNIQUE & ÉTAPES DE CONTRÔLE', 14, lastY1 + 10);

    const stepsRows = (wo.procedureSteps || []).map(s => [
      `Étape ${s.stepNumber}`,
      s.title,
      s.completed ? '[X] VALIDÉ' : '[ ] EN ATTENTE',
      s.completedAt || '-',
      s.completedBy || '-'
    ]);

    autoTable(doc, {
      startY: lastY1 + 14,
      head: [['N°', 'Description de l\'Opération', 'Validation', 'Date / Heure', 'Opérateur']],
      body: stepsRows.length > 0 ? stepsRows : [['-', 'Aucune étape spécifiée', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });

    // Parts Table
    const lastY2 = (doc as any).lastAutoTable.finalY || 160;
    doc.text('PIÈCES DÉTACHÉES ET CONSOMMABLES UTILISÉS', 14, lastY2 + 10);

    const partsRows = (wo.partsUsed || []).map(p => [
      p.partNumber || '-',
      p.name,
      p.quantity.toString(),
      `${p.cost} €`,
      `${p.cost * p.quantity} €`
    ]);

    const totalPartsCost = (wo.partsUsed || []).reduce((sum, p) => sum + (p.cost * p.quantity), 0);

    autoTable(doc, {
      startY: lastY2 + 14,
      head: [['Référence', 'Désignation Pièce', 'Quantité', 'Prix Unitaire', 'Total']],
      body: [
        ...partsRows,
        ['', 'COÛT TOTAL PIÈCES', '', '', `${totalPartsCost} €`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });

    // Resolution & Signatures
    const lastY3 = (doc as any).lastAutoTable.finalY || 220;
    if (lastY3 < 240) {
      doc.text('DIAGNOSTIC & VISA DU RESPONSABLE', 14, lastY3 + 10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cause Racine: ${wo.rootCause || 'En cours d\'investigation'}`, 14, lastY3 + 17);
      doc.text(`Rapport Clôture: ${wo.resolutionNotes || 'Intervention conforme aux normes de sécurité et de performance énergétique.'}`, 14, lastY3 + 23);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, lastY3 + 35, 90, lastY3 + 35);
      doc.text('Signature Technicien', 14, lastY3 + 39);

      doc.line(120, lastY3 + 35, 195, lastY3 + 35);
      doc.text('Visa Facility Manager / Client', 120, lastY3 + 39);
    }

    doc.save(`Fiche_Ticket_${wo.ticketNumber || wo.id}.pdf`);
  }, [wo]);

  return { generate };
}
