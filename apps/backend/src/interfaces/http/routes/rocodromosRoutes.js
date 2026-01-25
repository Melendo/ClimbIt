import express from 'express';
import { param } from 'express-validator';
import validate from '../middlewares/validate.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { rocodromoController } = container;

const obtenerZonasRocodromoValidators = [
  param('id').toInt().isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
];

router.get('/zonas/:id', obtenerZonasRocodromoValidators, validate, (req, res, next) => {
  rocodromoController.obtenerZonasDeRocodromo(req, res, next);
});

export default router;
