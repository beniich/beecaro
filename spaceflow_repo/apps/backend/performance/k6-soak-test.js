/**
 * Soak test : 1 heure à charge constante pour détecter les fuites mémoire
 * Usage: k6 run --duration 1h performance/k6-soak-test.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '1h',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export function setup() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@cafm.com', password: 'admin123'
  }), { headers: { 'Content-Type': 'application/json' } });
  return { token: res.json('token') };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json'
  };

  // Mix réaliste d'opérations
  if (Math.random() < 0.5) {
    http.get(`${BASE_URL}/api/dashboard/executive`, { headers });
  } else if (Math.random() < 0.8) {
    http.get(`${BASE_URL}/api/contacts?page=1&limit=25`, { headers });
  } else {
    http.get(`${BASE_URL}/api/assets?limit=50`, { headers });
  }

  sleep(2);
}
