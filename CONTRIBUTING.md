# Guide de Contribution — BeeCarbonat

Merci de contribuer au projet **BeeCarbonat** (Plateforme GMAO, Décarbonation ESG & Jumeau Numérique Bâtiment).

---

## 1. Environnement de Développement

### Prérequis
- **Node.js** : v20.x ou supérieur
- **npm** : v10.x ou supérieur
- **PostgreSQL** : v14+ (recommandé pour persistance, sinon mode mémoire automatique)

### Installation
```bash
git clone <repo-url>
cd beecaro
npm install
```

### Variables d'Environnement
Copier le fichier exemple ou configurer `.env` :
```env
PORT=3000
DATABASE_URL=postgres://postgres:password@localhost:5432/beecarbonat
NODE_ENV=development
```

### Lancement
```bash
npm run dev
```

---

## 2. Standards de Code

### Conventions TypeScript & React
- **Typage Strict** : Pas de types `any` non justifiés. Utiliser les interfaces définies dans `src/types/`.
- **Composants Fonctionnels** : Hooks React standards (`useState`, `useEffect`, `useCallback`).
- **Styles** : Tailwind CSS v4 avec tokens utilitaires définis dans `index.css`.
- **Immutabilité** : Ne jamais muter l'état directement.

### Conventions Backend (Express)
- **Modularité** : Séparation stricte `routes/` -> `controllers/` -> `db/`.
- **Idempotence & Validation** : Assainir les entrées avec `sanitizeInput`.
- **Résilience** : Toujours prévoir le fallback mémoire si PostgreSQL est absent.
- **Codes HTTP** :
  - `200 OK` / `201 Created` pour les succès.
  - `400 Bad Request` pour les données invalides.
  - `404 Not Found` pour les ressources introuvables.
  - `500 Internal Server Error` avec message d'erreur clair.

---

## 3. Workflow Git & Pull Requests

1. **Branches** :
   - `feat/nom-fonctionnalite` pour les nouveautés.
   - `fix/nom-correctif` pour les bugs.
   - `refactor/nom-refactoring` pour le nettoyage de code.
2. **Messages de Commit** (Conventional Commits) :
   - `feat(gmao): ajout du suivi des stocks MRO`
   - `fix(telemetry): correction du calcul de dérive énergétique`
   - `refactor(server): modularisation des routes d'ordres de travail`
3. **Validation avant Commit** :
   ```bash
   npm run build
   ```

---

## 4. Signalement de Bogues & Sécurité

Pour tout signalement de vulnérabilité, ne pas ouvrir d'issue publique. Utiliser le protocole de divulgation responsable ou contacter directement l'équipe d'infrastructure.
