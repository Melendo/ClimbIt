import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class CambiarEstadoPista {
  constructor(pistaRepository, escaladorRepository) {
    this.pistaRepository = pistaRepository;
    this.escaladorRepository = escaladorRepository;
  }
  async execute({ idPista, nuevoEstado, escaladorApodo }) {
    try {
      const pista = await this.pistaRepository.obtenerPorId(idPista);
      if (!pista) {
        throw new NotFoundError(
          `Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      const escalador =
        await this.escaladorRepository.encontrarPorApodo(escaladorApodo);
      if (!escalador) {
        throw new NotFoundError(
          `Escalador con apodo ${escaladorApodo} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      // Convertir estado a minúsculas para que coincida con el ENUM
      const estadoNormalizado = nuevoEstado.toLowerCase();

      if (estadoNormalizado !== 's/n') {
        await this.pistaRepository.cambiarEstado(
          idPista,
          escalador.id,
          estadoNormalizado
        );
      } else {
        await this.pistaRepository.eliminarEstadoPista(idPista, escalador.id);
      }
      return {
        mensaje: `Estado de la pista con ID ${idPista} cambiado a ${nuevoEstado} exitosamente.`,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al cambiar el estado de la pista',
        'PISTA_CHANGE_STATE_FAILED',
        error
      );
    }
  }
}

export default CambiarEstadoPista;
