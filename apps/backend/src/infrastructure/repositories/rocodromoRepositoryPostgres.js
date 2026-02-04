import RocodromoRepository from '../../domain/rocodromos/rocodromoRepository.js';
import Rocodromo from '../../domain/rocodromos/Rocodromo.js';

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
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

    async obtenerZonasDeRocodromo(idRocodromo) {
    try {
      const rocodromoData = await this.RocodromoModel.findByPk(idRocodromo, {
        include: 'zonas',
      });

      if (!rocodromoData) {
        return null;
      }

      const zonas = rocodromoData.zonas.map((zona) => ({
        id: zona.id,
        idRoco: zona.idRoco,
        tipo: zona.tipo,
      }));

      return zonas;
    } catch (error) {
      throw new Error(`Error al obtener las zonas del rocódromo: ${error.message}`);
    }
  }

  async obtenerRocodromos() {
    try {
      const rocodromosData = await this.RocodromoModel.findAll();

      return rocodromosData.map((rocodromo) => this._toDomain(rocodromo));
    } catch (error) {
      throw new Error(`Error al obtener los rocodromos: ${error.message}`);
    }
  }

  async encontrarPorId(idRocodromo) {
    try {
      const rocodromoData = await this.RocodromoModel.findByPk(idRocodromo);

      return this._toDomain(rocodromoData);
    } catch (error) {
      throw new Error(`Error al encontrar el rocódromo por ID: ${error.message}`);
    }
  }

}

export default RocodromoRepositoryPostgres;
