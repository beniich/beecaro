/**
 * Protection CSRF via csrf-csrf (double-submit cookie pattern)
 * 
 * Flow :
 *  1. GET /api/csrf-token → Le client reçoit un token CSRF dans un cookie
 *  2. Toutes les requêtes mutantes (POST/PUT/PATCH/DELETE) doivent inclure
 *     le token dans le header X-CSRF-Token
 */
const { doubleCsrf } = require('csrf-csrf');

const {
  generateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'csrf-fallback-secret-change-in-prod-32chars',
  cookieName: process.env.NODE_ENV === 'production' ? '__Host-psifi.x-csrf-token' : 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  getTokenFromRequest: (req) =>
    req.headers['x-csrf-token'] || req.body?._csrf,
});

module.exports = { generateToken, doubleCsrfProtection };
