import ZonaRepository from '../../domain/zonas/zonaRepository.js';
import Zona from '../../domain/zonas/Zona.js';

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
        zonaModel.tipo,
      );
    } catch (error) {
      throw new Error(error.message);
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
          estado,
        };
      });

      return pistas;
    } catch (error) {
      throw new Error(`Error al obtener las pistas de la zona: ${error.message}`);
    }
  }

}

export default ZonaRepositoryPostgres;
