import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarDescripcionEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute({ apodo, descripcion }) {
    try {
      const escalador = await this.escaladorRepository.actualizarDescripcion(
        apodo,
        descripcion
      );

      if (!escalador) {
        throw new NotFoundError('Escalador no encontrado', 'ESCALADOR_NOT_FOUND');
      }

      return {
        id: escalador.id,
        correo: escalador.correo,
        apodo: escalador.apodo,
        descripcion: escalador.descripcion,
        idFotoPerfil: escalador.idFotoPerfil,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar la descripcion del escalador',
        'ESCALADOR_DESCRIPCION_UPDATE_FAILED',
        error
      );
    }
  }
}

export default ActualizarDescripcionEscalador;
