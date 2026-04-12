import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerResumenEstadisticasEscalador {
  constructor(escaladorRepository, pistaRepository) {
    this.escaladorRepository = escaladorRepository;
    this.pistaRepository = pistaRepository;
  }

  async execute({ apodo }) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);

      if (!escalador) {
        throw new NotFoundError('Escalador no encontrado', 'ESCALADOR_NOT_FOUND');
      }

      return this.pistaRepository.obtenerResumenEstadisticasEscalador(escalador.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener resumen de estadisticas del escalador',
        'ESCALADOR_STATS_RESUMEN_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerResumenEstadisticasEscalador;