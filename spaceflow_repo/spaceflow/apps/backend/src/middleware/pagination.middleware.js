exports.paginationMiddleware = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
  
  req.pagination = { page, limit };
  next();
};
