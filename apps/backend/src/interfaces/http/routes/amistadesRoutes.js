import express from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyToken from '../middlewares/verifyToken.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { amistadController } = container;

const enviarSolicitudValidators = [
  body('apodoDestinatario')
    .trim()
    .notEmpty()
    .withMessage('apodoDestinatario es requerido')
    .isLength({ min: 1, max: 20 })
    .withMessage('apodoDestinatario debe tener entre 1 y 20 caracteres'),
];

router.post(
  '/enviar',
  verifyToken,
  enviarSolicitudValidators,
  validate,
  (req, res, next) => {
    amistadController.enviarSolicitud(req, res, next);
  }
);

export default router;