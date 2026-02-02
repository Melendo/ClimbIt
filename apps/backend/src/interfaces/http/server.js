import express from 'express';
import cors from 'cors';

import sequelize from '../../infrastructure/db/postgres/sequelize.js';

const app = express();

// Middlewares
app.use(cors()); // Tuve que "configurar" CORS para permitir peticiones desde el frontend (ToDo: Configurar bien CORS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API: cargamos las rutas cuando se inicializa la app para evitar side-effects
async function setupRoutes() {
  const mainRouterModule = await import('./routes/index.js');
  const mainRouter = mainRouterModule.default;
  app.use('/', mainRouter);
}

app.setupRoutes = setupRoutes;

// Llamamos a setupRoutes inmediatamente para configurar las rutas
setupRoutes();

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

export default app;
