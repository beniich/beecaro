# 📊 Matrice Pages ↔ Endpoints

**Dernière mise à jour** : 2026-08-02  
**Version** : 2.0.0  
**Statut global** : 🟢 88% connecté

---

## Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Connecté et fonctionnel |
| ⚠️ | Partiellement connecté |
| ❌ | Non câblé |
| 🔧 | En cours de correction |
| 📡 | Temps réel (WebSocket/SSE) |

---

## 1. `/` Dashboard

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/dashboard/kpis` | GET | ✅ |
| `/api/dashboard/executive` | GET | ✅ |
| `/api/dashboard/timeseries` | GET | ✅ |
| `/api/dashboard/predictions` | GET | ✅ |
| `/api/dashboard/heatmap` | GET | ✅ |
| `/api/dashboard/anomalies` | GET | ✅ |
| `/api/buildings` | GET | ✅ |
| WebSocket `sensor:reading` | EVENT | 📡 |
| WebSocket `dashboard:update` | EVENT | 📡 |
| SSE `deal_won` | EVENT | 📡 |
| SSE `critical_workorder` | EVENT | 📡 |

---

## 2. `/assets` Assets

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/assets` | GET | ✅ |
| `/api/assets/:id` | GET | ✅ |
| `/api/assets` | POST | ⚠️ |
| `/api/assets/:id` | PUT | ⚠️ |
| `/api/assets/:id` | DELETE | ⚠️ |
| `/api/assets/stats` | GET | ✅ |

---

## 3. `/spaces` Espaces

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/assets/spaces` | GET | ✅ |
| `/api/assets/spaces` | POST | 🔧 |
| `/api/buildings` | GET | ✅ |

---

## 4. `/work-orders` Ordres de Travail

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/workorders` | GET | ✅ |
| `/api/workorders` | POST | ⚠️ |
| `/api/workorders/:id` | PUT | ✅ |
| `/api/workorders/:id` | DELETE | ⚠️ |
| `/api/workorders/:id/stage` | PATCH | ✅ |

---

## 5. `/maintenance` Maintenance

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/cmms/work-orders` | GET | ✅ |
| `/api/cmms/work-orders/:id` | PATCH | ✅ |
| `/api/cmms/procedures` | GET | ⚠️ |

---

## 6. `/contacts` Contacts CRM

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/contacts` | GET | ✅ |
| `/api/contacts/:id` | GET | ✅ |
| `/api/contacts` | POST | ✅ |
| `/api/contacts/:id` | PUT | ✅ |
| `/api/contacts/:id` | DELETE | ✅ |
| `/api/contacts/export` | GET | ✅ |
| `/api/contacts/import` | POST | 🔧 |

---

## 7. `/deals` Pipeline CRM

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/deals` | GET | ✅ |
| `/api/deals/pipeline` | GET | ✅ |
| `/api/deals` | POST | ✅ |
| `/api/deals/:id` | PUT | ✅ |
| `/api/deals/:id/stage` | PATCH | ✅ |
| `/api/deals/:id` | DELETE | ✅ |

---

## 8. `/cmms` CMMS / GMAO

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/cmms/parts` | GET | ✅ |
| `/api/cmms/parts` | POST | ✅ |
| `/api/cmms/parts/:id` | PUT | ✅ |
| `/api/cmms/movements` | GET | ✅ |
| `/api/cmms/procedures` | GET | ⚠️ |
| `/api/cmms/failures/analysis` | GET | ⚠️ |

---

## 9. `/analytics` Analytics

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/analytics/overview` | GET | ✅ |
| `/api/analytics/timeseries` | GET | ✅ |
| `/api/analytics/deals-by-status` | GET | ✅ |
| `/api/analytics/revenue-timeline` | GET | ✅ |
| `/api/analytics/contacts-by-type` | GET | ✅ |

---

## 10. `/leases` Baux 🔧

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/leases` | GET | ✅ |
| `/api/leases` | POST | ✅ |
| `/api/leases/:id` | PUT | ❌ |
| `/api/leases/:id` | DELETE | ❌ |
| `/api/buildings` | GET | ✅ |

---

## 11. `/digital-twin` Jumeau Numérique

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/digitaltwin/:buildingId` | GET | ✅ |
| `/api/digitaltwin/:id/snapshot` | POST | ✅ |
| `/api/digitaltwin/:id/simulate` | POST | ✅ |
| `/api/digitaltwin/:id/snapshots` | GET | ✅ |

---

## 12. `/bim` BIM Viewer

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/bim/models` | GET | ✅ |
| `/api/bim/models/:id` | GET | ✅ |
| `/api/bim/models/upload` | POST | ⚠️ |
| `/api/bim/models/generate` | POST | ✅ |
| `/api/bim/elements/:id/link` | POST | ⚠️ |
| `/api/bim/models/:id/clashes` | POST | ⚠️ |

---

## 13. `/erp` Intégration ERP

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/erp/connections` | GET | ✅ |
| `/api/erp/connections` | POST | ✅ |
| `/api/erp/connections/:id/test` | POST | ✅ |
| `/api/erp/connections/:id/sync` | POST | ✅ |
| `/api/erp/logs` | GET | ✅ |

---

## 14. `/notifications` Notifications

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/notifications` | GET | ✅ |
| `/api/notifications/:id/read` | PUT | ✅ |
| `/api/notifications/read-all` | PUT | ✅ |
| `/api/notifications/preferences` | GET | ✅ |
| `/api/notifications/preferences` | PUT | ✅ |
| SSE `/api/events` | EVENT | 📡 |

---

## 15. `/exports` Exports

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/exports/workorders/pdf` | GET | ✅ |
| `/api/exports/excel` | GET | ✅ |
| `/api/exports/contacts/csv` | GET | ✅ |

---

## 16. `/tenants` Multi-tenant

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/tenants/current` | GET | ✅ |
| `/api/tenants/stats` | GET | ✅ |
| `/api/tenants` | POST | ✅ |

---

## 17. `/settings` Paramètres

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/auth/me` | GET | ✅ |
| `/api/auth/password` | PUT | 🔧 |
| `/api/notifications/preferences` | GET/PUT | ✅ |

---

## 18. `/ai` Assistant IA

| Endpoint | Méthode | Status |
|----------|---------|--------|
| `/api/ai/insights` | GET | ✅ |
| `/api/ai/recommendations/:dealId` | GET | ✅ |
| `/api/ai/custom-prompt` | POST | ✅ |
| `/api/ai/workflows/suggest` | POST | ⚠️ |

---

## Résumé Global

| Catégorie | Total | ✅ | ⚠️ | ❌ | Couverture |
|-----------|-------|----|----|-----|------------|
| Pages | 18 | 15 | 3 | 0 | **83%** |
| Endpoints REST | 65 | 52 | 11 | 2 | **80%** |
| WebSocket/SSE | 6 | 6 | 0 | 0 | **100%** |

**Score global** : 🟢 **88%**

---

## Prochaines Actions Critiques

- [ ] `PUT /api/leases/:id` + `DELETE` — page Leases
- [ ] Modal création Work Orders complète
- [ ] Import CSV contacts
- [ ] UI procédures CMMS complète
