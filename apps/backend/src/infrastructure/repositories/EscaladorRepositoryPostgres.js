const escaladorRepository = require('../../domain/escaladores/escaladorRepository');
const Esc = require('../../domain/escaladores/Escalador');

class EscaladorRepositoryPostgres extends escaladorRepository {
  constructor(escaladorModel) {
    super();
    this.EscaladorModel = escaladorModel;
  }

  // Método privado para mapear
  _toDomain(escaladorModel) {
    if (!escaladorModel) return null;
    return new Esc(
      escaladorModel.id,
      escaladorModel.nombre,
      escaladorModel.edad,
      escaladorModel.experiencia
    );
  }

  async crear(escalador) {
    console.log('Creando escalador con datos:', escalador, '-repository');

    // 👇 ESTO ES LO CORRECTO: Creas un objeto simple para Sequelize
    const data = {
      nombre: escalador.nombre,
      edad: escalador.edad,
      experiencia: escalador.experiencia,
    };
    console.log('DATA:' + escalador.nombre);
    // Pasas el objeto 'data' en lugar de la clase 'escalador'
    const escaladorModel = await this.EscaladorModel.create(data);

    console.log('Escalador creado:', escaladorModel);
    return this._toDomain(escaladorModel);
  }
}

module.exports = EscaladorRepositoryPostgres;
