import Zona from '../../domain/zonas/Zona.js';
import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class CrearZona {
  constructor(zonaRepository, rocodromoModel) {
    this.zonaRepository = zonaRepository;
    this.rocodromoModel = rocodromoModel;
  }

  async execute(data) {
    try {
      // Validate that the rocodromo exists before creating the zona
      if (data.idRoco) {
        const rocodromoExistente = await this.rocodromoModel.findByPk(
          data.idRoco
        );
        if (!rocodromoExistente) {
          throw new NotFoundError(
            `El rocódromo con ID ${data.idRoco} no existe`,
            'ROCODROMO_NOT_FOUND'
          );
        }
      }

      const nuevaZona = new Zona(null, data.idRoco, data.nombre, data.mapa);
      const zonaCreada = await this.zonaRepository.crearZona(nuevaZona);

      return zonaCreada;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al crear la zona',
        'ZONA_CREATE_FAILED',
        error
      );
    }
  }
}

export default CrearZona;
