import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerZonaPorId {
  constructor(zonaRepository) {
    this.zonaRepository = zonaRepository;
  }

  async execute(idZona) {
    try {
      const zona = await this.zonaRepository.encontrarPorId(idZona);
      return zona;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener la zona',
        'ZONA_GET_BY_ID_FAILED',
        error
      );
    }
  }
}

export default ObtenerZonaPorId;
