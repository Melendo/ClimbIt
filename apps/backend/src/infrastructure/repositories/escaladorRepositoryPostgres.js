import escaladorRepository from '../../domain/escaladores/escaladorRepository.js';
import Escalador from '../../domain/escaladores/Escalador.js';
import bcrypt from 'bcrypt';

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
    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(escalador.contrasena, saltRounds);
    
    const data = {
      correo: escalador.correo,
      contrasena: hashedPassword,
      apodo: escalador.apodo,
    };
    const escaladorModel = await this.EscaladorModel.create(data);

    return this._toDomain(escaladorModel);
  }
}

export default EscaladorRepositoryPostgres;
