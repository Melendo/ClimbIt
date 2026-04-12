import {
  AppError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerActividadMensualRocodromoEscalador {
  constructor(escaladorRepository, rocodromoRepository, pistaRepository) {
    this.escaladorRepository = escaladorRepository;
    this.rocodromoRepository = rocodromoRepository;
    this.pistaRepository = pistaRepository;
  }

  async execute({ apodo, idRocodromo, year, month }) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);

      if (!escalador) {
        throw new NotFoundError('Escalador no encontrado', 'ESCALADOR_NOT_FOUND');
      }

      const rocodromo = await this.rocodromoRepository.encontrarPorId(idRocodromo);

      if (!rocodromo) {
        throw new NotFoundError('Rocodromo no encontrado', 'ROCODROMO_NOT_FOUND');
      }

      const now = new Date();
      const resolvedYear = Number.isInteger(year) ? year : now.getFullYear();
      const resolvedMonth = Number.isInteger(month) ? month : now.getMonth() + 1;

      if (resolvedMonth < 1 || resolvedMonth > 12) {
        throw new BadRequestError('month debe estar entre 1 y 12', 'STATS_MONTH_INVALID');
      }

      if (resolvedYear < 2000 || resolvedYear > 2100) {
        throw new BadRequestError('year fuera de rango permitido', 'STATS_YEAR_INVALID');
      }

      return this.pistaRepository.obtenerActividadMensualEscaladorPorRocodromo(
        escalador.id,
        rocodromo.id,
        resolvedYear,
        resolvedMonth
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener actividad mensual del escalador por rocodromo',
        'ESCALADOR_STATS_ACTIVIDAD_ROCODROMO_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerActividadMensualRocodromoEscalador;
