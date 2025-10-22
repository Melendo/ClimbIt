const express = require('express');
const path = require('path');
const cors = require('cors');

let sequelize; // se asignará en `conectar()`

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
    const db = require('../../infrastructure/db/postgres/models/');
    sequelize = db.sequelize;
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    return sequelize;
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err);
    throw err; // propaga el error para que el arrancador lo maneje
  }
}

app.conectar = conectar;

module.exports = app;
