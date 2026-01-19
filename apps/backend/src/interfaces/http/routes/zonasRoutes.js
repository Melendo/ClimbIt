import express from 'express';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { zonaController } = container;

router.get('/pistas/:id', (req, res, next) => {
  zonaController.obtenerPistasDeZona(req, res, next);
});

export default router;
