import Pista from '../../domain/pistas/Pista.js';
import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class CrearPista {
  constructor(pistaRepository, zonaModel) {
    this.pistaRepository = pistaRepository;
    this.zonaModel = zonaModel;
  }

  async execute(data) {
    try {
      // Validate that the zone exists before creating the pista
      if (data.idZona) {
        const zonaExistente = await this.zonaModel.findByPk(data.idZona);
        if (!zonaExistente) {
          throw new NotFoundError(
            `La zona con ID ${data.idZona} no existe`,
            'ZONA_NOT_FOUND'
          );
        }
      }
      
      const nuevaPista = new Pista(
        null,
        data.idZona,
        data.nombre,
        data.dificultad,
        data.tipo,
        data.colorPresas,
        data.imagenUrl,
        data.posX,
        data.posY,
        data.fechaCreacion,
        data.fechaRetirada
      );
      const pistaCreada = await this.pistaRepository.crear(nuevaPista);

      return pistaCreada;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al crear la pista',
        'PISTA_CREATE_FAILED',
        error
      );
    }
  }
}

export default CrearPista;
