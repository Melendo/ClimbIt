import express from 'express';
import { param } from 'express-validator';
import validate from '../middlewares/validate.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { zonaController } = container;

const obtenerPistasZonaValidators = [
  param('id').toInt().isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
];

router.get('/pistas/:id', obtenerPistasZonaValidators, validate, (req, res, next) => {
  zonaController.obtenerPistasDeZona(req, res, next);
});

export default router;
