---
description: Gestion des fichiers dans l'application ReclamTrack — conventions, création, modification, suppression, documentation des corrections
---

# 🗂️ Agent de Gestion des Fichiers — ReclamTrack

// turbo-all

Ce workflow définit les règles strictes que l'agent doit suivre pour **créer, modifier, supprimer ou renommer** des fichiers dans le projet ReclamTrack. Il couvre le backend, le frontend et le dossier shared.

---

## 📁 Structure du Projet

```
reclamtrack/
├── backend/
│   └── src/
│       ├── config/        → Configuration (DB, env, Kafka)
│       ├── controllers/   → Logique métier extraite des routes (si applicable)
│       ├── dto/           → Data Transfer Objects (validation des entrées)
│       ├── middleware/    → Middlewares Express (auth, error, rate-limit, etc.)
│       ├── models/        → Modèles Mongoose
│       ├── routes/        → Définitions des routes API
│       ├── services/      → Services métier (email, SSH, token, etc.)
│       ├── types/         → Types TypeScript globaux (express.d.ts)
│       ├── utils/         → Utilitaires (logger, apiResponse, AppError)
│       └── index.ts       → Point d'entrée serveur
├── frontend/
│   └── src/
│       ├── app/           → Pages Next.js (App Router)
│       ├── components/    → Composants React réutilisables
│       ├── hooks/         → Custom React hooks
│       ├── lib/           → Librairies (api.ts, authStore.ts, etc.)
│       ├── store/         → Zustand stores
│       └── types/         → Types TypeScript frontend
├── shared/
│   └── src/              → Types partagés frontend/backend
└── .agents/
    └── workflows/         → Fichiers de workflow agent (ce dossier)
```

---

## 📏 Conventions de Nommage

### Backend

| Type de fichier | Convention            | Exemple                                |
| --------------- | --------------------- | -------------------------------------- |
| Route           | `kebab-case.ts`       | `api-keys.ts`, `ssh-management.ts`     |
| Modèle Mongoose | `PascalCase.ts`       | `RefreshToken.ts`, `ApiKey.ts`         |
| Service         | `camelCaseService.ts` | `tokenService.ts`, `sshService.ts`     |
| Middleware      | `camelCase.ts`        | `rateLimiters.ts`, `requestId.ts`      |
| DTO             | `camelCase.dto.ts`    | `auth.dto.ts`, `complaint.dto.ts`      |
| Test            | `nom.test.ts`         | `auth.test.ts`, `tokenService.test.ts` |
| Utilitaire      | `camelCase.ts`        | `AppError.ts`, `apiResponse.ts`        |

### Frontend

| Type de fichier | Convention                    | Exemple                       |
| --------------- | ----------------------------- | ----------------------------- |
| Page Next.js    | `page.tsx` dans dossier route | `app/[locale]/admin/page.tsx` |
| Composant React | `PascalCase.tsx`              | `SecurityCenter.tsx`          |
| Hook            | `useCamelCase.ts`             | `useApiKeys.ts`               |
| Store Zustand   | `camelCaseStore.ts`           | `authStore.ts`                |
| Type partagé    | `camelCase.types.ts`          | `api.types.ts`                |

---

## ✅ Étapes — Créer un Nouveau Fichier

1. **Vérifier** que le fichier n'existe pas déjà (utiliser `find_by_name` ou `grep_search`)
2. **Choisir le bon répertoire** selon le tableau de structure ci-dessus
3. **Respecter la convention de nommage** du type de fichier concerné
4. **Ajouter l'en-tête JSDoc** au début du fichier :
   ```typescript
   /**
    * @file NomDuFichier.ts
    * @description Courte description du rôle du fichier
    * @module backend/services (ou middleware, routes, etc.)
    */
   ```
5. **Documenter les exports principaux** avec JSDoc (`@param`, `@returns`, `@throws`)
6. **Ajouter un test** dans `backend/tests/` ou `frontend/src/__tests__/` si logique métier
7. **Mettre à jour `index.ts`** si c'est une nouvelle route ou un nouveau middleware global
8. Vérifier la compilation : `cd backend && npm run build` (0 erreurs TypeScript)

---

## ✏️ Étapes — Modifier un Fichier Existant

1. **Lire le fichier entier** avec `view_file` avant toute modification
2. **Identifier les imports** qui pourraient être impactés dans d'autres fichiers (`grep_search`)
3. **Ne jamais supprimer un export sans vérifier** tous ses consommateurs
4. Si changement d'interface TypeScript : **mettre à jour tous les fichiers** qui utilisent ce type
5. **Préserver la signature des fonctions publiques** pour la rétrocompatibilité
6. **Documenter le changement** avec un commentaire si la raison n'est pas évidente
7. Re-vérifier `npm run build` après modification

---

## 🗑️ Étapes — Supprimer un Fichier

1. **Rechercher toutes les utilisations** : `grep_search` sur le nom du fichier et ses exports
2. **Remplacer tous les imports** cassés dans les fichiers consommateurs
3. **Supprimer le fichier** uniquement après que tous les imports soient mis à jour
4. **Ne jamais supprimer** sans créer le fichier de remplacement d'abord (si applicable)
5. Vérifier `npm run build` — 0 erreurs avant de valider

### Fichiers à supprimer dans le cadre de l'overhaul backend :

- `backend/src/middleware/auth.ts` → remplacé par `security.ts`
- `backend/src/middleware/organization.ts` → remplacé par `security.ts`

**Ordre obligatoire** :

1. Mettre à jour tous les `import { protect } from '../middleware/auth.js'` → `import { authenticate } from '../middleware/security.js'`
2. Mettre à jour tous les `import { requireOrganization } from '../middleware/organization.js'` → `import { requireOrganization } from '../middleware/security.js'`
3. Supprimer les fichiers obsolètes

---

## 🔒 Règles de Sécurité Fichiers

- **Jamais** stocker de secrets (clés API, mots de passe, tokens) dans le code source
- **Jamais** committer `.env` — vérifier `.gitignore` à chaque nouveau fichier de config
- **Clés SSH** : référencées uniquement par chemin via `SSH_PRIVATE_KEY_PATH` dans l'env
- **Hachage** : les API keys et refresh tokens sont **toujours** stockés hachés (SHA-256 ou bcrypt)
- **Logs** : ne jamais logger de token, mot de passe ou clé SSH

---

## 📦 Règles pour les DTOs (`backend/src/dto/`)

Chaque DTO doit :

1. Exporter une **interface TypeScript** nommée `[Action][Ressource]Dto` (ex: `CreateComplaintDto`)
2. Exporter un **tableau de validations express-validator** nommé `[action][Ressource]Validators`
3. Ne contenir **aucune logique métier** — uniquement types + règles de validation

```typescript
// Exemple : auth.dto.ts
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export const registerValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  body("name").optional().trim().isLength({ max: 100 }),
];
```

---

## 🔄 Règles pour les Services (`backend/src/services/`)

Chaque service doit :

1. Être une **classe ou un ensemble de fonctions pures** exportées
2. Ne pas importer directement `Request/Response` Express — c'est le rôle des routes
3. Lancer des **`AppError`** (depuis `utils/AppError.ts`) plutôt que des erreurs génériques
4. Être **testable indépendamment** des routes

---

## 🧪 Règles pour les Tests (`backend/tests/`)

1. Un fichier de test par service / middleware / route principale
2. Nommage : `[fichier].test.ts`
3. Toujours mocker les dépendances externes (Mongoose, Stripe, SSH, JWT)
4. Tester les **cas d'erreur** en priorité (token invalide, DB unreachable, etc.)
5. Commande d'exécution :
   ```bash
   cd "c:/Users/pc gold/projet dash/ticket/reclamtrack/backend"
   npm test
   ```

---

## 📋 Checklist Avant Tout Commit

- [ ] `npm run build` sans erreur TypeScript
- [ ] `npm test` — tous les tests passent
- [ ] Aucun `console.log` non intentionnel (utiliser `logger.ts`)
- [ ] Aucun secret dans le code source
- [ ] JSDoc sur tous les exports publics
- [ ] Imports triés : stdlib → node_modules → modules internes
- [ ] Pas de fichier dupliqué (vérifier avant création)
