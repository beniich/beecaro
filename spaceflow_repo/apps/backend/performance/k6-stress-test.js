/**
 * Stress test : pousse l'API jusqu'au point de rupture
 * Usage: k6 run performance/k6-stress-test.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 800 },  // Point de rupture probable
    { duration: '2m', target: 500 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(99)<3000'],
    http_req_failed: ['rate<0.05']
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export function setup() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@cafm.com',
    password: 'admin123'
  }), { headers: { 'Content-Type': 'application/json' } });

  return { token: res.json('token') };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`
  };

  // Opérations lourdes
  const endpoints = [
    '/api/dashboard/executive',
    '/api/contacts?limit=100',
    '/api/assets?limit=100',
    '/api/workorders',
    '/api/analytics/overview',
    '/api/cmms/parts'
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, { headers });

  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000
  });

  sleep(Math.random() * 2);
}
