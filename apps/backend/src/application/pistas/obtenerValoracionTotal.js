import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerValoracionTotal {
  constructor(pistaRepository) {
    this.pistaRepository = pistaRepository;
  }

  async execute({ idPista }) {
    try {
      const pista = await this.pistaRepository.obtenerPorId(idPista);
      if (!pista) {
        throw new NotFoundError(
          `Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      const valoracionTotal = await this.pistaRepository.obtenerValoracionTotal(idPista);

      return {
        idPista,
        valoracionTotal
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener la valoración total de la pista',
        'PISTA_OBTENER_VALORACION_TOTAL_FAILED',
        error
      );
    }
  }
}

export default ObtenerValoracionTotal;
