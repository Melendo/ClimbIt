import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerTiposEstadisticasEscalador {
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

      return this.pistaRepository.obtenerTiposEstadisticasEscalador(escalador.id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener estadisticas por tipo de ruta del escalador',
        'ESCALADOR_STATS_TIPOS_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerTiposEstadisticasEscalador;