import { Op } from 'sequelize';
import SolicitudAmistadRepository from '../../domain/amistades/solicitudAmistadRepository.js';
import SolicitudAmistad from '../../domain/amistades/SolicitudAmistad.js';
import mapRepositoryError from './dbErrorHandler.js';

class SolicitudAmistadRepositoryPostgres extends SolicitudAmistadRepository {
  constructor(solicitudAmistadModel) {
    super();
    this.SolicitudAmistadModel = solicitudAmistadModel;
  }

  _toDomain(model) {
    if (!model) return null;

    return new SolicitudAmistad(
      model.id,
      model.idRemitente,
      model.idDestinatario,
      model.estado,
      model.createdAt
    );
  }

  async crear(solicitudAmistad, transaction = null) {
    try {
      const solicitud = await this.SolicitudAmistadModel.create(
        {
          idRemitente: solicitudAmistad.idRemitente,
          idDestinatario: solicitudAmistad.idDestinatario,
          estado: solicitudAmistad.estado,
        },
        { transaction }
      );

      return this._toDomain(solicitud);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al crear solicitud de amistad',
        conflictMessage: 'La solicitud de amistad ya existe',
        conflictCode: 'SOLICITUD_AMISTAD_DUPLICADA_DB',
        internalCode: 'SOLICITUD_AMISTAD_CREATE_DB_FAILED',
      });
    }
  }

  async existePendienteEntreEscaladores(idEscalador1, idEscalador2) {
    try {
      const solicitud = await this.SolicitudAmistadModel.findOne({
        where: {
          estado: 'pendiente',
          [Op.or]: [
            { idRemitente: idEscalador1, idDestinatario: idEscalador2 },
            { idRemitente: idEscalador2, idDestinatario: idEscalador1 },
          ],
        },
      });

      return Boolean(solicitud);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al verificar solicitudes pendientes',
        internalCode: 'SOLICITUD_AMISTAD_PENDING_CHECK_FAILED',
      });
    }
  }

  async encontrarPorId(id) {
    try {
      const solicitud = await this.SolicitudAmistadModel.findByPk(id);
      return this._toDomain(solicitud);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al buscar solicitud por ID',
        internalCode: 'SOLICITUD_AMISTAD_FIND_BY_ID_FAILED',
      });
    }
  }

  async actualizarEstado(id, estado, transaction = null) {
    try {
      const solicitud = await this.SolicitudAmistadModel.findByPk(id, {
        transaction,
      });

      if (!solicitud) return null;

      solicitud.estado = estado;
      await solicitud.save({ transaction });
      return this._toDomain(solicitud);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al actualizar estado de solicitud',
        internalCode: 'SOLICITUD_AMISTAD_UPDATE_STATE_FAILED',
      });
    }
  }

  async eliminarPorId(id, transaction = null) {
    try {
      const deletedRows = await this.SolicitudAmistadModel.destroy({
        where: { id },
        transaction,
      });

      return deletedRows > 0;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al eliminar solicitud de amistad',
        internalCode: 'SOLICITUD_AMISTAD_DELETE_FAILED',
      });
    }
  }

  async eliminarEntreEscaladores(
    idEscalador1,
    idEscalador2,
    transaction = null
  ) {
    try {
      return await this.SolicitudAmistadModel.destroy({
        where: {
          [Op.or]: [
            { idRemitente: idEscalador1, idDestinatario: idEscalador2 },
            { idRemitente: idEscalador2, idDestinatario: idEscalador1 },
          ],
        },
        transaction,
      });
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al eliminar solicitudes entre escaladores',
        internalCode: 'SOLICITUD_AMISTAD_DELETE_BETWEEN_FAILED',
      });
    }
  }

  async obtenerPendientesPorDestinatario(idDestinatario) {
    try {
      const solicitudes = await this.SolicitudAmistadModel.findAll({
        where: {
          idDestinatario,
          estado: 'pendiente',
        },
        include: [
          {
            association: 'remitente',
            attributes: ['id', 'apodo', 'descripcion', 'idFotoPerfil'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return solicitudes.map((solicitud) => {
        const domainModel = this._toDomain(solicitud);
        // Adjuntar datos del remitente que no forman parte del dominio estricto
        // pero que son necesarios para la vista.
        domainModel.remitente = {
          id: solicitud.remitente.id,
          apodo: solicitud.remitente.apodo,
          descripcion: solicitud.remitente.descripcion,
          idFotoPerfil: solicitud.remitente.idFotoPerfil,
        };
        return domainModel;
      });
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener solicitudes pendientes',
        internalCode: 'SOLICITUD_AMISTAD_GET_PENDING_FAILED',
      });
    }
  }
}

export default SolicitudAmistadRepositoryPostgres;
