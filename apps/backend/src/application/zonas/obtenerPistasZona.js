import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerPistasZona {
  constructor(zonaRepository, escaladorRepository) {
    this.zonaRepository = zonaRepository;
    this.escaladorRepository = escaladorRepository;
  }

  async execute(id, escaladorApodo) {
    try {
      let idEscalador = null;

      if (escaladorApodo) {
        const escalador = await this.escaladorRepository.encontrarPorApodo(escaladorApodo);
        if (escalador) {
          idEscalador = escalador.id;
        }
      }

      return await this.zonaRepository.obtenerPistasDeZona(id, idEscalador);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener las pistas de la zona',
        'ZONA_GET_PISTAS_FAILED',
        error
      );
    }
  }
}

export default ObtenerPistasZona;
