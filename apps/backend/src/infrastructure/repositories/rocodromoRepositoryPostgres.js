import RocodromoRepository from '../../domain/rocodromos/rocodromoRepository.js';
import Rocodromo from '../../domain/rocodromos/Rocodromo.js';
import { NotFoundError, ValidationError } from '../../domain/sharedObjects/AppError.js';
import mapRepositoryError from './dbErrorHandler.js';

class RocodromoRepositoryPostgres extends RocodromoRepository {
  constructor(rocodromoModel) {
    super();
    this.RocodromoModel = rocodromoModel;
  }

  // Método privado para mapear
  _toDomain(rocodromoModel) {
    if (!rocodromoModel) return null;
    try {
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
    } catch (error) {
      throw new ValidationError(error.message, 'ROCODROMO_MODEL_MAPPING_FAILED', error);
    }
  }

  async crearRocodromo(rocodromo) {
    try {
      const data = {
        nombre: rocodromo.nombre,
        ubicacion: rocodromo.ubicacion,
        logoUrl: rocodromo.logoUrl,
        descripcion: rocodromo.descripcion,
        horarios: rocodromo.horarios,
        dificultadBloque: rocodromo.dificultadBloque,
        dificultadVia: rocodromo.dificultadVia,
      };
      const rocodromoModel = await this.RocodromoModel.create(data);

      return this._toDomain(rocodromoModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al crear rocódromo en persistencia',
        internalCode: 'ROCODROMO_CREATE_DB_FAILED',
      });
    }
  }

  async obtenerZonasDeRocodromo(idRocodromo) {
    try {
      const rocodromoData = await this.RocodromoModel.findByPk(idRocodromo, {
        include: [{
          association: 'zonas',
          separate: true,
          order: [['id', 'ASC']]
        }],
      });

      if (!rocodromoData) {
        return null;
      }

      const zonas = rocodromoData.zonas.map((zona) => ({
        id: zona.id,
        idRoco: zona.idRoco,
        nombre: zona.nombre,
        mapa: zona.mapa
      }));

      return zonas;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener las zonas del rocódromo',
        internalCode: 'ROCODROMO_GET_ZONES_DB_FAILED',
      });
    }
  }

  async obtenerRocodromos() {
    try {
      const rocodromosData = await this.RocodromoModel.findAll();

      return rocodromosData.map((rocodromo) => this._toDomain(rocodromo));
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener los rocodromos',
        internalCode: 'ROCODROMO_LIST_DB_FAILED',
      });
    }
  }

  async encontrarPorId(idRocodromo) {
    try {
      const rocodromoData = await this.RocodromoModel.findByPk(idRocodromo);

      return this._toDomain(rocodromoData);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al encontrar el rocódromo por ID',
        internalCode: 'ROCODROMO_FIND_BY_ID_DB_FAILED',
      });
    }
  }

  async actualizarLogoRocodromo(idRocodromo, logoUrl) {
    try {
      const rocodromoModel = await this.RocodromoModel.findByPk(idRocodromo);

      if (!rocodromoModel) {
        return null;
      }

      rocodromoModel.logoUrl = logoUrl;
      await rocodromoModel.save();

      return this._toDomain(rocodromoModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al actualizar el logo del rocódromo',
        internalCode: 'ROCODROMO_UPDATE_LOGO_DB_FAILED',
      });
    }
  }

  async actualizarInformacion(rocodromo) {
    try {
      const rocodromoModel = await this.RocodromoModel.findByPk(rocodromo.id);

      if (!rocodromoModel) {
        throw new NotFoundError(
          `Rocodromo con ID ${rocodromo.id} no encontrado`,
          'ROCODROMO_NOT_FOUND'
        );
      }

      const data = {
        nombre: rocodromo.nombre,
        ubicacion: rocodromo.ubicacion,
        descripcion: rocodromo.descripcion,
        horarios: rocodromo.horarios
      };

      await rocodromoModel.update(data);
      await rocodromoModel.save();

      return this._toDomain(rocodromoModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al actualizar la informacion del rocodromo',
        internalCode: 'ROCODROMO_UPDATE_DB_FAILED',
      });
    }
  }

  async obtenerEscalasDificultad(idRocodromo) {
    try {
      const rocodromoData = await this.RocodromoModel.findByPk(idRocodromo, {
        include: ['escalaDificultadBloque', 'escalaDificultadVia'],
      });

      if (!rocodromoData) {
        return null;
      }
      const toEscalaDTO = (escala) => {
        if (!escala) return null;
        return {
          id: escala.id,
          nombre: escala.nombre,
          dificultades: escala.dificultades,
          isColor: escala.isColor,
        };
      };
      return {
        escalaDificultadBloque: toEscalaDTO(rocodromoData.escalaDificultadBloque),
        escalaDificultadVia: toEscalaDTO(rocodromoData.escalaDificultadVia),
      };
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener las escalas de dificultad del rocódromo',
        internalCode: 'ROCODROMO_GET_DIFFICULTY_SCALES_DB_FAILED',
      });
    }
  }
}

export default RocodromoRepositoryPostgres;
