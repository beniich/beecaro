# Architecture — BeeCarbonat

## Vue d'ensemble

Application GMAO multi-tenant SaaS déployée en architecture **monolithique
modulaire** conteneurisée.

## Composants

| Service    | Technologie       | Port  | Rôle                          |
|------------|-------------------|-------|-------------------------------|
| nginx      | nginx:alpine      | 80/443| Reverse proxy, SSL, routing   |
| frontend   | React + Vite      | 80    | SPA servie par nginx interne  |
| backend    | Express.js 4      | 5000  | API REST + WebSockets         |
| postgres   | PostgreSQL 16     | 5432  | Base de données principale    |
| redis      | Redis 7           | 6379  | Cache, BullMQ, sessions       |

## Modules backend

- Auth (JWT)
- Assets / Equipment
- Tickets / Complaints
- Work Orders
- CMMS / GMAO
- Maintenance préventive
- Analytics (KPIs, MTBF, MTTR, OEE)
- Digital Twin / BIM
- AI Assistant (Gemini)
- CRM
- Workflows
- Marketplace
- ERP Integration
- Notifications (Push + Email)
- Uploads (S3)

## Flux de données

```
Client (SPA)
  │
  ├─ HTTPS ──▶ Nginx ──▶ Frontend (static)
  │                  └─▶ Backend (API + Socket.io)
  │                        ├─▶ PostgreSQL (Prisma)
  │                        ├─▶ Redis (BullMQ jobs)
  │                        └─▶ Services externes (Sentry, Stripe, S3, Gemini)
```

## Environnements

- **dev** : docker-compose local, hot reload
- **staging** : même architecture, Neon DB staging, Sentry staging
- **prod** : Nginx + Certbot, Neon DB prod, Sentry prod, Stripe live

## Sécurité

- HTTPS obligatoire (Certbot)
- JWT signé (HS256, rotation possible)
- CORS strict (CORS_ORIGIN)
- Headers de sécurité Nginx (X-Frame-Options, CSP, etc.)
- Variables sensibles uniquement dans `.env` (jamais commit)
- Pas de firebase-admin côté client

## Monitoring

- Sentry (errors + traces)
- Prometheus + Grafana (métriques, à venir)
- Logs structurés JSON
- Health checks Docker
