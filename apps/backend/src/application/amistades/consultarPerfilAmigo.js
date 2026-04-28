import {
  AppError,
  AuthorizationError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ConsultarPerfilAmigo {
  constructor(escaladorRepository, amistadRepository) {
    this.escaladorRepository = escaladorRepository;
    this.amistadRepository = amistadRepository;
  }

  async execute({ apodoSolicitante, apodoPerfil }) {
    try {
      const solicitante =
        await this.escaladorRepository.encontrarPorApodo(apodoSolicitante);
      if (!solicitante) {
        throw new NotFoundError(
          'Escalador solicitante no encontrado',
          'ESCALADOR_SOLICITANTE_NOT_FOUND'
        );
      }

      const amigo =
        await this.escaladorRepository.encontrarPorApodo(apodoPerfil);
      if (!amigo) {
        throw new NotFoundError(
          'Escalador no encontrado',
          'ESCALADOR_PERFIL_NOT_FOUND'
        );
      }

      const existeAmistad =
        await this.amistadRepository.existeAmistadEntreEscaladores(
          solicitante.id,
          amigo.id
        );

      if (!existeAmistad) {
        throw new AuthorizationError(
          'No tienes permisos para consultar este perfil',
          'PERFIL_AMIGO_FORBIDDEN'
        );
      }

      return {
        id: amigo.id,
        correo: amigo.correo,
        apodo: amigo.apodo,
        descripcion: amigo.descripcion,
        idFotoPerfil: amigo.idFotoPerfil,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al consultar perfil de amigo',
        'AMISTAD_PERFIL_AMIGO_FAILED',
        error
      );
    }
  }
}

export default ConsultarPerfilAmigo;
