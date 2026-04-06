import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class EliminarPista {
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

      if (!pista.activo) {
        return {
          mensaje: `Pista con ID ${idPista} ya esta inactiva.`,
        };
      }

      await this.pistaRepository.desactivar(idPista);

      return {
        mensaje: `Pista con ID ${idPista} inactivada exitosamente.`,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al eliminar la pista',
        'PISTA_DELETE_FAILED',
        error
      );
    }
  }
}

export default EliminarPista;
