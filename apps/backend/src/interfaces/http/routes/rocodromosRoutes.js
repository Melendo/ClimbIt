import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { rocodromoController } = container;

/**
 * POST /rocodromos/create
 * Crea un nuevo rocodromo en el sistema
 *
 * Parámetros esperados (body):
 * - nombre (@param {string} , requerido): Nombre del rocodromo (1-100 caracteres)
 * - ubicacion (@param {string} , requerido): Ubicación o dirección física del rocodromo (1-255 caracteres)
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
    .trim()
    .notEmpty()
    .withMessage('El nombre del rocodromo es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del rocodromo debe tener entre 1 y 100 caracteres'),
  body('ubicacion')
    .trim()
    .notEmpty()
    .withMessage('La ubicación del rocodromo es requerida')
    .isLength({ min: 1, max: 255 })
    .withMessage('La ubicación debe tener entre 1 y 255 caracteres'),
];

router.post('/create', verifyTokenMiddleware, crearRocodromoValidators, validate, (req, res, next) => {
  rocodromoController.crearRocodromo(req, res, next);
});

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

export default router;
