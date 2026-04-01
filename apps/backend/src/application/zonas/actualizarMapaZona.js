import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarMapaZona {
  constructor(zonaRepository) {
    this.zonaRepository = zonaRepository;
  }

  async execute(idZona, mapaUrl) {
    try {
      const zona = await this.zonaRepository.actualizarMapaZona(idZona, mapaUrl);
      
      if (!zona) {
        throw new NotFoundError(
          `Zona con ID ${idZona} no encontrada`,
          'ZONA_NOT_FOUND'
        );
      }

      return zona;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar el mapa de la zona',
        'ZONE_UPDATE_MAP_FAILED',
        error
      );
    }
  }
}

export default ActualizarMapaZona;
