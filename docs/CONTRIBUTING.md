# Guide de Contribution (CONTRIBUTING.md)

Bienvenue dans le projet BeeCarbonat GMAO / BizOS !

## Architecture Backend
Le serveur utilise Express.js et TypeScript. Nous suivons une architecture modulaire :
- `src/server/routes/` : Définition des endpoints d'API (Express Router).
- `src/server/controllers/` : Logique métier et manipulation des données.
- `src/server/middlewares/` : Sécurité, validation et logging.

## Règles de développement
1. **Pas de logique métier dans `server.ts`** : Le point d'entrée doit rester minimaliste (initialisation et branchement des routes).
2. **Types stricts** : Utilisez TypeScript avec la plus grande précision (évitez les `any`).
3. **Tests** : Tout nouveau module critique (MRO, IA) doit être accompagné de tests Jest.

## Processus de validation
- Créez une branche feature (`feature/nom-du-module`).
- La CI vérifiera la sécurité (npm audit) et le linting.
- Déploiement automatique sur Vercel/Cloud Run post-validation.
