import ZonaRepository from '../../domain/zonas/zonaRepository.js';
import Zona from '../../domain/zonas/Zona.js';
import { ValidationError } from '../../domain/sharedObjects/AppError.js';
import mapRepositoryError from './dbErrorHandler.js';

class ZonaRepositoryPostgres extends ZonaRepository {
  constructor(zonaModel) {
    super();
    this.ZonaModel = zonaModel;
  }
  
  // Método privado para mapear
  _toDomain(zonaModel) {
    if (!zonaModel) return null;
    try {
      return new Zona(
        zonaModel.id,
        zonaModel.idRoco,
        zonaModel.nombre,
        zonaModel.mapa,
        zonaModel.activo
      );
    } catch (error) {
      throw new ValidationError(error.message, 'ZONA_MODEL_MAPPING_FAILED', error);
    }
  }
  
  async crearZona(zona) {
    try {
      const data = {
        idRoco: zona.idRoco,
        nombre: zona.nombre,
        mapa: zona.mapa,
      };
      const zonaModel = await this.ZonaModel.create(data);
      
      return this._toDomain(zonaModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al crear zona en persistencia',
        internalCode: 'ZONA_CREATE_DB_FAILED',
      });
    }
  }
  
  async obtenerPistasDeZona(idZona, idEscalador) {
    try {
      const includeOptions = [
        {
          association: 'pistas',
          include: idEscalador
          ? [
            {
              association: 'escaladores',
              where: { id: idEscalador },
              required: false,
            },
          ]
          : [],
          where: {
            activo: true,
          },
        },
      ];
      
      const zonaData = await this.ZonaModel.findByPk(idZona, {
        include: includeOptions,
      });
      
      if (!zonaData) {
        return null;
      }
      
      // Mapear las pistas asociadas
      const pistas = zonaData.pistas.map((pista) => {
        let estado = null;
        if (pista.escaladores && pista.escaladores.length > 0) {
          estado = pista.escaladores[0].EscalaPista.estado;
        }
        
        return {
          id: pista.id,
          idZona: pista.idZona,
          nombre: pista.nombre,
          dificultad: pista.dificultad,
          colorPresas: pista.colorPresas,
          tipo: pista.tipo,
          imagenUrl: pista.imagenUrl,
          posX: pista.posX,
          posY: pista.posY,
          fechaCreacion: pista.fechaCreacion,
          fechaRetirada: pista.fechaRetirada,
          estado,
        };
      });
      
      return pistas;
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al obtener las pistas de la zona',
        internalCode: 'ZONA_GET_PISTAS_DB_FAILED',
      });
    }
  }
  
  async encontrarPorId(idZona) {
    try {
      const zonaModel = await this.ZonaModel.findByPk(idZona);
      return this._toDomain(zonaModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al encontrar la zona por ID',
        internalCode: 'ZONA_FIND_BY_ID_DB_FAILED',
      });
    }
  }
  
  async actualizarMapaZona(idZona, mapaUrl) {
    try {
      const zonaModel = await this.ZonaModel.findByPk(idZona);
      
      if (!zonaModel) {
        return null;
      }
      
      zonaModel.mapa = mapaUrl;
      await zonaModel.save();
      
      return this._toDomain(zonaModel);
    } catch (error) {
      throw mapRepositoryError(error, {
        fallbackMessage: 'Error al actualizar el mapa de la zona',
        internalCode: 'ZONA_UPDATE_MAP_DB_FAILED',
      });
    }
  }
  
}

export default ZonaRepositoryPostgres;
