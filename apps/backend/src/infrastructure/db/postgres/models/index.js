'use strict';

import { readdirSync } from 'node:fs';
import Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import process from 'process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import configFile from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
const db = {};

let sequelize;
// Revisamos la estructura del archivo config y elegimos la estrategia adecuada
if (config && config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    dialect: config.dialect || 'postgres',
    logging: config.logging,
  });
} else if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: (config && config.dialect) || 'postgres',
    logging: config && config.logging,
  });
} else if (config && config.database) {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
} else {
  throw new Error(
    'No se ha encontrado una configuración válida de base de datos'
  );
}

/**
 * Inicializa los modelos de sequelize de forma dinámica y asíncrona.
 *
 * @returns {Promise<Object>}
 */
async function inicializaModelos() {
  const modelos = {};

  try {
    const archivos = readdirSync(__dirname);
    const pathsModelos = archivos.filter(
      (file) => file.toLowerCase().endsWith('model.js') && file !== 'index.js'
    );

    // Cargar todos los modelos dinámicamente
    for (const pathModelo of pathsModelos) {
      const { default: modelFactory } = await import(
        fileURLToPath(new URL(pathModelo, import.meta.url))
      );
      const model = modelFactory(sequelize, DataTypes);
      modelos[model.name] = model;
    }

    // Ejecutar asociaciones si existen
    Object.values(modelos).forEach((modelo) => {
      if (modelo.associate) {
        modelo.associate(modelos);
      }
    });

    return modelos;
  } catch (error) {
    console.error('Error al cargar modelos:', error);
    throw error;
  }
}

// Inicializar y exportar
const inicializar = async () => {
  const modelos = await inicializaModelos();
  Object.assign(db, modelos);
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  return db;
};

export default inicializar();
