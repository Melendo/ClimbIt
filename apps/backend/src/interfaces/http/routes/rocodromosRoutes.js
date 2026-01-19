import express from 'express';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { rocodromoController } = container;

router.get('/zonas/:id', (req, res, next) => {
  rocodromoController.obtenerZonasDeRocodromo(req, res, next);
});

export default router;
