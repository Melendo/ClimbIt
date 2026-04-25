import {
  AppError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class EliminarAmigo {
  constructor(
    escaladorRepository,
    amistadRepository,
    solicitudAmistadRepository,
    sequelize
  ) {
    this.escaladorRepository = escaladorRepository;
    this.amistadRepository = amistadRepository;
    this.solicitudAmistadRepository = solicitudAmistadRepository;
    this.sequelize = sequelize;
  }

  async execute({ apodoSolicitante, apodoAmigo }) {
    try {
      const solicitante = await this.escaladorRepository.encontrarPorApodo(apodoSolicitante);
      if (!solicitante) {
        throw new NotFoundError('Escalador solicitante no encontrado', 'ESCALADOR_SOLICITANTE_NOT_FOUND');
      }

      const amigo = await this.escaladorRepository.encontrarPorApodo(apodoAmigo);
      if (!amigo) {
        throw new NotFoundError('Escalador amigo no encontrado', 'ESCALADOR_AMIGO_NOT_FOUND');
      }

      if (solicitante.id === amigo.id) {
        throw new ConflictError(
          'No puedes eliminarte como amigo a ti mismo',
          'AMISTAD_AUTORELACION_INVALIDA'
        );
      }

      const existeAmistad = await this.amistadRepository.existeAmistadEntreEscaladores(
        solicitante.id,
        amigo.id
      );

      if (!existeAmistad) {
        throw new NotFoundError('La amistad no existe', 'AMISTAD_NOT_FOUND');
      }

      await this.sequelize.transaction(async (transaction) => {
        await this.amistadRepository.eliminarPorEscaladores(
          solicitante.id,
          amigo.id,
          transaction
        );

        await this.solicitudAmistadRepository.eliminarEntreEscaladores(
          solicitante.id,
          amigo.id,
          transaction
        );
      });

      return {
        mensaje: 'Amigo eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al eliminar amigo',
        'AMISTAD_ELIMINAR_AMIGO_FAILED',
        error
      );
    }
  }
}

export default EliminarAmigo;