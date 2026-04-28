import { NotFoundError } from '../../domain/sharedObjects/AppError.js';

class ListarSolicitudesPendientes {
  constructor(escaladorRepository, solicitudAmistadRepository) {
    this.escaladorRepository = escaladorRepository;
    this.solicitudAmistadRepository = solicitudAmistadRepository;
  }

  async execute({ apodoEscalador }) {
    // 1. Validar que el escalador existe
    const escaladorDestinatario =
      await this.escaladorRepository.encontrarPorApodo(apodoEscalador);
    if (!escaladorDestinatario) {
      throw new NotFoundError(
        'El escalador destinatario no existe',
        'ESCALADOR_NOT_FOUND'
      );
    }

    // 2. Obtener las solicitudes pendientes
    const solicitudes =
      await this.solicitudAmistadRepository.obtenerPendientesPorDestinatario(
        escaladorDestinatario.id
      );

    return solicitudes.map((solicitud) => ({
      idSolicitud: solicitud.id,
      idRemitente: solicitud.remitente.id,
      apodo: solicitud.remitente.apodo,
      descripcion: solicitud.remitente.descripcion,
      idFotoPerfil: solicitud.remitente.idFotoPerfil,
      createdAt: solicitud.createdAt,
    }));
  }
}

export default ListarSolicitudesPendientes;
