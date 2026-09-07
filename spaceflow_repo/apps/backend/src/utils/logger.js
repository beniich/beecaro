/**
 * Logger structuré Pino pour BeeCarbonat
 * - En production : JSON compact (ingestible par Datadog, Loki, etc.)
 * - En développement : pretty-print coloré
 */
const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

  // Masquage automatique des champs sensibles
  redact: {
    paths: ['req.headers.authorization', 'body.password', 'body.token', 'body.refreshToken'],
    censor: '[REDACTED]',
  },

  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

module.exports = logger;
