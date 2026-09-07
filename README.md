# 🏢 BeeCarbonat — Smart Building CAFM & ESG Decarbonization Platform

> **Plateforme industrielle de Gestion Technique du Bâtiment (CAFM), GMAO, Décarbonation ESG & Jumeau Numérique 3D BIM.**

---

## 📑 Sommaire
- [Architecture & Vue d'Ensemble](#-architecture--vue-densemble)
- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Démarrage Rapide](#-démarrage-rapide)
- [Cartographie des Endpoints API](#-cartographie-des-endpoints-api)
- [Déploiement Docker & Production](#-déploiement-docker--production)
- [Sécurité & Gouvernance](#-sécurité--gouvernance)
- [Documentation Complémentaire](#-documentation-complémentaire)

---

## 🏛 Architecture & Vue d'Ensemble

BeeCarbonat combine un frontend React/Vite haute performance avec un backend Express modularisé et une persistance hybride (Neon PostgreSQL Serverless + Drizzle ORM + Fallback mémoire).

```
beecaro/
├── src/
│   ├── components/            # Composants React (BIM 3D, Graphiques, Cockpits)
│   ├── contexts/              # États globaux React (Auth, Thème, Langue)
│   ├── db/                    # Schémas Drizzle ORM (schema.ts, index.ts)
│   ├── services/              # Services API client
│   └── server/                # Architecture Backend Modulaire
│       ├── config/            # Pool Database, migrations, DDL
│       ├── middlewares/       # Sécurité, assainissement XSS, audit, rate-limiting
│       ├── routes/            # 18 modules de routes par domaine métier
│       └── stores.ts          # Magasins de données partagés & réactifs
├── docs/                      # Documentation technique approfondie
│   ├── GMAO_DOCS.md           # Exploitation GMAO, protocoles de maintenance
│   └── PLAN_ACTION.md         # Feuille de route et matrice des priorités
├── nginx/                     # Configuration Reverse Proxy & SSL
├── scripts/                   # Scripts de vérification et migration
├── server.ts                  # Point d'entrée serveur Express (< 150 lignes)
└── docker-compose.yml         # Orchestration multi-conteneurs
```

---

## ✨ Fonctionnalités Clés

1. **GMAO & Maintenance Industrielle** :
   - Registre d'actifs EAM, calcul d'indice de santé (HealthScore).
   - Ordres de travail (OT) avec workflows SLA, gammes opératoires et validation Zod.
   - Gestion des stocks MRO (pièces détachées, seuils critiques, réapprovisionnement).
   - Affectation des techniciens terrain avec calcul de charge horaire.

2. **Décarbonation ESG & Conformité CSRD** :
   - Bilan carbone automatisé Scope 1, Scope 2 et Scope 3.
   - Séries temporelles d'énergie (kW, kWh) et crédits carbone Verra.
   - Génération de rapports audités ISO 14064-1.

3. **Hypervision & Jumeau Numérique 3D** :
   - Télémétrie en temps réel via Server-Sent Events (SSE).
   - Visualisation BIM 3D Canvas et Mission Control Cockpit.
   - Détection d'anomalies fluidiques (HydroSync) et pilotage DALI-2/KNX.

4. **Cybersécurité & Auditabilité** :
   - Journalisation immuable de toutes les opérations de modification (`/api/audit-logs`).
   - Assainissement XSS récursif et en-têtes HTTP durcis (`Helmet`, `HSTS`, `X-Frame-Options`).
   - Protection contre le déni de service (Rate Limiting adaptatif par IP).

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+ ou 22+
- npm 10+

### Installation & Lancement en Développement
```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env

# 3. Lancer en mode développement (Serveur API + Vite HMR)
npm run dev
```

L'application est disponible sur : **http://localhost:3000**

---

## 🔌 Cartographie des Endpoints API

| Domaine | Route | Méthodes | Description |
| :--- | :--- | :---: | :--- |
| **Santé** | `/api/health` | `GET` | Statut du serveur et environnement |
| **GMAO Actifs** | `/api/assets` | `GET, POST, PUT, DELETE` | Inventaire et statistiques des équipements |
| **Ordres de Travail** | `/api/workorders` | `GET, POST, PUT, DELETE` | Gestion des tickets et interventions de maintenance |
| **Bâtiments / Sites** | `/api/buildings`, `/api/sites` | `GET, POST, PUT, DELETE` | Données patrimoniales et surfaces |
| **Stocks MRO** | `/api/mro/inventory`, `/api/mro/alerts` | `GET, POST, PUT` | Inventaire pièces de rechange et alertes rupture |
| **Audit Logs** | `/api/audit-logs` | `GET` | Journal immuable des mutations système |
| **Exports** | `/api/export/assets`, `/api/export/workorders` | `GET` | Export analytique CSV (compatible Excel) et JSON |
| **Fluides & Éclairage** | `/api/lighting/zones`, `/api/water/sectors` | `GET, PUT` | Pilotage DALI et vannes HydroSync |
| **RSE & Carbone** | `/api/esg`, `/api/energy-timeseries` | `GET, PUT` | Métriques CSRD et historiques énergétiques |
| **Temps Réel** | `/api/events` | `GET` | Flux Server-Sent Events (SSE) |
| **Intelligence IA** | `/api/gemini/analyze`, `/api/ai/predict` | `POST` | Copilote IA et prédiction de pannes |
| **Facturation** | `/api/payments/*`, `/api/paypal/*` | `GET, POST` | Passerelle PayPal et abonnements |

---

## 🐳 Déploiement Docker & Production

### Lancer la stack complète (App + PostgreSQL 16 + Redis)
```bash
docker compose up -d --build
```

### Vérifier les services
```bash
docker compose ps
docker compose logs -f app
```

---

## 🔒 Sécurité & Gouvernance

- **Zéro Régression Frontend** : Tous les contrats de données de l'interface utilisateur sont rigoureusement respectés.
- **Résilience** : Bascule automatique en mémoire tampon en cas d'indisponibilité momentanée de PostgreSQL.
- **Conformité** : Traçabilité complète des modifications selon les standards RGPD et CSRD.

---

## 📚 Documentation Complémentaire

- [Guide d'Exploitation GMAO](docs/GMAO_DOCS.md)
- [Plan d'Action Technique](docs/PLAN_ACTION.md)
- [Guide de Contribution](CONTRIBUTING.md)
