import Pista from '../../domain/pistas/Pista.js';
import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarPista {
  constructor(pistaRepository, zonaModel) {
    this.pistaRepository = pistaRepository;
    this.zonaModel = zonaModel;
  }

  async execute({
    idPista,
    idZona,
    nombre,
    tipo,
    dificultad,
    colorPresas,
    posX,
    posY,
    fechaCreacion,
    fechaRetirada,
  }) {
    try {
      const pistaActual = await this.pistaRepository.obtenerPorId(idPista);
      if (!pistaActual) {
        throw new NotFoundError(
          `Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      if (idZona !== undefined && idZona !== null) {
        const zonaExistente = await this.zonaModel.findByPk(idZona);
        if (!zonaExistente) {
          throw new NotFoundError(
            `La zona con ID ${idZona} no existe`,
            'ZONA_NOT_FOUND'
          );
        }
      }

      const resolveValue = (value, fallback) =>
        value !== undefined ? value : fallback;

      const pistaActualizada = new Pista(
        pistaActual.id,
        resolveValue(idZona, pistaActual.idZona),
        resolveValue(nombre, pistaActual.nombre),
        resolveValue(dificultad, pistaActual.dificultad),
        resolveValue(tipo, pistaActual.tipo),
        resolveValue(colorPresas, pistaActual.colorPresas),
        pistaActual.imagenUrl,
        resolveValue(posX, pistaActual.posX),
        resolveValue(posY, pistaActual.posY),
        resolveValue(fechaCreacion, pistaActual.fechaCreacion),
        resolveValue(fechaRetirada, pistaActual.fechaRetirada),
        pistaActual.activo
      );

      return await this.pistaRepository.actualizar(pistaActualizada);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar la pista',
        'PISTA_UPDATE_FAILED',
        error
      );
    }
  }
}

export default ActualizarPista;
