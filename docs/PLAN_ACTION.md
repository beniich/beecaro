# Plan d'Action - BeeCarbonat GMAO / BizOS

## Phase 1 : Fondation & Sécurité (Réalisé)
- [x] Configuration CI/CD (Github Actions).
- [x] Hygiène de code (Prettier, EditorConfig, ESLint).
- [x] Middlewares de base (Helmet, Rate Limiter).

## Phase 2 : Refactoring Modulaire (En cours)
- [ ] Extraction des modules depuis server.ts vers src/server/routes et src/server/controllers.
- [ ] Déploiement des domaines : Assets, WorkOrders, Buildings, Leases, Telemetry, ESG.
- [ ] Objectif final : server.ts < 150 lignes, uniquement chargé de l'initialisation.

## Phase 3 : Fonctionnalités Avancées
- [x] SSE & Télémétrie basique.
- [x] Endpoints MRO (Pièces détachées) et Analytics.
- [ ] Implémentation du Jumeau Numérique (BIM/3D Viewer avancé).
- [ ] Jalonnement prédictif via IA (Maintenance prévisionnelle).
