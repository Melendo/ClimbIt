// eslint.config.mjs

import js from '@eslint/js';
import globals from 'globals';
import googleConfig from 'eslint-config-google';
import prettierConfig from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';

// Eliminamos las reglas obsoletas que causaban errores
delete googleConfig.rules['valid-jsdoc'];
delete googleConfig.rules['require-jsdoc'];

export default [
  // 0. Archivos y carpetas que ESLint debe ignorar
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '.vscode/',
      'package-lock.json',
      '**/*.json', // <-- Ignoramos explícitamente TODOS los JSON
      '**/*.css', // <-- Ignoramos explícitamente TODOS los CSS
    ],
  },

  // 1. Configuración **EXCLUSIVA** para archivos JavaScript
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          topLevelAwait: true,
        },
      },
    },
    // Combinamos las reglas de JS y Google
    rules: {
      ...js.configs.recommended.rules,
      ...googleConfig.rules,
      // Sobrescribimos la regla conflictiva para Express
      'new-cap': ['error', { capIsNewExceptions: ['Router'] }],
    },
  },

  // 2. Configuración para los archivos de TEST con Jest
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    ...jest.configs['flat/recommended'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },

  // 3. Configuración de Prettier (¡Siempre al final!)
  prettierConfig,
];
