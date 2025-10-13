// jest.config.js

/** @type {import('jest').Config} */
const config = {
    // Indica a Jest que use el entorno de Node.js en lugar del navegador.
    testEnvironment: 'node',

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
  ],

    // Umbrales mínimos de cobertura que deben cumplirse.
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 90, // Permite 10 sentencias sin cubrir como máximo.
    },
  },
};

module.exports = config;