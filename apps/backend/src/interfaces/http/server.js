import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import sequelize from '../../infrastructure/db/postgres/sequelize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middlewares
app.use(cors()); // Tuve que "configurar" CORS para permitir peticiones desde el frontend (ToDo: Configurar bien CORS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos si los hay
app.use(express.static(path.join(__dirname, '..', 'web', 'public')));

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
