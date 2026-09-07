const { sanitizeInput } = require('../../middleware/security.middleware');

const mockNext = jest.fn();

const mockReq = (body = {}, query = {}, params = {}) => ({ body, query, params });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Security Middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('sanitizeInput()', () => {
    it('passe les inputs normaux sans modification', () => {
      const req = mockReq({ name: 'HVAC System', email: 'test@cafm.com' });
      sanitizeInput(req, mockRes(), mockNext);

      expect(req.body.name).toBe('HVAC System');
      expect(req.body.email).toBe('test@cafm.com');
      expect(mockNext).toHaveBeenCalled();
    });

    it('supprime les balises <script> du body', () => {
      const req = mockReq({ name: '<script>alert("xss")</script>HVAC' });
      sanitizeInput(req, mockRes(), mockNext);

      expect(req.body.name).not.toContain('<script>');
      expect(mockNext).toHaveBeenCalled();
    });


    it('sanitize les query params', () => {
      const req = mockReq({}, { search: '<script>evil()</script>term' });
      sanitizeInput(req, mockRes(), mockNext);

      expect(req.query.search).not.toContain('<script>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('sanitize les objets imbriqués', () => {
      const req = mockReq({
        nested: {
          field: '<script>attack</script>value',
        },
      });
      sanitizeInput(req, mockRes(), mockNext);

      expect(req.body.nested.field).not.toContain('<script>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('sanitize les tableaux', () => {
      const req = mockReq({
        tags: ['normal', '<script>bad</script>'],
      });
      sanitizeInput(req, mockRes(), mockNext);

      expect(req.body.tags[0]).toBe('normal');
      expect(req.body.tags[1]).not.toContain('<script>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('gère les valeurs non-string sans erreur', () => {
      const req = mockReq({ count: 42, active: true, data: null });
      expect(() => sanitizeInput(req, mockRes(), mockNext)).not.toThrow();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
