/**
 * Script de vérification automatisée des endpoints API BeeCarbonat
 * Usage : node scripts/verify-api.js [BASE_URL]
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const endpoints = [
  { path: '/api/health', method: 'GET', expectStatus: 200 },
  { path: '/api/assets', method: 'GET', expectStatus: 200 },
  { path: '/api/assets/stats', method: 'GET', expectStatus: 200 },
  { path: '/api/workorders', method: 'GET', expectStatus: 200 },
  { path: '/api/buildings', method: 'GET', expectStatus: 200 },
  { path: '/api/sites', method: 'GET', expectStatus: 200 },
  { path: '/api/leases', method: 'GET', expectStatus: 200 },
  { path: '/api/telemetry', method: 'GET', expectStatus: 200 },
  { path: '/api/lighting/zones', method: 'GET', expectStatus: 200 },
  { path: '/api/water/sectors', method: 'GET', expectStatus: 200 },
  { path: '/api/field-operators', method: 'GET', expectStatus: 200 },
  { path: '/api/esg', method: 'GET', expectStatus: 200 },
  { path: '/api/spaces', method: 'GET', expectStatus: 200 },
  { path: '/api/energy-timeseries', method: 'GET', expectStatus: 200 },
  { path: '/api/dashboard', method: 'GET', expectStatus: 200 },
  { path: '/api/grafana/overview', method: 'GET', expectStatus: 200 },
  { path: '/api/rubrics/diagnostics', method: 'GET', expectStatus: 200 },
  { path: '/api/db-status', method: 'GET', expectStatus: 200 },
  { path: '/api/paypal/config', method: 'GET', expectStatus: 200 },
  { path: '/api/mro/inventory', method: 'GET', expectStatus: 200 },
  { path: '/api/mro/alerts', method: 'GET', expectStatus: 200 },
  { path: '/api/audit-logs', method: 'GET', expectStatus: 200 },
  { path: '/api/export/assets?format=json', method: 'GET', expectStatus: 200 },
];

async function runVerification() {
  console.log(`\n🔍 Lancement de la vérification des endpoints sur ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  for (const ep of endpoints) {
    const url = `${BASE_URL}${ep.path}`;
    try {
      const response = await fetch(url, { method: ep.method });
      if (response.status === ep.expectStatus) {
        console.log(`✅ [${response.status}] ${ep.method} ${ep.path}`);
        passed++;
      } else {
        console.error(`❌ [${response.status}] ${ep.method} ${ep.path} (Attendu: ${ep.expectStatus})`);
        failed++;
      }
    } catch (err) {
      console.error(`⚠️ [OFFLINE] ${ep.method} ${ep.path} — Erreur: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Résultat : ${passed} passés, ${failed} échoués sur ${endpoints.length} endpoints testés.\n`);
  if (failed > 0) process.exit(1);
}

runVerification();
