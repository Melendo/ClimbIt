import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';
import uploadImages, {
  processUploadedRasterToWebp,
  validateUploadedFileType,
} from '../middlewares/uploadImages.js';
import authorizeRocodromoAccess, {
  resolveRocodromoIdFromRocodromoParam,
} from '../middlewares/authorizeRocodromoAccess.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { rocodromoController } = container;

const RASTER_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const LOGO_MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024;

/**
 * POST /rocodromos/create
 * Crea un nuevo rocodromo en el sistema
 *
 * Parámetros esperados (body):
 * - nombre (@param {string}): Nombre del rocodromo (1-100 caracteres)
 * - ubicacion (@param {string}): Ubicacion o direccion (1-255 caracteres)
 * - descripcion (@param {string}): Descripcion del rocodromo
 * - horarios (@param {string}): Horarios del rocodromo
 * - dificultadBloque (@param {int}): ID de la escala de dificultad de bloque
 * - dificultadVia (@param {int}): ID de la escala de dificultad de via
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Object} Detalles del rocodromo creado:
 *   - id: identificador único
 *   - nombre: nombre del rocodromo
 *   - ubicacion: ubicación del rocodromo
 */
const crearRocodromoValidators = [
  body('nombre')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del rocodromo debe tener entre 1 y 100 caracteres'),
  body('ubicacion')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('La ubicacion debe tener entre 1 y 255 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('La descripcion debe ser una cadena valida'),
  body('horarios')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Los horarios deben ser una cadena valida'),
  body('dificultadBloque')
    .optional({ nullable: true, checkFalsy: true })
    .toInt()
    .isInt({ min: 1 })
    .withMessage('dificultadBloque debe ser un entero positivo'),
  body('dificultadVia')
    .optional({ nullable: true, checkFalsy: true })
    .toInt()
    .isInt({ min: 1 })
    .withMessage('dificultadVia debe ser un entero positivo'),
];

router.post(
  '/create',
  verifyTokenMiddleware,
  authorizeRocodromoAccess({ requireAdmin: true }),
  crearRocodromoValidators,
  validate,
  (req, res, next) => {
    rocodromoController.crearRocodromo(req, res, next);
  }
);

/**
 * GET /rocodromos
 * Obtiene la lista de todos los rocodromos disponibles
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Array} Array de rocodromos con sus detalles:
 *   - id: identificador único
 *   - nombre: nombre del rocodromo
 *   - direccion: dirección física
 */
router.get('/', verifyTokenMiddleware, (req, res, next) => {
  rocodromoController.obtenerRocodromos(req, res, next);
});

/**
 * GET /rocodromos/zonas/:id
 * Obtiene todas las zonas que pertenecen a un rocodromo específico
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID del rocodromo (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Array} Array de zonas con sus pistas asociadas
 */
const obtenerZonasRocodromoValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id del rocodromo debe ser un entero positivo'),
];

router.get(
  '/zonas/:id',
  verifyTokenMiddleware,
  obtenerZonasRocodromoValidators,
  validate,
  (req, res, next) => {
    rocodromoController.obtenerZonasDeRocodromo(req, res, next);
  }
);

/**
 * GET /rocodromos/:id
 * Obtiene toda la informaación de un rocodromo específico
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID del rocodromo (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Object} Datos del rocodromo:
 *   - id: identificador único
 *   - nombre: nombre del rocodromo
 *   - direccion: dirección física
 */
const obtenerInformacionRocodromoValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id del rocodromo debe ser un entero positivo'),
];

router.get(
  '/:id',
  verifyTokenMiddleware,
  obtenerInformacionRocodromoValidators,
  validate,
  (req, res, next) => {
    rocodromoController.obtenerInformacionRocodromo(req, res, next);
  }
);

/**
 * PUT /rocodromos/:id
 * Actualiza la informacion de un rocodromo
 *
 * Parametros esperados (URL Path):
 * - id (@param {number} , requerido): ID del rocodromo (entero positivo)
 *
 * Parametros esperados (body) opcionales:
 * - nombre (@param {string}): Nombre del rocodromo (1-100 caracteres)
 * - ubicacion (@param {string}): Ubicacion o direccion (1-255 caracteres)
 * - descripcion (@param {string}): Descripcion del rocodromo
 * - horarios (@param {string}): Horarios del rocodromo
 * - dificultadBloque (@param {int}): ID de la escala de dificultad de bloque
 * - dificultadVia (@param {int}): ID de la escala de dificultad de via
 *
 * Requiere: Token JWT valido en header Authorization
 * Rol de Administrador o Gestor del Rocodromo propietario
 */
const actualizarRocodromoValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id del rocodromo debe ser un entero positivo'),
  body('nombre')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del rocodromo debe tener entre 1 y 100 caracteres'),
  body('ubicacion')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('La ubicacion debe tener entre 1 y 255 caracteres'),
  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('La descripcion debe ser una cadena valida'),
  body('horarios')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Los horarios deben ser una cadena valida'),
  body('dificultadBloque')
    .optional({ nullable: true, checkFalsy: true })
    .toInt()
    .isInt({ min: 1 })
    .withMessage('dificultadBloque debe ser un entero positivo'),
  body('dificultadVia')
    .optional({ nullable: true, checkFalsy: true })
    .toInt()
    .isInt({ min: 1 })
    .withMessage('dificultadVia debe ser un entero positivo'),
];

router.put(
  '/:id',
  verifyTokenMiddleware,
  actualizarRocodromoValidators,
  validate,
  authorizeRocodromoAccess({ resolveRocodromoId: resolveRocodromoIdFromRocodromoParam }),
  (req, res, next) => {
    rocodromoController.actualizarInformacion(req, res, next);
  }
);

/**
 * POST /rocodromos/:id/logo
 * Sube el logo de un rocódromo
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID del rocódromo (entero positivo)
 *
 * Parámetros esperados (multipart/form-data):
 * - logo (@param {file} , requerido): Archivo de imagen
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Object} URL del logo
 */
const subirLogoRocodromoValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id del rocodromo debe ser un entero positivo'),
];

const uploadLogoRocodromo = uploadImages({
  uploadDir: 'uploads/logos_rocodromos',
  fileName: (req) => `logo-${req.params.id}-${Date.now()}`,
  allowedMimeTypes: RASTER_IMAGE_MIME_TYPES,
  maxFileSizeBytes: LOGO_MAX_FILE_SIZE_BYTES,
});

const validateLogoUpload = validateUploadedFileType({
  allowedMimeTypes: RASTER_IMAGE_MIME_TYPES,
});

router.post(
  '/:id/logo',
  verifyTokenMiddleware,
  subirLogoRocodromoValidators,
  validate,
  authorizeRocodromoAccess({ resolveRocodromoId: resolveRocodromoIdFromRocodromoParam }),
  uploadLogoRocodromo.single('logo'),
  validateLogoUpload,
  processUploadedRasterToWebp(),
  (req, res, next) => {
    console.log("ID del rocódromo:", req.params.id);
    rocodromoController.subirLogo(req, res, next);
  }
);

/**
 * GET /rocodromos/:id/logo
 * Obtiene el logo de un rocódromo
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID del rocódromo (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 */
const obtenerLogoRocodromoValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id del rocodromo debe ser un entero positivo'),
];

router.get(
  '/:id/logo',
  verifyTokenMiddleware,
  obtenerLogoRocodromoValidators,
  validate,
  (req, res, next) => {
    rocodromoController.obtenerLogo(req, res, next);
  }
);

/**
 * GET /rocodromos/:id/escalasDificultad
 * Obtiene las escalas de dificultad de un rocódromo específico
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID del rocodromo (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Array} Array de escalas de dificultad
 */
const obtenerEscalasDificultadRocodromoValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id del rocodromo debe ser un entero positivo'),
];

router.get(
  '/:id/escalasDificultad',
  verifyTokenMiddleware,
  obtenerEscalasDificultadRocodromoValidators,
  validate,
  (req, res, next) => {
    rocodromoController.obtenerEscalasDificultad(req, res, next);
  }
);

export default router;
