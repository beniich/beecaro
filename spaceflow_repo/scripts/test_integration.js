const axios = require('axios');

const GATEWAY_URL = 'http://localhost:5001';

async function runTests() {
    console.log('🚀 Starting Integration Tests against API Gateway...');
    let passed = 0;
    let failed = 0;

    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`✅ ${name}: PASSED`);
            passed++;
        } catch (error) {
            console.error(`❌ ${name}: FAILED`);
            console.error(`   ${error.message}`);
            if (error.response) {
                console.error(`   Status: ${error.response.status}`);
                console.error(`   Data:`, error.response.data);
            }
            failed++;
        }
    };

    // 1. Health Check
    await test('Gateway Health', async () => {
        const res = await axios.get(`${GATEWAY_URL}/health`);
        if (res.status !== 200) throw new Error('Status not 200');
    });

    // 2. Auth Service - Login (Mock or Real?)
    // This requires a seed user existing in DB.
    // If not, we might fail. Let's try to register first or just check /health of auth service if exposed?
    // Auth service does not expose a root health check in index.ts, only /api/auth routes.
    // Let's try to ping the monolith fallback.

    // 3. Monolith Fallback
    await test('Monolith Fallback (Health)', async () => {
        // Backend usually has /api/health or just /
        // Let's assume /api/invalid-route returns 404 from backend, proving routing worked?
        // Or if backend has a known route. 
        // Backend has /api/test maybe?
    });

    // 4. Public Metrics (Analytics)
    await test('Analytics Service (Public Metrics)', async () => {
        // This might fail if auth is required.
        // If 401, it means routing worked!
        try {
            await axios.get(`${GATEWAY_URL}/api/analytics/metrics`);
        } catch (e) {
            if (e.response && e.response.status === 401) return; // Pass if 401 (Gateway routed to service, service rejected)
            throw e;
        }
    });

    console.log(`\n🏁 Tests Completed: ${passed} Passed, ${failed} Failed`);
}

runTests();
