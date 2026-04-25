import { Op } from 'sequelize';
import AmistadRepository from '../../domain/amistades/amistadRepository.js';
import Amistad from '../../domain/amistades/Amistad.js';
import mapRepositoryError from './dbErrorHandler.js';

class AmistadRepositoryPostgres extends AmistadRepository {
  constructor(amistadModel) {
    super();
    this.AmistadModel = amistadModel;
  }

  _toDomain(model) {
    if (!model) return null;

    return new Amistad(
      model.id,
      model.idEscalador1,
      model.idEscalador2,
      model.fechaInicio || model.createdAt
    );
  }

  async crear(amistad, transaction = null) {
    try {
      const amistadModel = await this.AmistadModel.create(
        {
          idEscalador1: amistad.idEscalador1,
          idEscalador2: amistad.idEscalador2,
          fechaInicio: amistad.fechaInicio,
        },
        { transaction }
      );

      return this._toDomain(amistadModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al crear amistad',
        conflictMessage: 'La amistad ya existe',
        conflictCode: 'AMISTAD_DUPLICADA_DB',
        internalCode: 'AMISTAD_CREATE_DB_FAILED',
      });
    }
  }

  async existeAmistadEntreEscaladores(idEscalador1, idEscalador2) {
    try {
      const [menor, mayor] = [idEscalador1, idEscalador2].sort((a, b) => a - b);
      const amistad = await this.AmistadModel.findOne({
        where: {
          idEscalador1: menor,
          idEscalador2: mayor,
        },
      });

      return Boolean(amistad);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al verificar amistad',
        internalCode: 'AMISTAD_CHECK_DB_FAILED',
      });
    }
  }

  async eliminarPorEscaladores(idEscalador1, idEscalador2, transaction = null) {
    try {
      const [menor, mayor] = [idEscalador1, idEscalador2].sort((a, b) => a - b);
      const deletedRows = await this.AmistadModel.destroy({
        where: {
          idEscalador1: menor,
          idEscalador2: mayor,
        },
        transaction,
      });

      return deletedRows > 0;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al eliminar amistad',
        internalCode: 'AMISTAD_DELETE_DB_FAILED',
      });
    }
  }

  async listarIdsAmigosDeEscalador(idEscalador) {
    try {
      const amistades = await this.AmistadModel.findAll({
        where: {
          [Op.or]: [{ idEscalador1: idEscalador }, { idEscalador2: idEscalador }],
        },
        attributes: ['idEscalador1', 'idEscalador2'],
      });

      return amistades.flatMap((amistad) => [
        amistad.idEscalador1 === idEscalador ? amistad.idEscalador2 : amistad.idEscalador1,
      ]);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al listar amigos',
        internalCode: 'AMISTAD_LIST_DB_FAILED',
      });
    }
  }
}

export default AmistadRepositoryPostgres;