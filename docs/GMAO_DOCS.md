# GMAO & CAFM Industrielle — Documentation Technique & Déploiement

## 📌 Présentation
BeeCarbonat (SpaceFlow) est une plateforme de **GMAO (Gestion de Maintenance Assistée par Ordinateur)** et **CAFM (Computer-Aided Facility Management)** orientée durabilité environnementale (ESG).

Elle assure la surveillance des infrastructures, le suivi énergétique, la gestion des interventions de maintenance préventive/corrective, le pilotage des éclairages, des réseaux d'eau, et l'analytique des actifs en temps réel.

---

## 🏗️ Architecture des Modules

### 1. Asset Management (Registre des Actifs)
- **Base de données** : Table PostgreSQL `assets` (Drizzle ORM).
- **Hiérarchie** : Équipements rattachés aux Bâtiments, Étages et Zones.
- **QR Coding** : Chaque actif possède un identifiant unique avec QR code pour le scan mobile sur site.

### 2. Work Orders (Ordres de Travail / Interventions)
- **Modèle** : Table PostgreSQL `work_orders`.
- **Suivi d'intervention** : Priorités (low, medium, high, critical), statuts (open, in_progress, pending_parts, resolved, closed), suivi SLA et logs d'audit.
- **Affectation** : Techniciens internes et prestataires externes sous-traitants.

### 3. Monitoring Temps Réel & ESG
- **IoT & Télémétrie** : Réseau de nœuds de capteurs (CVC, énergie, air, eau, sécurité).
- **Indicateurs ESG** : Suivi des émissions Scope 1, 2, 3, production solaire, recyclage de l'eau et crédits carbone.
- **Cyber & Mission Control** : Surveillance de sécurité, monitoring des caches, topologie multi-cloud.

### 4. Digital Twin & BIM
- Intégration 3D avec Three.js et `web-ifc` pour la visualisation interactive des modèles spatiaux et des données de maintenance.

---

## 📊 Indicateurs de Performance (KPIs)
- **MTBF** (Mean Time Between Failures) : Fiabilité des équipements CVC et électriques.
- **MTTR** (Mean Time To Repair) : Temps moyen de résolution des pannes.
- **OEE / TRS** : Rendement global des équipements critiques.
- **Carbon Intensity** : kgCO2e/m²/an par bâtiment.

---

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur et de l'interface en mode développement
npm run dev

# Build de production
npm run build
```
