import express from 'express';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { escaladorController } = container;

router.post('/', (req, res, next) => {
  escaladorController.crear(req, res, next);
});

router.get('/:id', (req, res, next) => {
  escaladorController.obtenerPistaPorId(req, res, next);
});

export default router;
