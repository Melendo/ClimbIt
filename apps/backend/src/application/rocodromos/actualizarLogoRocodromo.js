import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarLogoRocodromo {
  constructor(rocodromosRepository) {
    this.rocodromosRepository = rocodromosRepository;
  }

  async execute(idRocodromo, logoUrl) {
    try {
      const rocodromo = await this.rocodromosRepository.actualizarLogoRocodromo(
        idRocodromo,
        logoUrl
      );

      if (!rocodromo) {
        throw new NotFoundError(
          `Rocódromo con ID ${idRocodromo} no encontrado`,
          'ROCODROMO_NOT_FOUND'
        );
      }

      return rocodromo;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar el logo del rocódromo',
        'ROCODROMO_UPDATE_LOGO_FAILED',
        error
      );
    }
  }
}

export default ActualizarLogoRocodromo;
