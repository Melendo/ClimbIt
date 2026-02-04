import express from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyToken from '../middlewares/verifyToken.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { escaladorController } = container;

const crearEscaladorValidators = [
  body('correo').isString().trim().notEmpty().isEmail().withMessage('correo debe ser un email válido'),
  body('contrasena').isString().trim().notEmpty().withMessage('contrasena es requerida'),
  body('apodo').isString().trim().notEmpty().withMessage('apodo es requerido'),
];

router.post('/create', crearEscaladorValidators, validate, (req, res, next) => {
  escaladorController.crear(req, res, next);
});

const autenticarEscaladorValidators = [
  body('correo').isString().trim().notEmpty().isEmail().withMessage('correo debe ser un email válido'),
  body('contrasena').isString().trim().notEmpty().withMessage('contrasena es requerida'),
];  
router.post('/auth',
  autenticarEscaladorValidators,
  validate,
  (req, res, next) => {
    escaladorController.autenticar(req, res, next);
  }
);

router.post("/suscribirse", verifyToken, (req, res, next) => {
  escaladorController.suscribirse(req, res, next);
});

export default router;
