// jest.config.js

/** @type {import('jest').Config} */
const config = {
  // Indica a Jest que use el entorno de Node.js en lugar del navegador.
  testEnvironment: 'node',

  // Inject globals like jest, describe, it, expect, etc.
  injectGlobals: true,

  // Module name mapper for ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {},

  // Usa el proveedor de cobertura 'v8' para una recolección más rápida y precisa.
  coverageProvider: 'v8',

  // Archivos para los que se recopilará la cobertura.
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/*.test.js',
    '!jest.config.js',
    '!coverage/**',
  ],

  // Rutas que se ignorarán al calcular la cobertura.
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/interfaces/http/server.js',
    '/index.js',
    '/migrations/',
    '/seeders/',
    '/infrastructure/db/postgres/config.js',
    '/infrastructure/db/postgres/models/index.js',
    '/infrastructure/db/postgres/sequelize.js',
    '/domain/.*Repository\\.js$',
  ],

  // Umbrales mínimos de cobertura que deben cumplirse.
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};

export default config;
