/**
 * Jest configuration for BeeCarbonat backend
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/controllers/*.js',
    'src/middleware/*.js',
    '!src/controllers/bim.controller.js',
    '!src/controllers/digitaltwin.controller.js',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ['./src/__tests__/setup.js'],
  verbose: true,
  testTimeout: 15000,
  // Mapper uuid ESM -> version CJS compatible Jest
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
  // Forcer la transformation de uuid (ESM natif)
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)',
  ],
};
