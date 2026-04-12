import { fn, col } from 'sequelize';
import pistaRepository from '../../domain/pistas/pistaRepository.js';
import Pista from '../../domain/pistas/Pista.js';
import { NotFoundError, ValidationError } from '../../domain/sharedObjects/AppError.js';
import mapRepositoryError from './dbErrorHandler.js';

class PistaRepositoryPostgres extends pistaRepository {
  constructor(pistaModel) {
    super();
    this.PistaModel = pistaModel;
  }

  // Método privado para mapear
  _toDomain(pistaModel) {
    if (!pistaModel) return null;
    try {
      return new Pista(
        pistaModel.id,
        pistaModel.idZona,
        pistaModel.nombre,
        pistaModel.dificultad,
        pistaModel.tipo,
        pistaModel.colorPresas,
        pistaModel.imagenUrl,
        pistaModel.posX,
        pistaModel.posY,
        pistaModel.fechaCreacion,
        pistaModel.fechaRetirada,
        pistaModel.activo
      );
    } catch (error) {
      throw new ValidationError(error.message, 'PISTA_MODEL_MAPPING_FAILED', error);
    }
  }

  async crear(pista) {
    try {
      const data = {
        idZona: pista.idZona,
        nombre: pista.nombre,
        dificultad: pista.dificultad,
        tipo: pista.tipo,
        colorPresas: pista.colorPresas,
        imagenUrl: pista.imagenUrl,
        posX: pista.posX,
        posY: pista.posY,
        fechaCreacion: pista.fechaCreacion,
        fechaRetirada: pista.fechaRetirada,
      };
      const pistaModel = await this.PistaModel.create(data);

      return this._toDomain(pistaModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al crear pista en persistencia',
        internalCode: 'PISTA_CREATE_DB_FAILED',
      });
    }
  }

  async obtenerPorId(id) {
    try {
      const pistaModel = await this.PistaModel.findByPk(id);
      return pistaModel ? this._toDomain(pistaModel) : null;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener pista por ID',
        internalCode: 'PISTA_FIND_BY_ID_DB_FAILED',
      });
    }
  }

  async cambiarEstado(idPista, idEscalador, nuevoEstado) {
    try {
      const pistaModel = await this.PistaModel.findByPk(idPista, {
        include: [
          {
            association: 'escaladores',
            where: { id: idEscalador },
            required: false,
          },
        ],
      });

      if (!pistaModel) {
        throw new NotFoundError(
          `Cambiar estado pista: Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      // Verificar si ya existe la relación
      if (pistaModel.escaladores && pistaModel.escaladores.length > 0) {
        // Si existe, actualizar el estado
        const escaladorData = pistaModel.escaladores[0];
        await escaladorData.EscalaPista.update({ estado: nuevoEstado });
      } else {
        // Si no existe, crear la relación
        await pistaModel.addEscaladores(idEscalador, {
          through: { estado: nuevoEstado },
        });
      }
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al cambiar estado de pista',
        internalCode: 'PISTA_CHANGE_STATE_DB_FAILED',
      });
    }
  }

  async actualizarImagenUrl(id, imagenUrl) {
    try {
      const pistaModel = await this.PistaModel.findByPk(id);
      if (!pistaModel) return null;

      await pistaModel.update({ imagenUrl });
      await pistaModel.save(); // Recargar para obtener los datos actualizados
      return this._toDomain(pistaModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al actualizar imagen de pista',
        internalCode: 'PISTA_UPDATE_IMAGE_DB_FAILED',
      });
    }
  }

  async actualizar(pista) {
    try {
      const pistaModel = await this.PistaModel.findByPk(pista.id);
      if (!pistaModel) {
        throw new NotFoundError(
          `Pista con ID ${pista.id} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      const data = {
        idZona: pista.idZona,
        nombre: pista.nombre,
        dificultad: pista.dificultad,
        tipo: pista.tipo,
        colorPresas: pista.colorPresas,
        posX: pista.posX,
        posY: pista.posY,
        fechaCreacion: pista.fechaCreacion,
        fechaRetirada: pista.fechaRetirada,
      };

      await pistaModel.update(data);
      await pistaModel.save();
      return this._toDomain(pistaModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al actualizar pista',
        internalCode: 'PISTA_UPDATE_DB_FAILED',
      });
    }
  }

  async desactivar(idPista) {
    try {
      const pistaModel = await this.PistaModel.findByPk(idPista);
      if (!pistaModel) {
        throw new NotFoundError(
          `Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      if (pistaModel.activo) {
        await pistaModel.update({ activo: false });
        await pistaModel.save();
      }

      return this._toDomain(pistaModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al inactivar pista',
        internalCode: 'PISTA_DISABLE_DB_FAILED',
      });
    }
  }

  async eliminarEstadoPista(idPista, idEscalador) {
    try {
      const pistaModel = await this.PistaModel.findByPk(idPista);
      if (!pistaModel) {
        throw new NotFoundError(
          `Eliminar estado pista: Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      await pistaModel.removeEscaladores(idEscalador);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al eliminar estado de pista',
        internalCode: 'PISTA_DELETE_STATE_DB_FAILED',
      });
    }
  }

  async obtenerEstado(idPista, idEscalador) {
    try {
      const pistaModel = await this.PistaModel.findByPk(idPista, {
        include: [
          {
            association: 'escaladores',
            where: { id: idEscalador },
            required: false,
          },
        ],
      });

      if (!pistaModel) return null;

      const escaladores = pistaModel.escaladores;
      if (escaladores && escaladores.length > 0) {
        return escaladores[0].EscalaPista.estado;
      }

      return null;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener estado de pista',
        internalCode: 'PISTA_GET_STATE_DB_FAILED',
      });
    }
  }

  async obtenerResumenEstadisticasEscalador(idEscalador) {
    try {
      const escalaPistaModel = this.PistaModel.sequelize.models.EscalaPista;
      const filas = await escalaPistaModel.findAll({
        where: { idEscalador },
        attributes: [
          [col('Estado'), 'estado'],
          [fn('COUNT', col('Estado')), 'total'],
        ],
        group: [col('Estado')],
        raw: true,
      });

      const totales = filas.reduce(
        (acc, fila) => {
          const estado = fila.estado;
          const total = Number(fila.total) || 0;
          if (estado === 'flash') {
            acc.totalFlash = total;
          } else if (estado === 'completado') {
            acc.totalCompletado = total;
          } else if (estado === 'proyecto') {
            acc.totalProyecto = total;
          }
          return acc;
        },
        {
          totalFlash: 0,
          totalCompletado: 0,
          totalProyecto: 0,
        }
      );

      const totalRutas = totales.totalFlash + totales.totalCompletado;
      const porcentajeFlash =
        totalRutas > 0 ? (totales.totalFlash / totalRutas) * 100 : 0;
 
      return {
        totalRutas,
        totalFlash: totales.totalFlash,
        totalCompletado: totales.totalCompletado,
        totalProyecto: totales.totalProyecto,
        porcentajeFlash,
      };
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener resumen de estadisticas del escalador',
        internalCode: 'PISTA_STATS_RESUMEN_DB_FAILED',
      });
    }
  }

  async obtenerTiposEstadisticasEscalador(idEscalador) {
    try {
      const filas = await this.PistaModel.findAll({
        attributes: [
          'tipo',
          [fn('COUNT', col('Pista.IDPista')), 'total'],
        ],
        include: [
          {
            association: 'escaladores',
            attributes: [],
            through: {
              attributes: [],
              where: {
                idEscalador,
                estado: ['flash', 'completado'],
              },
            },
            required: true,
          },
        ],
        group: [col('Pista.Tipo')],
        raw: true,
      });

      const totales = filas.reduce(
        (acc, fila) => {
          const tipo = fila.tipo;
          const total = Number(fila.total) || 0;

          if (tipo === 'boulder') {
            acc.totalBloques = total;
          } else if (tipo === 'via') {
            acc.totalVias = total;
          }

          return acc;
        },
        {
          totalBloques: 0,
          totalVias: 0,
        }
      );

      const totalRutas = totales.totalBloques + totales.totalVias;
      const porcentajeBloques =
        totalRutas > 0 ? (totales.totalBloques / totalRutas) * 100 : 0;
      const porcentajeVias =
        totalRutas > 0 ? (totales.totalVias / totalRutas) * 100 : 0;

      return {
        totalBloques: totales.totalBloques,
        totalVias: totales.totalVias,
        porcentajeBloques,
        porcentajeVias,
        favoritaTexto:
          totales.totalBloques >= totales.totalVias ? 'Bloque' : 'Via',
      };
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage:
          'Error al obtener distribucion por tipo de rutas del escalador',
        internalCode: 'PISTA_STATS_TIPOS_DB_FAILED',
      });
    }
  }
}

export default PistaRepositoryPostgres;
