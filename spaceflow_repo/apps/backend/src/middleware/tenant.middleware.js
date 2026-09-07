const { tenantContext } = require('../config/database');
const { prisma } = require('../config/database');

exports.tenantMiddleware = async (req, res, next) => {
  try {
    let tenantId = req.headers['x-tenant-id'];
    
    // If not provided in header, and user is authenticated, we might derive it
    if (!tenantId && req.user && req.user.tenantId) {
      tenantId = req.user.tenantId;
    }
    
    // If still no tenantId, use a default fallback for development/demo only, or pass undefined
    // For RLS to be strict, we might require tenantId, but some routes like /auth might not have it.
    
    tenantContext.run(tenantId, () => {
      next();
    });
  } catch (err) {
    next(err);
  }
};
