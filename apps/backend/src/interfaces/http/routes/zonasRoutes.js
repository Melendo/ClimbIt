import express from 'express';
import { param } from 'express-validator';
import validate from '../middlewares/validate.js';
import verifyTokenMiddleware from '../middlewares/verifyToken.js';
import containerPromise from '../../../infrastructure/container.js';

const router = express.Router();
const container = await containerPromise;
const { zonaController } = container;

router.post('/create', verifyTokenMiddleware, (req, res, next) => {
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
