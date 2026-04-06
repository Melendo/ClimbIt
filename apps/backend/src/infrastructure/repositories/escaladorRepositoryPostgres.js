import escaladorRepository from '../../domain/escaladores/escaladorRepository.js';
import Escalador from '../../domain/escaladores/Escalador.js';
import Rocodromo from '../../domain/rocodromos/Rocodromo.js';
import { NotFoundError, ValidationError } from '../../domain/sharedObjects/AppError.js';
import mapRepositoryError from './dbErrorHandler.js';

class EscaladorRepositoryPostgres extends escaladorRepository {
  constructor(escaladorModel) {
    super();
    this.EscaladorModel = escaladorModel;
  }

  // Método privado para mapear
  _toDomain(escaladorModel) {
    if (!escaladorModel) return null;
    try {
      const escalador = new Escalador(
        escaladorModel.id,
        escaladorModel.correo,
        escaladorModel.contrasena,
        escaladorModel.apodo,
        escaladorModel.descripcion,
        escaladorModel.idFotoPerfil,
        escaladorModel.activo
      );
      escalador.isAdmin = Boolean(escaladorModel.isAdmin);
      return escalador;
    } catch (error) {
      throw new ValidationError(error.message, 'ESCALADOR_MODEL_MAPPING_FAILED', error);
    }
  }

  async crear(escalador) {
    try {
      const data = {
        correo: escalador.correo,
        contrasena: escalador.contrasena,
        apodo: escalador.apodo,
      };
      const escaladorModel = await this.EscaladorModel.create(data);

      return this._toDomain(escaladorModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al crear escalador en persistencia',
        conflictMessage: 'El correo o apodo ya está registrado',
        conflictCode: 'ESCALADOR_DUPLICADO_DB',
        internalCode: 'ESCALADOR_CREATE_DB_FAILED',
      });
    }
  }

  async encontrarPorCorreo(correo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { correo },
      });
      return this._toDomain(escaladorModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al buscar escalador por correo',
        internalCode: 'ESCALADOR_FIND_BY_EMAIL_FAILED',
      });
    }
  }

  async encontrarPorApodo(apodo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo },
      });
      return this._toDomain(escaladorModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al buscar escalador por apodo',
        internalCode: 'ESCALADOR_FIND_BY_NICKNAME_FAILED',
      });
    }
  }

  async suscribirse(escaladorApodo, rocodromo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo: escaladorApodo },
      });

      if (!escaladorModel) {
        throw new NotFoundError(
          `Error al suscribirse al rocódromo: Escalador con apodo ${escaladorApodo} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      await escaladorModel.addRocodromo(rocodromo.id);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al suscribirse al rocódromo',
        internalCode: 'ESCALADOR_SUBSCRIBE_DB_FAILED',
      });
    }
  }

  async desuscribirse(escaladorApodo, idRocodromo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo: escaladorApodo },
      });

      if (!escaladorModel) {
        throw new NotFoundError(
          `Error al desuscribirse del rocódromo: Escalador con apodo ${escaladorApodo} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      await escaladorModel.removeRocodromo(idRocodromo);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al desuscribirse del rocódromo',
        internalCode: 'ESCALADOR_UNSUBSCRIBE_DB_FAILED',
      });
    }
  }

  async estaSuscrito(escaladorApodo, idRocodromo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo: escaladorApodo },
      });

      if (!escaladorModel) {
        throw new NotFoundError(
          `Error al verificar suscripción: Escalador con apodo ${escaladorApodo} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      const rocodromos = await escaladorModel.getRocodromos({
        where: { id: idRocodromo },
      });

      return rocodromos.length > 0;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al verificar suscripción',
        internalCode: 'ESCALADOR_SUBSCRIPTION_CHECK_DB_FAILED',
      });
    }
  }

  async obtenerRocodromosSuscritos(escaladorId) {
    try {
      const escaladorModel = await this.EscaladorModel.findByPk(escaladorId);

      if (!escaladorModel) {
        throw new NotFoundError(
          `Error al obtener rocódromos suscritos: Escalador con ID ${escaladorId} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      const rocodromos = await escaladorModel.getRocodromos();
      const rocodromosDomain = rocodromos.map(rocodromoModel => {
        return new Rocodromo(
          rocodromoModel.id,
          rocodromoModel.nombre,
          rocodromoModel.ubicacion,
          rocodromoModel.logoUrl,
          rocodromoModel.descripcion,
          rocodromoModel.horarios,
          rocodromoModel.dificultadBloque,
          rocodromoModel.dificultadVia,
          rocodromoModel.activo
        );
      });
      return rocodromosDomain;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener rocódromos suscritos',
        internalCode: 'ESCALADOR_SUBSCRIPTIONS_FETCH_DB_FAILED',
      });
    }
  }

  async obtenerIdsRocodromosGestionados(escaladorId) {
    try {
      const escaladorModel = await this.EscaladorModel.findByPk(escaladorId);

      if (!escaladorModel) {
        throw new NotFoundError(
          `Error al obtener rocódromos gestionados: Escalador con ID ${escaladorId} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      const rocodromos = await escaladorModel.getRocodromosGestionados({
        attributes: ['id'],
        joinTableAttributes: [],
      });

      return rocodromos.map((rocodromo) => rocodromo.id);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener rocódromos gestionados',
        internalCode: 'ESCALADOR_MANAGED_ROCODROMOS_FETCH_DB_FAILED',
      });
    }
  }

  async actualizarFotoPerfilId(escaladorApodo, idFotoPerfil) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo: escaladorApodo },
      });

      if (!escaladorModel) {
        return null;
      }

      escaladorModel.idFotoPerfil = idFotoPerfil;
      await escaladorModel.save();

      return this._toDomain(escaladorModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al actualizar la foto del escalador',
        internalCode: 'ESCALADOR_PROFILE_PHOTO_UPDATE_DB_FAILED',
      });
    }
  }
}

export default EscaladorRepositoryPostgres;
