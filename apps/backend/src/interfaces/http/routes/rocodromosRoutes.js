import express from 'express';
import { param } from 'express-validator';
import validate from '../middlewares/validate.js';
import containerPromise from '../../../infrastructure/container.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';

const router = express.Router();
const container = await containerPromise;
const { rocodromoController } = container;

router.get('/', verifyTokenMiddleware, (req, res, next) => {
  rocodromoController.obtenerRocodromos(req, res, next);
});

const obtenerZonasRocodromoValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero positivo'),
];

router.get(
  '/zonas/:id',
  obtenerZonasRocodromoValidators,
  validate,
  (req, res, next) => {
    rocodromoController.obtenerZonasDeRocodromo(req, res, next);
  }
);

export default router;
