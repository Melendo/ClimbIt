import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyToken from '../middlewares/verifyToken.js';
import uploadImages from '../middlewares/uploadImages.js';
import authorizeRocodromoAccess from '../middlewares/authorizeRocodromoAccess.js';
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

/**
 * GET /escaladores/mis-rocodromos
 * Obtiene la lista de todos los rocodromos a los que está suscrito el escalador autenticado
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Array} Array de rocodromos suscritos con sus detalles:
 *   - id: identificador único
 *   - nombre: nombre del rocodromo
 *   - ubicacion: dirección física
 */
router.get('/mis-rocodromos', verifyToken, (req, res, next) => {
  escaladorController.obtenerRocodromosSuscritos(req, res, next);
});

/**
 * GET /escaladores/perfil
 * Obtiene el perfil del escalador autenticado
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Object} Perfil del escalador con sus detalles:
 *    - id: identificador único
 *    - correo: email del escalador
 *    - apodo: nombre de usuario único
 */
router.get('/perfil', verifyToken, (req, res, next) => {
  escaladorController.obtenerPerfil(req, res, next);
});

/**
 * POST /escaladores/fotos-perfil
 * Crea una nueva imagen de perfil disponible para escaladores
 *
 * Requiere: Token JWT válido en header Authorization y rol Admin
 */
const uploadFotoPerfil = uploadImages({
  uploadDir: 'uploads/fotos_perfil',
  fileName: () => `foto-perfil-${Date.now()}`,
});

router.post(
  '/fotos-perfil',
  verifyToken,
  authorizeRocodromoAccess({ requireAdmin: true }),
  uploadFotoPerfil.single('foto'),
  (req, res, next) => {
    escaladorController.crearFotoPerfil(req, res, next);
  }
);

/**
 * GET /escaladores/fotos-perfil
 * Obtiene las fotos de perfil activas disponibles
 *
 * Requiere: Token JWT válido en header Authorization
 */
router.get('/fotos-perfil', verifyToken, (req, res, next) => {
  escaladorController.obtenerFotosPerfil(req, res, next);
});

/**
 * GET /escaladores/fotos-perfil/:id
 * Obtiene una foto de perfil por su id
 *
 * Requiere: Token JWT válido en header Authorization
 */
const obtenerFotoPerfilValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id de la foto de perfil debe ser un entero positivo'),
];

router.get(
  '/fotos-perfil/:id',
  verifyToken,
  obtenerFotoPerfilValidators,
  validate,
  (req, res, next) => {
    escaladorController.obtenerFotoPerfil(req, res, next);
  }
);

/**
 * PUT /escaladores/perfil/foto
 * Actualiza la foto de perfil del escalador autenticado
 *
 * Parámetros esperados (body):
 * - idFotoPerfil (@param {Number} , requerido): ID de la foto de perfil seleccionada (entero positivo)
 * - urlFoto (@param {String} , requerido): Ruta relativa de la foto seleccionada (formato: "/uploads/fotos_perfil/[nombre_foto]")
 *
 * Requiere: Token JWT válido en header Authorization
 */
const actualizarFotoPerfilValidators = [
  body('idFotoPerfil')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idFotoPerfil debe ser un entero positivo'),
  body('urlFoto').trim().notEmpty().withMessage('urlFoto es requerida'),
];

router.put(
  '/perfil/foto',
  verifyToken,
  actualizarFotoPerfilValidators,
  validate,
  (req, res, next) => {
    escaladorController.actualizarFotoPerfil(req, res, next);
  }
);

export default router;
