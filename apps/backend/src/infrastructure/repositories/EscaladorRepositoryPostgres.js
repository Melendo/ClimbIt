const escaladorRepository = require('../../domain/escaladores/escaladorRepository');
const Escalador = require('../../domain/escaladores/Escalador');

class EscaladorRepositoryPostgres extends escaladorRepository {
  constructor(escaladorModel) {
    super();
    this.EscaladorModel = escaladorModel;
  }

  // Método privado para mapear
  _toDomain(escaladorModel) {
    if (!escaladorModel) return null;
    return new Escalador(
      escaladorModel.id,
      escaladorModel.nombre,
      escaladorModel.edad,
      escaladorModel.experiencia
    );
  }

  async crear(escalador) {
    const data = {
      nombre: escalador.nombre,
      edad: escalador.edad,
      experiencia: escalador.experiencia,
    };
    const escaladorModel = await this.EscaladorModel.create(data);

    return this._toDomain(escaladorModel);
  }
}

module.exports = EscaladorRepositoryPostgres;
