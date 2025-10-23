const Escalador = require('../../domain/escaladores/Escalador');

class CrearEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(data) {
    try {
      const nuevoEscalador = new Escalador(
        null,
        data.nombre,
        data.edad,
        data.experiencia
      );

      const escaladorCreado =
        await this.escaladorRepository.crear(nuevoEscalador);

      return escaladorCreado;
    } catch (error) {
      throw new Error(`Error al crear el escalador: ${error.message}`);
    }
  }
}

module.exports = CrearEscalador;
