import pistaRepository from '../../domain/pistas/pistaRepository.js';
import Pista from '../../domain/pistas/Pista.js';

class PistaRepositoryPostgres extends pistaRepository {
  constructor(pistaModel) {
    super();
    this.PistaModel = pistaModel;
  }

  // Método privado para mapear
  _toDomain(pistaModel) {
    if (!pistaModel) return null;
    return new Pista(pistaModel.id, pistaModel.nombre, pistaModel.dificultad);
  }

  async crear(pista) {
    const data = {
      nombre: pista.nombre,
      dificultad: pista.dificultad,
    };
    const pistaModel = await this.PistaModel.create(data);

    return this._toDomain(pistaModel);
  }

  async obtenerPorId(id) {
    const pistaModel = await this.PistaModel.findByPk(id);
    return pistaModel ? this._toDomain(pistaModel) : null;
  }
}

export default PistaRepositoryPostgres;
