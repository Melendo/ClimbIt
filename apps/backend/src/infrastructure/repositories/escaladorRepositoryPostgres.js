import escaladorRepository from '../../domain/escaladores/escaladorRepository.js';
import Escalador from '../../domain/escaladores/Escalador.js';

class EscaladorRepositoryPostgres extends escaladorRepository {
  constructor(escaladorModel) {
    super();
    this.EscaladorModel = escaladorModel;
  }

  // Método privado para mapear
  _toDomain(escaladorModel) {
    if (!escaladorModel) return null;
    try {
      return new Escalador(
        escaladorModel.id,
        escaladorModel.correo,
        escaladorModel.contrasena,
        escaladorModel.apodo
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async crear(escalador) {
   
    const data = {
      correo: escalador.correo,
      contrasena: escalador.contrasena,
      apodo: escalador.apodo,
    };
    const escaladorModel = await this.EscaladorModel.create(data);

    return this._toDomain(escaladorModel);
  }

  async encontrarPorCorreo(correo) {
    const escaladorModel = await this.EscaladorModel.findOne({
      where: { correo },
    });
    return this._toDomain(escaladorModel);
  }
}

export default EscaladorRepositoryPostgres;