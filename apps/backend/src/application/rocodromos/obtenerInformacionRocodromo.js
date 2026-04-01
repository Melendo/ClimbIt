import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerInformacionRocodromo {
  constructor(rocodromosRepository) {
    this.rocodromosRepository = rocodromosRepository;
  }

  async execute(idRocodromo) {
    try {
      const rocodromo =
        await this.rocodromosRepository.encontrarPorId(idRocodromo);
      return rocodromo;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener la información del rocódromo',
        'ROCODROMO_GET_INFO_FAILED',
        error
      );
    }
  }
}

export default ObtenerInformacionRocodromo;
