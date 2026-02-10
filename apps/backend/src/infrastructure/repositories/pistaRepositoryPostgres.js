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
    try {
      return new Pista(
        pistaModel.id,
        pistaModel.idZona,
        pistaModel.nombre,
        pistaModel.dificultad
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async crear(pista) {
    const data = {
      idZona: pista.idZona,
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

  async cambiarEstado(idPista, idEscalador, nuevoEstado) {
    const pistaModel = await this.PistaModel.findByPk(idPista, {
      include: [
        {
          association: 'escaladores',
          where: { id: idEscalador },
          required: false,
        },
      ],
    });

    if (!pistaModel) {
      throw new Error(`Pista con ID ${idPista} no encontrada`);
    }

    // Verificar si ya existe la relación
    if (pistaModel.escaladores && pistaModel.escaladores.length > 0) {
      // Si existe, actualizar el estado
      const escaladorData = pistaModel.escaladores[0];
      await escaladorData.EscalaPista.update({ estado: nuevoEstado });
    } else {
      // Si no existe, crear la relación
      await pistaModel.addEscaladores(idEscalador, {
        through: { estado: nuevoEstado },
      });
    }
  }

  async eliminarEstadoPista(idPista, idEscalador) {
    const pistaModel = await this.PistaModel.findByPk(idPista);
    if (!pistaModel) {
      throw new Error(`Pista con ID ${idPista} no encontrada`);
    }

    await pistaModel.removeEscaladores(idEscalador);
  }

  async obtenerEstado(idPista, idEscalador) {
    const pistaModel = await this.PistaModel.findByPk(idPista, {
      include: [
        {
          association: 'escaladores',
          where: { id: idEscalador },
          required: false,
        },
      ],
    });

    if (!pistaModel) return null;

    const escaladores = pistaModel.escaladores;
    if (escaladores && escaladores.length > 0) {
      return escaladores[0].EscalaPista.estado;
    }

    return null;
  }
}

export default PistaRepositoryPostgres;
