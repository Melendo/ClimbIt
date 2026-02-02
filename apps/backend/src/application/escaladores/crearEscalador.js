import Escalador from '../../domain/escaladores/Escalador.js';

class CrearEscalador {
  constructor(escaladorRepository, passwordService) {
    this.escaladorRepository = escaladorRepository;
    this.passwordService = passwordService;
  }

  async execute(data) {
    try {
      const hashedPassword = await this.passwordService.hash(data.contrasena);
      const nuevoEscalador = new Escalador(
        null,
        data.correo,
        hashedPassword,
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
