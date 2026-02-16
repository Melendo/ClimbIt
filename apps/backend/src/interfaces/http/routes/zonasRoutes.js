import express from 'express';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { zonaController } = container;

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

router.post('/create', verifyTokenMiddleware, crearZonaValidators, validate, (req, res, next) => {
  zonaController.crearZona(req, res, next);
});

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

router.get('/pistas/:id', verifyTokenMiddleware, obtenerPistasZonaValidators, validate, (req, res, next) => {
  zonaController.obtenerPistasDeZona(req, res, next);
});

export default router;
