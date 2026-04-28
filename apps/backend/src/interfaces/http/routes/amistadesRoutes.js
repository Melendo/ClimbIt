import express from 'express';
import { body, param } from 'express-validator';
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

const responderSolicitudValidators = [
  body('idSolicitud')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idSolicitud debe ser un entero positivo'),
  body('respuesta')
    .trim()
    .isIn(['aceptada', 'rechazada'])
    .withMessage('respuesta debe ser aceptada o rechazada'),
];

router.post(
  '/responder',
  verifyToken,
  responderSolicitudValidators,
  validate,
  (req, res, next) => {
    amistadController.responderSolicitud(req, res, next);
  }
);

router.get('/mis-amigos', verifyToken, (req, res, next) => {
  amistadController.listarAmigos(req, res, next);
});

router.get('/solicitudes-pendientes', verifyToken, (req, res, next) => {
  amistadController.listarSolicitudesPendientes(req, res, next);
});

const consultarPerfilAmigoValidators = [
  param('apodo')
    .trim()
    .notEmpty()
    .withMessage('apodo es requerido')
    .isLength({ min: 1, max: 20 })
    .withMessage('apodo debe tener entre 1 y 20 caracteres'),
];

router.get(
  '/perfil/:apodo',
  verifyToken,
  consultarPerfilAmigoValidators,
  validate,
  (req, res, next) => {
    amistadController.consultarPerfilAmigo(req, res, next);
  }
);

const eliminarAmigoValidators = [
  param('apodoAmigo')
    .trim()
    .notEmpty()
    .withMessage('apodoAmigo es requerido')
    .isLength({ min: 1, max: 20 })
    .withMessage('apodoAmigo debe tener entre 1 y 20 caracteres'),
];

router.delete(
  '/:apodoAmigo',
  verifyToken,
  eliminarAmigoValidators,
  validate,
  (req, res, next) => {
    amistadController.eliminarAmigo(req, res, next);
  }
);

export default router;
