import Escalador from '../../domain/escaladores/Escalador.js';

class CrearEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(data) {
    try {
      const nuevoEscalador = new Escalador(
        null,
        data.correo,
        data.contrasena,
        data.apodo
      );

      const escaladorCreado =
        await this.escaladorRepository.crear(nuevoEscalador);

      return escaladorCreado;
       
    } catch (error) {
      throw new Error(`Error al crear el escalador: ${error.message}`);
    }
  }
}

export default CrearEscalador;
