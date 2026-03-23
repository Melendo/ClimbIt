import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';
import uploadImages from '../middlewares/uploadImages.js';
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

const getPistaImageBaseName = (req) => {
  const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';
  if (nombre && nombre.toLowerCase() !== 'null') {
    return nombre;
  }

  return req.body?.idZona ?? req.params?.id;
};

/**
 * POST /pistas/create
 * Crea una nueva pista dentro de una zona específica
 *
 * Parámetros esperados (body):
 * - idZona (@param {number} , requerido): ID de la zona a la que pertenece la pista (entero positivo)
 * - nombre (@param {string} , requerido): Nombre descriptivo de la pista (1-100 caracteres)
 * - dificultad (@param {string} , requerido): Grado de dificultad francés (ej: "3a", "5b", "6c+")
 * - posX (@param {number} , opcional): Coordenada X en el mapa de la pista
 * - posY (@param {number} , opcional): Coordenada Y en el mapa de la pista
 *
 * Parámetros esperados (multipart/form-data):
 * - imagen (@param {file} , opcional): Archivo de imagen de la pista
 *
 * Requiere: Token JWT válido en header Authorization
 *
 * Respuesta esperada: @return {Object} Detalles de la pista creada:
 * - id: identificador único
 * - idZona: ID de la zona a la que pertenece la pista
 * - nombre: nombre de la pista
 * - dificultad: grado de dificultad en escala francesa
 */
const crearPistaValidators = [
  body('idZona')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('idZona debe ser un entero positivo'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la pista es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre de la pista debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-áéíóúñ]+$/)
    .withMessage('El nombre de la pista contiene caracteres no válidos'),
  body('dificultad')
    .trim()
    .notEmpty()
    .withMessage('La dificultad es requerida')
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
];

const uploadImagenPista = uploadImages({
  uploadDir: 'uploads/tmp/imagenes_pistas',
  fileName: (req) => {
    const baseName = getPistaImageBaseName(req);
    return `pista-${baseName}-${Date.now()}`;
  },
});

const uploadImagenPistaUpdate = uploadImages({
  uploadDir: 'uploads/tmp/imagenes_pistas',
  fileName: (req) => {
    const baseName = getPistaImageBaseName(req);
    return `pista-${baseName}-${Date.now()}`;
  },
});

router.post(
  '/create',
  verifyTokenMiddleware,
  uploadImagenPista.single('imagen'),
  crearPistaValidators,
  validate,
  authorizeRocodromoAccess({ resolveRocodromoId: resolveRocodromoIdFromZonaBody }),
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
  authorizeRocodromoAccess({ resolveRocodromoId: resolveRocodromoIdFromPistaParam }),
  uploadImagenPistaUpdate.single('imagen'),
  (req, res, next) => {
    pistaController.actualizarImagen(req, res, next);
  }
);

export default router;
