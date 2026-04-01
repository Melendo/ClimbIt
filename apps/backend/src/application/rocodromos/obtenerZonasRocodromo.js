import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerZonasRocodromo {
  constructor(rocodromoRepository) {
    this.rocodromoRepository = rocodromoRepository;
  }

  async execute(id) {
    try {
      return await this.rocodromoRepository.obtenerZonasDeRocodromo(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener las zonas del rocódromo',
        'ROCODROMO_GET_ZONES_FAILED',
        error
      );
    }
  }
}

export default ObtenerZonasRocodromo;
