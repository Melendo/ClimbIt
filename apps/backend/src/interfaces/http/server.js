import express from 'express';
import cors from 'cors';
import multer from 'multer';

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

  app.use((err, _req, res, next) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'El archivo excede el tamaño máximo permitido' });
      }

      return res.status(400).json({ error: err.message || 'Error al procesar archivo subido' });
    }

    if (
      err.code === 'UPLOAD_UNSUPPORTED_MIME_TYPE' ||
      err.code === 'UPLOAD_SIGNATURE_VALIDATION_FAILED' ||
      err.code === 'UPLOAD_SIGNATURE_VALIDATION_ERROR'
    ) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    return next(err);
  });
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
