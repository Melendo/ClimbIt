import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerEscalasDificultad {
  constructor(rocodromoRepository) {
    this.rocodromoRepository = rocodromoRepository;
  }

  async execute(id) {
    try {
      return await this.rocodromoRepository.obtenerEscalasDificultad(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener las escalas de dificultad del rocódromo',
        'ROCODROMO_GET_DIFFICULTY_SCALES_FAILED',
        error
      );
    }
  }
}

export default ObtenerEscalasDificultad;
