import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';

import escalaDificultadJSON from '../../../domain/sharedObjects/escalaDificultadFrancesa.json' with { type: 'json' };
const GRADOS_FRANCESES = escalaDificultadJSON.escala_francesa_escalada.grados;

import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { pistaController } = container;

const crearPistaValidators = [
  body('idZona')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idZona debe ser un entero positivo'),
  body('nombre')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('nombre es requerido'),
  body('dificultad')
    .isString()
    .trim()
    .isIn(GRADOS_FRANCESES)
    .withMessage(`dificultad debe ser uno de: ${GRADOS_FRANCESES.join(', ')}`),
];

const obtenerPistaPorIdValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero positivo'),
];

router.post(
  '/create',
  verifyTokenMiddleware,
  crearPistaValidators,
  validate,
  (req, res, next) => {
    pistaController.crear(req, res, next);
  }
);

router.get('/:id', obtenerPistaPorIdValidators, validate, (req, res, next) => {
  pistaController.obtenerPistaPorId(req, res, next);
});

export default router;
