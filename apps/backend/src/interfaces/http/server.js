const express = require('express');
const path = require('path');
const cors = require('cors');

const sequelize = require('../../infrastructure/db/postgres/sequelize');

const app = express();

// Middlewares
app.use(cors()); // Tuve que "configurar" CORS para permitir peticiones desde el frontend (ToDo: Configurar bien CORS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos si los hay
app.use(express.static(path.join(__dirname, '..', 'web', 'public')));

// Rutas API: cargamos las rutas cuando se inicializa la app para evitar side-effects
function setupRoutes() {
  const mainRouter = require('./routes');
  app.use('/', mainRouter);
}

app.setupRoutes = setupRoutes;

// Conectar a la base de datos
async function conectar() {
  try {
    // Cargamos las models aquí para inicializar Sequelize con la config
    await sequelize.authenticate();
    console.info('Conexión a la base de datos establecida correctamente.');

    return sequelize;
  } catch (err) {
    console.error('No se pudo conectar a la base de datos: connectionRefused');
    throw err;
  }
}

app.conectar = conectar;

module.exports = app;
