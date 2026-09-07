/**
 * Test de charge progressif pour CAFM API
 * Usage: k6 run --out json=results.json performance/k6-load-test.js
 * Avec dashboard: K6_WEB_DASHBOARD=true k6 run --out web-dashboard performance/k6-load-test.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const dashboardDuration = new Trend('dashboard_duration');
const contactsDuration = new Trend('contacts_duration');
const successfulOps = new Counter('successful_operations');

// Configuration progressive : 10 → 50 → 100 → 200 users
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm-up
    { duration: '1m', target: 50 },    // Ramp-up
    { duration: '2m', target: 100 },   // Charge normale
    { duration: '2m', target: 200 },   // Pic de charge
    { duration: '1m', target: 50 },    // Ramp-down
    { duration: '30s', target: 0 }     // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'], // 95% < 500ms, 99% < 1.5s
    http_req_failed: ['rate<0.01'],                  // < 1% d'erreurs
    errors: ['rate<0.05'],                           // < 5% d'erreurs métier
    login_duration: ['p(95)<800'],
    dashboard_duration: ['p(95)<1000']
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export function setup() {
  // Obtenir un token avant le test
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@cafm.com',
    password: 'admin123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (loginRes.status !== 200) {
    throw new Error(`Login setup failed: ${loginRes.status}`);
  }

  return { token: loginRes.json('token') };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`
  };

  // ============== SCÉNARIO 1: Dashboard ==============
  group('Dashboard Load', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/dashboard/executive`, { headers });
    dashboardDuration.add(Date.now() - start);

    const success = check(res, {
      'dashboard status 200': (r) => r.status === 200,
      'dashboard has kpis': (r) => r.json('kpis') !== undefined,
      'dashboard has assets': (r) => r.json('kpis.assets.total') !== undefined,
      'response time < 1s': (r) => r.timings.duration < 1000
    });

    if (success) {
      successfulOps.add(1);
      errorRate.add(false);
    } else {
      errorRate.add(true);
    }
  });

  sleep(1);

  // ============== SCÉNARIO 2: Login (simulation nouveaux users) ==============
  group('Login Flow', () => {
    const start = Date.now();
    const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: 'admin@cafm.com',
      password: 'admin123'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    loginDuration.add(Date.now() - start);

    check(res, {
      'login status 200': (r) => r.status === 200,
      'login returns token': (r) => r.json('token') !== undefined,
      'login response time < 800ms': (r) => r.timings.duration < 800
    });
  });

  sleep(0.5);

  // ============== SCÉNARIO 3: Contacts CRUD ==============
  group('Contacts Operations', () => {
    // GET liste
    const listStart = Date.now();
    const listRes = http.get(`${BASE_URL}/api/contacts?page=1&limit=25`, { headers });
    contactsDuration.add(Date.now() - listStart);

    check(listRes, {
      'contacts list 200': (r) => r.status === 200,
      'contacts has pagination': (r) => r.json('pagination') !== undefined
    });

    sleep(0.3);

    // POST création
    const createRes = http.post(`${BASE_URL}/api/contacts`, JSON.stringify({
      firstName: `Test${__VU}`,
      lastName: `User${__ITER}`,
      email: `test${__VU}_${__ITER}@perf.com`,
      type: 'LEAD',
      company: 'Perf Test Co'
    }), { headers });

    check(createRes, {
      'create contact 201': (r) => r.status === 201,
      'create returns id': (r) => r.json('id') !== undefined
    });

    sleep(0.5);

    // Recherche
    const searchRes = http.get(`${BASE_URL}/api/contacts?search=Test${__VU}`, { headers });
    check(searchRes, {
      'search 200': (r) => r.status === 200,
      'search has results': (r) => Array.isArray(r.json('contacts'))
    });
  });

  sleep(1);

  // ============== SCÉNARIO 4: Assets (lecture intensive) ==============
  group('Assets Read', () => {
    const res = http.get(`${BASE_URL}/api/assets?limit=50`, { headers });
    check(res, {
      'assets 200': (r) => r.status === 200,
      'assets is array': (r) => Array.isArray(r.json())
    });
  });

  sleep(0.5);

  // ============== SCÉNARIO 5: Work Orders ==============
  group('Work Orders', () => {
    const listRes = http.get(`${BASE_URL}/api/workorders`, { headers });
    check(listRes, {
      'workorders 200': (r) => r.status === 200
    });

    sleep(0.3);

    // Stats
    const statsRes = http.get(`${BASE_URL}/api/dashboard/kpis`, { headers });
    check(statsRes, {
      'kpis 200': (r) => r.status === 200
    });
  });

  sleep(2); // Pause réaliste entre itérations
}

export function handleSummary(data) {
  return {
    'performance/results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

function textSummary(data, opts) {
  const indent = opts.indent || '';
  const colors = opts.enableColors;
  const c = colors ? {
    reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
    blue: '\x1b[34m', gray: '\x1b[90m'
  } : { reset: '', green: '', red: '', yellow: '', blue: '', gray: '' };

  let out = `\n${c.blue}═══════════════════════════════════════════${c.reset}\n`;
  out += `${c.blue}       📊 RAPPORT TEST DE CHARGE k6${c.reset}\n`;
  out += `${c.blue}═══════════════════════════════════════════${c.reset}\n\n`;

  const metrics = data.metrics;
  out += `${c.gray}Requêtes totales :${c.reset} ${metrics.http_reqs.values.count}\n`;
  out += `${c.gray}Durée totale :${c.reset} ${(data.state.testRunDurationMs / 1000).toFixed(1)}s\n\n`;

  // Temps de réponse
  const duration = metrics.http_req_duration.values;
  out += `${c.yellow}⏱️  Temps de réponse${c.reset}\n`;
  out += `  p50: ${duration['p(50)'].toFixed(1)}ms\n`;
  out += `  p95: ${duration['p(95)'].toFixed(1)}ms\n`;
  out += `  p99: ${duration['p(99)'].toFixed(1)}ms\n\n`;

  // Erreurs
  const failed = metrics.http_req_failed.values;
  out += `${failed.rate < 0.01 ? c.green : c.red}❌ Taux d'erreur : ${(failed.rate * 100).toFixed(2)}%${c.reset}\n\n`;

  return out;
}
