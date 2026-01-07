import zonaRepository from '../../domain/zonas/zonaRepository.js';
import Zona from '../../domain/zonas/Zona.js';

class ZonaRepositoryPostgres extends zonaRepository {
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
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

    async obtenerPistasDeZona(idZona) {
    try {
      const zonaData = await this.ZonaModel.findByPk(idZona, {
        include: 'pistas',
      });

      if (!zonaData) {
        return null;
      }

      // Mapear las pistas asociadas
      const pistas = zonaData.pistas.map((pista) => ({
        id: pista.id,
        idZona: pista.idZona,
        nombre: pista.nombre,
        dificultad: pista.dificultad,
      }));

      return pistas;
    } catch (error) {
      throw new Error(`Error al obtener las pistas de la zona: ${error.message}`);
    }
  }

}

export default ZonaRepositoryPostgres;
