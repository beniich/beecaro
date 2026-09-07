> ⚠️ **DOCUMENTATION OBSOLÈTE**
> 
> Ce document mentionne MongoDB, qui n'est plus utilisé.
> La base de données actuelle est **PostgreSQL 16**.
> 
> Consultez `README.md` et `ARCHITECTURE.md` pour la documentation à jour.

# BeeCarbonat GMAO Industrielle — Documentation Technique & Déploiement

## 📌 Présentation
BeeCarbonat a évolué d'une simple plateforme de gestion de réclamations vers un système complet de **GMAO (Gestion de Maintenance Assistée par Ordinateur)** conforme aux standards industriels. Cette transformation ajoute le suivi d'actifs, la maintenance préventive/corrective, et l'analytique de fiabilité.

---

## 🏗️ Architecture des Modules

### 1. Asset Management (Registre des Actifs)
- **Base de données** : Modèle `Asset.ts` (Mongoose).
- **Hiérarchie** : Supporte une structure récursive (Site > Zone > Machine > Composant).
- **QR Coding** : Chaque actif possède un identifiant unique compatible avec le scanner mobile.

### 2. Maintenance Flow (Le Flux de Travail)
- **Conversion** : `api/work-orders/convert/:complaintId` permet de transformer un ticket en intervention technique.
- **Work Orders (OT)** : Gérés via `workOrder.controller.ts`. Supporte les statuts (en attente, en cours, terminé, suspendu).
- **Maintenance Préventive (PM)** : Plans récurrents basés sur le temps avec calcul automatique de la prochaine échéance (`MaintenancePlan.ts`).

### 3. Logistique MRO (Magasin de Pièces)
- **Inventaire** : Suivi des pièces détachées (roulements, filtres, consommables).
- **Alertes** : Système d'alerte visuelle sur le frontend pour les niveaux de stock inférieurs au seuil critique.

### 4. Digital Twin (Jumeau Numérique)
- **Intégration Design Studio** : Lien bidirectionnel entre les schémas vectoriels (`paper.js`) et les données de maintenance (`selectedAsset` details).

---

## 📊 Indicateurs de Performance (KPIs)
Le module analytique calcule en temps réel :
- **MTBF** (Mean Time Between Failures) : Mesure la fiabilité.
- **MTTR** (Mean Time To Repair) : Mesure l'efficacité de l'équipe de maintenance.
- **OEE (TRS)** : Calcul global de l'efficacité (Disponibilité x Performance x Qualité).

---

## 🚀 Guide de Mise en Production

### Pré-requis
- Node.js 18+
- MongoDB 6.0+
- Instance Kafka (optionnel, pour le bus d'événements)

### Variables d'Environnement (.env)
```env
PORT=5000
MONGODB_URI=mongodb://your_prod_uri
JWT_SECRET=your_secure_secret
# GMAO Specific
QR_BASE_URL=https://app.BeeCarbonat.com/scan/
```

### Installation & Build
```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd frontend
npm install
npm run build
```

---

## 🛠️ Maintenance & Support
- **Logs** : Les logs de maintenance sont stockés dans la collection `WorkOrders`.
- **Sauvegardes** : Exportation Excel disponible via `/api/analytics/export/complaints`.

Document généré le : 14 Avril 2026.
Version : 3.0 (Industrial Grade)
