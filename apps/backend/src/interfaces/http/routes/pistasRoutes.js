import express from 'express';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { pistaController } = container;

// Las rutas específicas DEBEN ir antes de las rutas con parámetros
router.post('/create', (req, res, next) => {
  pistaController.crear(req, res, next);
});

router.get('/:id', (req, res, next) => {
  console.log('Ruta GET /pistas/:id llamada con ID:', req.params.id);
  pistaController.obtenerPistaPorId(req, res, next);
});

export default router;
