const { Prisma } = require('@prisma/client');
const logger = console; // Basic logger, replace with Winston/Pino later

class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const errorMiddleware = (err, req, res, next) => {
  logger.error('API Error', {
    path: req.path,
    method: req.method,
    error: err.message,
    ip: req.ip,
    userId: req.user?.id
  });

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({
      error: 'DATABASE_ERROR',
      code: err.code,
      message: getPrismaErrorMessage(err)
    });
  }

  // Custom API Errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      details: err.details
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'AUTH_ERROR',
      message: 'Token invalide ou expiré'
    });
  }

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue' 
      : err.message
  });
};

function getPrismaErrorMessage(err) {
  const messages = {
    'P2002': 'Cette donnée existe déjà (contrainte unique)',
    'P2025': 'Ressource non trouvée',
    'P2003': 'Contrainte de clé étrangère violée'
  };
  return messages[err.code] || 'Erreur de base de données';
}

module.exports = { ApiError, errorMiddleware };
