import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';
import uploadImages, {
  validateUploadedFileType,
} from '../middlewares/uploadImages.js';
import authorizeRocodromoAccess, {
  resolveRocodromoIdFromRocodromoBody,
  resolveRocodromoIdFromZonaParam,
} from '../middlewares/authorizeRocodromoAccess.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { zonaController } = container;

const SVG_MIME_TYPE = 'image/svg+xml';
const MAPA_ZONA_MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

/**
 * POST /zonas/create
 * Crea una nueva zona dentro de un rocodromo específico
 *
 * Parámetros esperados (body):
 * - idRoco (@param {number} , requerido): ID del rocodromo al que pertenece la zona (entero positivo)
 * - nombre (@param {string} , requerido): Nombre descriptivo de la zona (1-100 caracteres)
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Object} Detalles de la zona creada:
 *   - id: identificador único
 *   - idRoco: ID del rocodromo al que pertenece
 *   - nombre: nombre de la zona
 */
const crearZonaValidators = [
  body('idRoco')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idRoco debe ser un entero positivo'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la zona es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre de la zona debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-áéíóúñ]+$/)
    .withMessage('El nombre de la zona contiene caracteres no válidos'),
];

router.post(
  '/create',
  verifyTokenMiddleware,
  crearZonaValidators,
  validate,
  authorizeRocodromoAccess({
    resolveRocodromoId: resolveRocodromoIdFromRocodromoBody,
  }),
  (req, res, next) => {
    zonaController.crearZona(req, res, next);
  }
);

/**
 * GET /zonas/pistas/:id
 * Obtiene todas las pistas que pertenecen a una zona específica
 *
 * Parámetros esperados (URL Path):
 * - id (@number , requerido): ID de la zona (entero positivo)
 *
 * Respuesta esperada: Array de pistas con sus detalles:
 *   - id: identificador único
 *   - nombre: nombre de la pista
 *   - dificultad: grado de dificultad en escala francesa
 *
 * Requiere: Token JWT válido en header Authorization
 */
const obtenerPistasZonaValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id de la zona debe ser un entero positivo'),
];

router.get(
  '/pistas/:id',
  verifyTokenMiddleware,
  obtenerPistasZonaValidators,
  validate,
  (req, res, next) => {
    zonaController.obtenerPistasDeZona(req, res, next);
  }
);

/**
 * POST /zonas/:id/mapa
 * Sube el mapa de una zona
 *
 * Parametros esperados (URL Path):
 * - id (@param {number} , requerido): ID de la zona (entero positivo)
 *
 * Parametros esperados (multipart/form-data):
 * - mapa (@param {file} , requerido): Archivo de imagen
 *
 * Requiere:
 * - Token JWT valido en header Authorization
 * - Rol de Administrador o Gestor del Rocodromo al que pertenece la zona
 *
 * Respuesta esperada: @return {Object} URL del mapa
 */
const subirMapaZonaValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id de la zona debe ser un entero positivo'),
];

const uploadMapaZona = uploadImages({
  uploadDir: 'uploads/mapas_zonas',
  fileName: (req) => `mapa-zona-${req.params.id}-${Date.now()}`,
  allowedMimeTypes: [SVG_MIME_TYPE],
  maxFileSizeBytes: MAPA_ZONA_MAX_FILE_SIZE_BYTES,
});

const validateMapaZonaUpload = validateUploadedFileType({
  allowedMimeTypes: [SVG_MIME_TYPE],
  allowSvg: true,
});

router.post(
  '/:id/mapa',
  verifyTokenMiddleware,
  subirMapaZonaValidators,
  validate,
  authorizeRocodromoAccess({
    resolveRocodromoId: resolveRocodromoIdFromZonaParam,
  }),
  uploadMapaZona.single('mapa'),
  validateMapaZonaUpload,
  (req, res, next) => {
    zonaController.subirMapa(req, res, next);
  }
);

/**
 * GET /zonas/:id/mapa
 * Obtiene el mapa de una zona
 *
 * Parametros esperados (URL Path):
 * - id (@param {number} , requerido): ID de la zona (entero positivo)
 *
 * Requiere: Token JWT valido en header Authorization
 */
const obtenerMapaZonaValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id de la zona debe ser un entero positivo'),
];

router.get(
  '/:id/mapa',
  verifyTokenMiddleware,
  obtenerMapaZonaValidators,
  validate,
  (req, res, next) => {
    zonaController.obtenerMapa(req, res, next);
  }
);

export default router;
