import express from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyToken from '../middlewares/verifyToken.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { escaladorController } = container;

/**
 * POST /escaladores/create
 * Crea un nuevo escalador en el sistema y devuelve un token JWT para autenticación
 *
 * Parámetros esperados (body):
 * - correo (@param {String} , requerido): Email válido del escalador (ej: usuario@example.com)
 * - contrasena (@param {String} , requerido): Contraseña para autenticar (mín. 8 caracteres recomendado)
 * - apodo (@param {String} , requerido): Nombre de usuario único (2-20 caracteres, alfanuméricos y guiones)
 *
 * Respuesta esperada: @return {String} token JWT para autenticación en futuras solicitudes
 */
const crearEscaladorValidators = [
  body('correo')
    .trim()
    // .isEmail()
    .normalizeEmail(),
  // .isLength({ min: 5, max: 255 })
  // .withMessage('correo debe tener entre 5 y 255 caracteres'),
  body('contrasena')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('contrasena es requerida'),
  /* .isLength({ min: 8 })
    .withMessage('contrasena debe tener mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('contrasena debe contener mayúsculas, minúsculas y números')*/
  body('apodo')
    .trim()
    .notEmpty()
    .withMessage('apodo es requerido')
    .isLength({ min: 1, max: 20 })
    .withMessage('apodo debe tener entre 1 y 20 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'apodo solo puede contener letras, números, guiones y guiones bajos'
    ),
];

router.post('/create', crearEscaladorValidators, validate, (req, res, next) => {
  escaladorController.crear(req, res, next);
});

/**
 * POST /escaladores/auth
 * Autentica un escalador existente y devuelve un token JWT
 *
 * Parámetros esperados (body):
 * - correo (@param {String} , requerido): Email del escalador registrado (ej: usuario@example.com)
 * - contrasena (@param {String} , requerido): Contraseña del escalador
 *
 * Respuesta esperada: @return {String} token JWT para autenticación en futuras solicitudes
 */
const autenticarEscaladorValidators = [
  body('correo')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('correo debe ser un email válido')
    .notEmpty()
    .withMessage('correo es requerido'),
  body('contrasena')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('contrasena es requerida'),
];

router.post(
  '/auth',
  autenticarEscaladorValidators,
  validate,
  (req, res, next) => {
    escaladorController.autenticar(req, res, next);
  }
);

/**
 * POST /escaladores/suscribirse
 * Suscribe el escalador autenticado a un rocodromo
 *
 * Parámetros esperados (body):
 * - idRocodromo (@param {Number} , requerido): ID del rocodromo al que suscribirse (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {String} Confirmación de suscripción exitosa
 */
const suscribirseValidators = [
  body('idRocodromo')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idRocodromo debe ser un entero positivo'),
];

router.post(
  '/suscribirse',
  verifyToken,
  suscribirseValidators,
  validate,
  (req, res, next) => {
    escaladorController.suscribirse(req, res, next);
  }
);

/**
 * POST /escaladores/desuscribirse
 * Desuscribe el escalador autenticado de un rocodromo
 *
 * Parámetros esperados (body):
 * - idRocodromo (@param {Number} , requerido): ID del rocodromo del que desuscribirse (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {String} Confirmación de desuscripción exitosa
 */
const desuscribirseValidators = [
  body('idRocodromo')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idRocodromo debe ser un entero positivo'),
];

router.post(
  '/desuscribirse',
  verifyToken,
  desuscribirseValidators,
  validate,
  (req, res, next) => {
    escaladorController.desuscribirse(req, res, next);
  }
);

router.get('/mis-rocodromos', verifyToken, (req, res, next) => {
  escaladorController.obtenerRocodromosSuscritos(req, res, next);
});

router.get('/perfil', verifyToken, (req, res, next) => {
  escaladorController.obtenerPerfil(req, res, next);
});

export default router;
