import {
  AppError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';
import SolicitudAmistad from '../../domain/amistades/SolicitudAmistad.js';

class EnviarSolicitudAmistad {
  constructor(
    escaladorRepository,
    solicitudAmistadRepository,
    amistadRepository
  ) {
    this.escaladorRepository = escaladorRepository;
    this.solicitudAmistadRepository = solicitudAmistadRepository;
    this.amistadRepository = amistadRepository;
  }

  async execute({ apodoRemitente, apodoDestinatario }) {
    try {
      const remitente =
        await this.escaladorRepository.encontrarPorApodo(apodoRemitente);
      if (!remitente) {
        throw new NotFoundError(
          `Escalador remitente ${apodoRemitente} no encontrado`,
          'ESCALADOR_REMITENTE_NOT_FOUND'
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

      if (remitente.id === destinatario.id) {
        throw new ConflictError(
          'No puedes enviarte una solicitud de amistad a ti mismo',
          'SOLICITUD_AMISTAD_AUTOPROPUESTA'
        );
      }

      const yaSonAmigos =
        await this.amistadRepository.existeAmistadEntreEscaladores(
          remitente.id,
          destinatario.id
        );
      if (yaSonAmigos) {
        throw new ConflictError(
          'Ya existe una amistad entre ambos escaladores',
          'AMISTAD_YA_EXISTENTE'
        );
      }

      const haySolicitudPendiente =
        await this.solicitudAmistadRepository.existePendienteEntreEscaladores(
          remitente.id,
          destinatario.id
        );
      if (haySolicitudPendiente) {
        throw new ConflictError(
          'Ya existe una solicitud pendiente entre ambos escaladores',
          'SOLICITUD_AMISTAD_PENDIENTE'
        );
      }

      const solicitud = new SolicitudAmistad(
        null,
        remitente.id,
        destinatario.id,
        'pendiente'
      );

      const solicitudCreada =
        await this.solicitudAmistadRepository.crear(solicitud);

      return {
        mensaje: 'Solicitud de amistad enviada correctamente',
        solicitud: solicitudCreada,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al enviar solicitud de amistad',
        'SOLICITUD_AMISTAD_SEND_FAILED',
        error
      );
    }
  }
}

export default EnviarSolicitudAmistad;
