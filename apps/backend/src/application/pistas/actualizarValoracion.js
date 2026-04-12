import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarValoracion {
  constructor(pistaRepository, escaladorRepository) {
    this.pistaRepository = pistaRepository;
    this.escaladorRepository = escaladorRepository;
  }
  async execute({ idPista, idEscalador, nuevaValoracion }) {
    try {
      const pista = await this.pistaRepository.obtenerPorId(idPista);
      if (!pista) {
        throw new NotFoundError(
          `Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      const escalador =
        await this.escaladorRepository.obtenerPorId(idEscalador);
      if (!escalador) {
        throw new NotFoundError(
          `Escalador con ID ${idEscalador} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      const resultado = await this.pistaRepository.actualizarValoracion(
        pista.id,
        escalador.id,
        nuevaValoracion
      );

      return resultado;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar la valoración de la pista',
        'PISTA_UPDATE_VALORACION_FAILED',
        error
      );
    }
  }
}

export default ActualizarValoracion;
