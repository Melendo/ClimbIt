import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerResumenEstadisticasRocodromoEscalador {
  constructor(escaladorRepository, rocodromoRepository, pistaRepository) {
    this.escaladorRepository = escaladorRepository;
    this.rocodromoRepository = rocodromoRepository;
    this.pistaRepository = pistaRepository;
  }

  async execute({ apodo, idRocodromo }) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);

      if (!escalador) {
        throw new NotFoundError('Escalador no encontrado', 'ESCALADOR_NOT_FOUND');
      }

      const rocodromo = await this.rocodromoRepository.encontrarPorId(idRocodromo);

      if (!rocodromo) {
        throw new NotFoundError('Rocodromo no encontrado', 'ROCODROMO_NOT_FOUND');
      }

      const resumenEscalador =
        await this.pistaRepository.obtenerResumenEstadisticasEscaladorPorRocodromo(
          escalador.id,
          rocodromo.id
        );
      const totalRutasActivasRocodromo =
        await this.pistaRepository.obtenerTotalPistasActivasPorRocodromo(
          rocodromo.id
        );

      return {
        ...resumenEscalador,
        totalRutasActivasRocodromo,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener resumen de estadisticas por rocodromo del escalador',
        'ESCALADOR_STATS_RESUMEN_ROCODROMO_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerResumenEstadisticasRocodromoEscalador;
