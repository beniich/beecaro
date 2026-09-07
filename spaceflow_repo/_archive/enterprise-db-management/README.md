# Enterprise DB Management + RosterFlow Scheduler

Ce projet contient un prototype de tableau de bord d'administration de bases de données, avec un frontend React/Tailwind et un backend Node/Express/Socket.io. Il intègre désormais le module **RosterFlow Scheduler** pour la gestion des équipes et de la planification.

## Fonctionnalités

### Database Management
- Dashboard de métriques en temps réel
- Gestion des répliques et backups
- Logs d'audit et analyses de sécurité
- Politiques de rétention

### RosterFlow Scheduler
- **Planificateur principal** : Vue Gantt des équipes et affectations
- **Gestion des équipes** : Capacité, fatigue, ressources par équipe
- **Résolution de conflits** : Détection automatique et suggestions IA
- **Affectation intelligente** : Recommandations basées sur les compétences

## Installation et Lancement

### Pré-requis
- Docker et Docker Compose
- OU Node.js pour le lancement local

### Lancement avec Docker (Recommandé)

1.  À la racine du dossier `enterprise-db-management` :
    ```bash
    docker compose up -d --build
    ```
2.  Accédez à l'application :
    -   Frontend : http://localhost:3001
    -   API : http://localhost:4001

### Lancement Local (Développement)

1.  **Backend** :
    ```bash
    cd backend
    npm install
    npm run dev
    ```

2.  **Frontend** :
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Le frontend sera accessible sur http://localhost:3001

## Structure

-   `backend/` : API Express et WebSocket
-   `frontend/` : Application React avec Tailwind CSS
    -   `src/pages/` : Pages de l'application (Dashboard, Audit Logs, etc.)
    -   `src/pages/scheduler/` : Module RosterFlow Scheduler
        -   `SchedulerMain.jsx` : Vue principale Gantt
        -   `TeamCapacity.jsx` : Détails d'équipe
        -   `ConflictResolution.jsx` : Résolution de conflits
    -   `src/components/` : Composants réutilisables

## Navigation

- `/` - Dashboard principal
- `/audit-logs` - Logs d'audit
- `/security-analytics` - Analyses de sécurité
- `/retention-policy` - Politiques de rétention
- `/forensic-detail` - Détails forensiques
- `/scheduler` - Planificateur RosterFlow
- `/scheduler/team/:teamId` - Détails d'une équipe
- `/scheduler/conflicts` - Centre de résolution de conflits

