import Pista from '../../domain/pistas/Pista.js';
import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';
class ObtenerPistaPorId {
  constructor(pistaRepository, escaladorRepository) {
    this.pistaRepository = pistaRepository;
    this.escaladorRepository = escaladorRepository;
  }

  async execute(id, escaladorApodo) {
    try {
      const result = await this.pistaRepository.obtenerPorId(id);
      const pista = result
        ? new Pista(
            result.id,
            result.idZona,
            result.nombre,
            result.dificultad,
            result.tipo,
            result.colorPresas,
            result.imagenUrl,
            result.posX,
            result.posY,
            result.fechaCreacion,
            result.fechaRetirada,
            result.activo
          )
        : null;

      if (!pista) return null;

      // Obtener el estado del escalador en esta pista
      let estado = null;
      if (escaladorApodo) {
        const escalador =
          await this.escaladorRepository.encontrarPorApodo(escaladorApodo);
        if (escalador) {
          estado = await this.pistaRepository.obtenerEstado(
            pista.id,
            escalador.id
          );
        }
      }

      return { ...pista, estado };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener la pista por ID',
        'PISTA_GET_BY_ID_FAILED',
        error
      );
    }
  }
}

export default ObtenerPistaPorId;
