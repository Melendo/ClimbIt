import express from 'express';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { pistaController } = container;

router.post('/create', (req, res, next) => {
  pistaController.crear(req, res, next);
});

router.get('/:id', (req, res, next) => {
  pistaController.obtenerPistaPorId(req, res, next);
});

export default router;
