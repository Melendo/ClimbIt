const pistaRepository = require('../../domain/pistas/pistaRepository');
const Pista = require('../../domain/pistas/Pista');

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
}

module.exports = PistaRepositoryPostgres;
