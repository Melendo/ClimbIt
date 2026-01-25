import express from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.js';
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

export default router;
