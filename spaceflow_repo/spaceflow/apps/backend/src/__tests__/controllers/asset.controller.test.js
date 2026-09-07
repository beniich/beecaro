const assetController = require('../../controllers/asset.controller');
const { prisma } = require('../../config/database');

const mockReq = (body = {}, params = {}, query = {}, user = { id: 'user-1', organizationId: 'org-1' }) => ({
  body, params, query, user,
});
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockAsset = (overrides = {}) => ({
  id: 'asset-uuid-1',
  name: 'HVAC Zone A',
  category: 'HVAC',
  serialNumber: 'SN-001',
  status: 'OPERATIONAL',
  healthScore: 92,
  purchaseDate: new Date('2023-01-01'),
  buildingId: 'building-1',
  organizationId: 'org-1',
  building: { id: 'building-1', name: 'HQ' },
  workOrders: [],
  ...overrides,
});

describe('Asset Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── GET ALL ──────────────────────────────────────────────────────────────
  describe('getAll()', () => {
    it('retourne la liste des actifs', async () => {
      const assets = [mockAsset(), mockAsset({ id: 'asset-2', name: 'Chiller B' })];
      prisma.asset.findMany.mockResolvedValue(assets);
      prisma.asset.count.mockResolvedValue(2);

      const req = mockReq();
      const res = mockRes();

      await assetController.getAll(req, res);

      expect(prisma.asset.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('filtre par statut', async () => {
      prisma.asset.findMany.mockResolvedValue([mockAsset()]);
      prisma.asset.count.mockResolvedValue(1);

      const req = mockReq({}, {}, { status: 'OPERATIONAL' });
      const res = mockRes();

      await assetController.getAll(req, res);

      expect(prisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPERATIONAL' }),
        })
      );
    });

    it('filtre par recherche texte', async () => {
      prisma.asset.findMany.mockResolvedValue([mockAsset()]);
      prisma.asset.count.mockResolvedValue(1);

      const req = mockReq({}, {}, { search: 'HVAC' });
      const res = mockRes();

      await assetController.getAll(req, res);

      const call = prisma.asset.findMany.mock.calls[0][0];
      expect(JSON.stringify(call.where)).toContain('HVAC');
    });
  });

  // ─── GET BY ID ────────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('retourne un actif par id', async () => {
      prisma.asset.findUnique.mockResolvedValue(mockAsset());

      const req = mockReq({}, { id: 'asset-uuid-1' });
      const res = mockRes();

      await assetController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'asset-uuid-1' }));
    });

    it('retourne 404 si actif introuvable', async () => {
      prisma.asset.findUnique.mockResolvedValue(null);

      const req = mockReq({}, { id: 'ghost-id' });
      const res = mockRes();

      await assetController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─── CREATE ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('crée un actif et retourne 201', async () => {
      const created = mockAsset();
      prisma.asset.create.mockResolvedValue(created);

      const req = mockReq({
        name: 'HVAC Zone A',
        category: 'HVAC',
        serialNumber: 'SN-001',
        purchaseDate: '2023-01-01',
        buildingId: 'building-1',
        status: 'OPERATIONAL',
      });
      const res = mockRes();

      await assetController.create(req, res);

      expect(prisma.asset.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('met \u00e0 jour un actif', async () => {
      prisma.asset.update.mockResolvedValue(mockAsset({ name: 'HVAC Updated' }));

      const req = mockReq({ name: 'HVAC Updated' }, { id: 'asset-uuid-1' });
      const res = mockRes();

      await assetController.update(req, res);

      expect(prisma.asset.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'HVAC Updated' })
      );
    });

    it('retourne 400 si mise \u00e0 jour invalide (prisma error)', async () => {
      prisma.asset.update.mockRejectedValue(new Error('Record not found'));

      const req = mockReq({ name: 'X' }, { id: 'ghost' });
      const res = mockRes();

      await assetController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('supprime un actif', async () => {
      prisma.asset.delete.mockResolvedValue(mockAsset());

      const req = mockReq({}, { id: 'asset-uuid-1' });
      const res = mockRes();

      await assetController.delete(req, res);

      expect(prisma.asset.delete).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('retourne 500 si actif inexistant (prisma error)', async () => {
      prisma.asset.delete.mockRejectedValue(new Error('Record not found'));

      const req = mockReq({}, { id: 'ghost' });
      const res = mockRes();

      await assetController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
