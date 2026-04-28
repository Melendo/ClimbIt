import {
  AppError,
  AuthorizationError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../../domain/sharedObjects/AppError.js';
import Amistad from '../../domain/amistades/Amistad.js';

class ResponderSolicitudAmistad {
  constructor(
    escaladorRepository,
    solicitudAmistadRepository,
    amistadRepository,
    sequelize
  ) {
    this.escaladorRepository = escaladorRepository;
    this.solicitudAmistadRepository = solicitudAmistadRepository;
    this.amistadRepository = amistadRepository;
    this.sequelize = sequelize;
  }

  async execute({ apodoDestinatario, idSolicitud, respuesta }) {
    try {
      if (!['aceptada', 'rechazada'].includes(respuesta)) {
        throw new ValidationError(
          'La respuesta debe ser aceptada o rechazada',
          'SOLICITUD_AMISTAD_RESPUESTA_INVALIDA'
        );
      }

      const destinatario =
        await this.escaladorRepository.encontrarPorApodo(apodoDestinatario);
      if (!destinatario) {
        throw new NotFoundError(
          `Escalador destinatario ${apodoDestinatario} no encontrado`,
          'ESCALADOR_DESTINATARIO_NOT_FOUND'
        );
      }

      const solicitud =
        await this.solicitudAmistadRepository.encontrarPorId(idSolicitud);
      if (!solicitud) {
        throw new NotFoundError(
          `Solicitud de amistad con ID ${idSolicitud} no encontrada`,
          'SOLICITUD_AMISTAD_NOT_FOUND'
        );
      }

      if (solicitud.idDestinatario !== destinatario.id) {
        throw new AuthorizationError(
          'No tienes permisos para responder esta solicitud',
          'SOLICITUD_AMISTAD_FORBIDDEN'
        );
      }

      if (solicitud.estado !== 'pendiente') {
        throw new ConflictError(
          'La solicitud ya fue respondida previamente',
          'SOLICITUD_AMISTAD_NO_PENDIENTE'
        );
      }

      const yaSonAmigos =
        await this.amistadRepository.existeAmistadEntreEscaladores(
          solicitud.idRemitente,
          solicitud.idDestinatario
        );

      if (yaSonAmigos) {
        throw new ConflictError(
          'La amistad ya existe entre ambos escaladores',
          'AMISTAD_YA_EXISTENTE'
        );
      }

      let amistadCreada = null;
      await this.sequelize.transaction(async (transaction) => {
        await this.solicitudAmistadRepository.actualizarEstado(
          solicitud.id,
          respuesta,
          transaction
        );

        if (respuesta === 'aceptada') {
          const [idEscalador1, idEscalador2] = [
            solicitud.idRemitente,
            solicitud.idDestinatario,
          ].sort((a, b) => a - b);

          amistadCreada = await this.amistadRepository.crear(
            new Amistad(null, idEscalador1, idEscalador2, new Date()),
            transaction
          );
        }
      });

      return {
        mensaje:
          respuesta === 'aceptada'
            ? 'Solicitud de amistad aceptada correctamente'
            : 'Solicitud de amistad rechazada correctamente',
        solicitud: {
          id: solicitud.id,
          estado: respuesta,
        },
        amistad: amistadCreada,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al responder solicitud de amistad',
        'SOLICITUD_AMISTAD_RESPONSE_FAILED',
        error
      );
    }
  }
}

export default ResponderSolicitudAmistad;
