// const Escalador = require('../../domain/escaladores/Escalador');

class CrearEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(data) {
    const nuevoEscalador = data;
    console.log('Ejecutando CrearEscalador con:', nuevoEscalador, '-usecase');
    const escaladorCreado =
      await this.escaladorRepository.crear(nuevoEscalador);

    return escaladorCreado;
  }
}

module.exports = CrearEscalador;
