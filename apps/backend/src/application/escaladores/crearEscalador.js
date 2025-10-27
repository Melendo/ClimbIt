import Escalador from '../../domain/escaladores/Escalador.js';

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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw new Error(`Error al crear el escalador`);
    }
  }
}

export default CrearEscalador;
