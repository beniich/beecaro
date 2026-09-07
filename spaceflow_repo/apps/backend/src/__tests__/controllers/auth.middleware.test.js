/**
 * Tests unitaires — Middleware d'authentification
 * Vérifie que le bypass demo est correctement protégé
 */

// On mock les dépendances lourdes avant d'importer le middleware
jest.mock('../../services/firebase-admin.service', () => ({
  verifyFirebaseToken: jest.fn(),
}));

const { authMiddleware } = require('../../middleware/auth.middleware');
const { prisma } = require('../../config/database');
const { verifyFirebaseToken } = require('../../services/firebase-admin.service');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware — Sécurité du bypass', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  it('doit bloquer le bypass si ALLOW_DEMO_BYPASS est absent', async () => {
    delete process.env.ALLOW_DEMO_BYPASS;
    process.env.NODE_ENV = 'development';

    const req = { headers: { authorization: 'Bearer jwt-demo-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('doit bloquer le bypass en production même avec ALLOW_DEMO_BYPASS=true', async () => {
    process.env.ALLOW_DEMO_BYPASS = 'true';
    process.env.NODE_ENV = 'production';

    const req = { headers: { authorization: 'Bearer jwt-demo-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('doit autoriser le bypass en dev avec ALLOW_DEMO_BYPASS=true et un user ADMIN existant', async () => {
    process.env.ALLOW_DEMO_BYPASS = 'true';
    process.env.NODE_ENV = 'development';

    prisma.user.findFirst.mockResolvedValueOnce({
      id: 'admin-1',
      email: 'admin@beecarbonat.com',
      role: 'ADMIN',
    });

    const req = { headers: { authorization: 'Bearer jwt-demo-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('ADMIN');
  });

  it('doit renvoyer 401 si le header Authorization est absent', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
