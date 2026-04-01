import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';
import uploadImages, {
  processUploadedRasterToWebp,
  validateUploadedFileType,
} from '../middlewares/uploadImages.js';
import authorizeRocodromoAccess, {
  resolveRocodromoIdFromPistaParam,
  resolveRocodromoIdFromZonaBody,
} from '../middlewares/authorizeRocodromoAccess.js';

import escalaDificultadJSON from '../../../domain/sharedObjects/escalaDificultadFrancesa.json' with { type: 'json' };
const GRADOS_FRANCESES = escalaDificultadJSON.escala_francesa_escalada.grados;

import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { pistaController } = container;

const RASTER_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const PISTA_MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

const getPistaImageBaseName = (req) => {
  const nombre =
    typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';
  if (nombre && nombre.toLowerCase() !== 'null') {
    return nombre;
  }

  return req.body?.idZona ?? req.params?.id;
};

/**
 * POST /pistas/create
 * Crea una nueva pista dentro de una zona específica
 *
 * Parámetros esperados (body) obligatorios:
 * - idZona (@param {int} , requerido): ID de la zona a la que pertenece la pista (entero positivo)
 * - tipo (@param {string}): Tipo de la pista (ej: "Boulder", "Via", etc.)
 * 
 * Parámetros esperados (body) opcionales:
 * - nombre (@param {string}): Nombre descriptivo de la pista (1-100 caracteres)
 * - dificultad (@param {string}): Grado de dificultad en escala francesa (ej: "6a", "7b+", etc.)
 * - colorPresas (@param {string}): Color de las presas de la pista (ej: "Rojo", "Azul", etc.)
 * - posX (@param {int}): Coordenada X en el mapa de la pista
 * - posY (@param {int}): Coordenada Y en el mapa de la pista
 * - fechaCreacion (@param {Date}): Fecha de creación de la pista en Date (ej: "2024-06-01T12:00:00Z")
 * - fechaRetirada (@param {Date}): Fecha de retirada de la pista en Date (ej: "2024-06-01T12:00:00Z")
 * 
 * Parámetros esperados (multipart/form-data):
 * - imagen (@param {file} , opcional): Archivo de imagen de la pista
 *
 * Requiere: 
 * - Token JWT válido en header Authorization 
 * - Rol de Administrador o Gestor del Rocódromo al que pertenece la zona
 *
 * Respuesta esperada: @return {Object} Detalles de la pista creada:
 * - id: identificador único
 * - idZona: ID de la zona a la que pertenece la pista
 * - nombre: nombre de la pista
 * - dificultad: grado de dificultad en escala francesa
 * - tipo: tipo de la pista ("boulder", "via")
 * - colorPresas: color de las presas de la pista (ej: "Rojo", "Azul", etc.)
 * - imagenUrl: URL de la imagen de la pista
 * - posX: coordenada X en el mapa de la zona
 * - posY: coordenada Y en el mapa de la zona
 * - fechaCreacion: fecha de creación de la pista
 * - fechaRetirada: fecha de retirada de la pista (null si no ha sido retirada)
 * - activo: booleano que indica si la pista está activa o no
 *
 */
const crearPistaValidators = [
  body('idZona')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idZona debe ser un entero positivo'),
  body('nombre')
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('El nombre de la pista debe tener entre 1 y 100 caracteres'),
  body('dificultad')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(GRADOS_FRANCESES)
    .withMessage(
      `La dificultad debe ser uno de: ${GRADOS_FRANCESES.join(', ')}`
    ),
  body('posX')
    .optional({ nullable: true })
    .toInt()
    .isInt()
    .withMessage('posX debe ser un numero entero valido'),
  body('posY')
    .optional({ nullable: true })
    .toInt()
    .isInt()
    .withMessage('posY debe ser un numero entero valido'),
  body('tipo')
    .isIn(['boulder', 'via'])
    .withMessage('El tipo debe ser uno de: "Boulder", "Via"'),
  body('colorPresas')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      'El color de las presas debe ser una cadena de 1 a 50 caracteres'
    ),
  body('fechaCreacion')
    .optional({ nullable: true, checkFalsy: true })
    .toDate()
    .custom((value) => {
      if (!value) {
        return true;
      }
      if (value > new Date()) {
        throw new Error('La fecha de creación no puede ser futura');
      }
      return true;
    })  ,

  body('fechaRetirada')
    .optional({ nullable: true, checkFalsy: true })
    .toDate()
    .custom((value) => {
      if (!value) {
        return true;
      }
      if (value <= new Date()) {
        throw new Error('La fecha de retirada no puede ser anterior a la fecha actual');
      }
      return true;
    }),

];

const uploadImagenPista = uploadImages({
  uploadDir: 'uploads/tmp/imagenes_pistas',
  fileName: (req) => {
    const baseName = getPistaImageBaseName(req);
    return `pista-${baseName}-${Date.now()}`;
  },
  allowedMimeTypes: RASTER_IMAGE_MIME_TYPES,
  maxFileSizeBytes: PISTA_MAX_FILE_SIZE_BYTES,
});

const uploadImagenPistaUpdate = uploadImages({
  uploadDir: 'uploads/tmp/imagenes_pistas',
  fileName: (req) => {
    const baseName = getPistaImageBaseName(req);
    return `pista-${baseName}-${Date.now()}`;
  },
  allowedMimeTypes: RASTER_IMAGE_MIME_TYPES,
  maxFileSizeBytes: PISTA_MAX_FILE_SIZE_BYTES,
});

const validatePistaImageUpload = validateUploadedFileType({
  allowedMimeTypes: RASTER_IMAGE_MIME_TYPES,
});

router.post(
  '/create',
  verifyTokenMiddleware,
  uploadImagenPista.single('imagen'),
  validatePistaImageUpload,
  processUploadedRasterToWebp(),
  crearPistaValidators,
  validate,
  authorizeRocodromoAccess({
    resolveRocodromoId: resolveRocodromoIdFromZonaBody,
  }),
  (req, res, next) => {
    pistaController.crear(req, res, next);
  }
);

/**
 * GET /pistas/:id
 * Obtiene los detalles de una pista específica
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID de la pista (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Object} Detalles de la pista:
 * - id: identificador único
 * - idZona: ID de la zona a la que pertenece la pista
 * - nombre: nombre de la pista
 * - dificultad: grado de dificultad en escala francesa
 */
const obtenerPistaPorIdValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id de la pista debe ser un entero positivo'),
];

router.get(
  '/:id',
  verifyTokenMiddleware,
  obtenerPistaPorIdValidators,
  validate,
  (req, res, next) => {
    pistaController.obtenerPistaPorId(req, res, next);
  }
);

/**
 * GET /pistas/:id/imagen
 * Obtiene la imagen de una pista
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID de la pista (entero positivo)
 *
 * Requiere: Token JWT válido en header Authorization
 */
router.get(
  '/:id/imagen',
  verifyTokenMiddleware,
  obtenerPistaPorIdValidators,
  validate,
  (req, res, next) => {
    pistaController.obtenerImagen(req, res, next);
  }
);

/**
 * POST /pistas/cambiar-estado/:id
 * Cambia el estado de una pista (activa/inactiva)
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID de la pista (entero positivo)
 *
 * Parámetros esperados (body):
 * - estado (@param {string} , requerido): Nuevo estado de la pista ("Completado", "Flash", "Proyecto" o "S/N")
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {String} Confirmación de cambio de estado exitoso
 */
const cambiarEstadoPistaValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id de la pista debe ser un entero positivo'),
  body('estado')
    .isIn(['Completado', 'Flash', 'Proyecto', 'S/N'])
    .withMessage(
      'El estado debe ser un valor de entre "Completado", "Flash", "Proyecto" y "S/N"'
    ),
];

router.post(
  '/cambiar-estado/:id',
  verifyTokenMiddleware,
  cambiarEstadoPistaValidators,
  validate,
  (req, res, next) => {
    pistaController.cambiarEstado(req, res, next);
  }
);

/**
 * PUT /pistas/:id/imagen
 * Actualiza la imagen de una pista
 *
 * Parámetros esperados (URL Path):
 * - id (@param {number} , requerido): ID de la pista (entero positivo)
 *
 * Parámetros esperados (multipart/form-data):
 * - imagen (@param {file} , requerido): Archivo de imagen de la pista
 *
 * Requiere: Token JWT válido en header Authorization
 */
const actualizarImagenPistaValidators = [
  param('id')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('El id de la pista debe ser un entero positivo'),
];

router.put(
  '/:id/imagen',
  verifyTokenMiddleware,
  actualizarImagenPistaValidators,
  validate,
  authorizeRocodromoAccess({
    resolveRocodromoId: resolveRocodromoIdFromPistaParam,
  }),
  uploadImagenPistaUpdate.single('imagen'),
  validatePistaImageUpload,
  processUploadedRasterToWebp(),
  (req, res, next) => {
    pistaController.actualizarImagen(req, res, next);
  }
);

export default router;
