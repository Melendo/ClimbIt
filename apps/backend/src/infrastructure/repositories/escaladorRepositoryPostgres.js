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

  async suscribirse(escaladorApodo, rocodromo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo: escaladorApodo },
      });

      if (!escaladorModel) {
        throw new Error(`Escalador con apodo ${escaladorApodo} no encontrado`);
      }

      await escaladorModel.addRocodromo(rocodromo.id);

    } catch (error) {
      throw new Error(`Error al suscribirse al rocódromo: ${error.message}`);
    }
  }

  async desuscribirse(escaladorApodo, idRocodromo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo: escaladorApodo },
      });

      if (!escaladorModel) {
        throw new Error(`Escalador con apodo ${escaladorApodo} no encontrado`);
      }

      await escaladorModel.removeRocodromo(idRocodromo);

    } catch (error) {
      throw new Error(`Error al desuscribirse del rocódromo: ${error.message}`);
    }
  }

  async estaSuscrito(escaladorApodo, idRocodromo) {
    try {
      const escaladorModel = await this.EscaladorModel.findOne({
        where: { apodo: escaladorApodo },
      });

      if (!escaladorModel) {
        throw new Error(`Escalador con apodo ${escaladorApodo} no encontrado`);
      }

      const rocodromos = await escaladorModel.getRocodromos({
        where: { id: idRocodromo },
      });

      return rocodromos.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar suscripción: ${error.message}`);
    }
  }
}

export default EscaladorRepositoryPostgres;