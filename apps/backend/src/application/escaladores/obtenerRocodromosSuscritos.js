import {
  NotFoundError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerRocodromosSuscritos {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(apodo) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);
      if (!escalador) {
        throw new NotFoundError(
          'Escalador no encontrado',
          'ESCALADOR_NOT_FOUND'
        );
      }
      const rocodromosSuscritos =
        await this.escaladorRepository.obtenerRocodromosSuscritos(escalador.id);
      return rocodromosSuscritos;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError(
        'Error al obtener rocódromos suscritos',
        'ESCALADOR_SUBSCRIPTIONS_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerRocodromosSuscritos;
