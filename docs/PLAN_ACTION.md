# Plan d'Action & Feuille de Route Technique — BeeCarbonat

Ce document synthétise les axes d'amélioration continue, d'industrialisation et de mise à l'échelle pour l'architecture BeeCarbonat (GMAO, Décarbonation & Smart Building).

---

## 1. Vision & Objectifs Stratégiques

1. **Fiabilité & Haute Disponibilité** : Architecture résiliente avec bascule automatique mémoire/PostgreSQL (Drizzle ORM).
2. **Gouvernance ESG & Conformité** : Calcul et traçabilité des émissions Scope 1, 2 et 3, conformité CSRD/Décret Tertiaire.
3. **Cybersécurité & Auditabilité** : En-têtes durcis, journalisation immuable des mutations (Audit Logs), limitation de débit.
4. **Expérience Opérationnelle Temps Réel** : Jumeau numérique synchronisé via SSE/WebSockets, alertes critiques sans latence.

---

## 2. Découpage par Phase

### Phase 1 : Hygiène, Sécurité & Qualité de Code
- [x] Standardisation du formatage (`.editorconfig`, `.prettierrc.json`, `.eslintrc.json`).
- [x] Workflows CI/CD GitHub Actions (`ci.yml`, `security.yml`).
- [x] Documentation d'exploitation GMAO (`docs/GMAO_DOCS.md`).
- [x] En-têtes de sécurité HTTP & Assainissement XSS (`security.middleware.ts`).

### Phase 2 : Modularisation Backend & Performance
- [x] Extraction de la couche persistance & migrations (`src/server/config/`).
- [x] Découpage des routes par domaine métier (`src/server/routes/`).
- [x] Gestion centralisée des magasins de données et caches mémoire (`src/server/stores.ts`).
- [x] Réduction du point d'entrée `server.ts` à un composant de composition propre.

### Phase 3 : Enrichissement Fonctionnel & Observabilité
- [x] Flux Server-Sent Events (SSE) pour jumeau numérique et alertes (`/api/events`).
- [x] Export analytique multiformat (Excel / CSV / JSON) des métriques GMAO & ESG.
- [x] Module de gestion des stocks MRO (Pièces critiques, seuils de réapprovisionnement).
- [x] Journal d'audit immuable (interception des mutations d'équipements et d'ordres de travail).
- [x] Métriques Prometheus / Grafana pour la supervision système.

---

## 3. Matrice des Priorités Techniques

| Chantier | Priorité | Risque | Impact Métier |
| :--- | :---: | :---: | :---: |
| Modularisation Backend | Critique | Faible | Clarté, maintenance, tests |
| Journalisation Immuable | Élevée | Faible | Conformité réglementaire |
| Stocks MRO & Alertes | Moyenne | Faible | Optimisation des opérations terrain |
| Export Analytique | Moyenne | Faible | Reporting direction & RSE |

---

## 4. Règles de Déploiement & Rollback

- **Validation Statique** : Tout commit doit valider la compilation TypeScript (`tsc --noEmit`) et les tests d'intégration.
- **Zéro Régression Frontend** : L'interface React/Tailwind/Vite reste inchangée au niveau du contrat d'API (`/api/*`).
- **Mode Hybride Dégradé** : Si la base PostgreSQL est injoignable, le serveur opère sur les magasins mémoires avec avertissement dans les journaux.
