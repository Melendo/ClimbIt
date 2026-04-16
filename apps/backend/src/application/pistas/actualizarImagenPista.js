import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarImagenPista {
  constructor(pistaRepository) {
    this.pistaRepository = pistaRepository;
  }

  async execute(idPista, imagenUrl) {
    try {
      const pistaActualizada = await this.pistaRepository.actualizarImagenUrl(
        idPista,
        imagenUrl
      );

      if (!pistaActualizada) {
        throw new NotFoundError(
          `Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      return pistaActualizada;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar la imagen de la pista',
        'PISTA_UPDATE_IMAGE_FAILED',
        error
      );
    }
  }
}

export default ActualizarImagenPista;
