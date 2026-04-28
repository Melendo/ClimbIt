import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerTiposEstadisticasRocodromoEscalador {
  constructor(escaladorRepository, rocodromoRepository, pistaRepository) {
    this.escaladorRepository = escaladorRepository;
    this.rocodromoRepository = rocodromoRepository;
    this.pistaRepository = pistaRepository;
  }

  async execute({ apodo, idRocodromo }) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);

      if (!escalador) {
        throw new NotFoundError(
          'Escalador no encontrado',
          'ESCALADOR_NOT_FOUND'
        );
      }

      const rocodromo =
        await this.rocodromoRepository.encontrarPorId(idRocodromo);

      if (!rocodromo) {
        throw new NotFoundError(
          'Rocodromo no encontrado',
          'ROCODROMO_NOT_FOUND'
        );
      }

      return this.pistaRepository.obtenerTiposEstadisticasEscaladorPorRocodromo(
        escalador.id,
        rocodromo.id
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener estadisticas por tipo de ruta del escalador por rocodromo',
        'ESCALADOR_STATS_TIPOS_ROCODROMO_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerTiposEstadisticasRocodromoEscalador;
