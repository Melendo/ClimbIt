import Escalador from '../../domain/escaladores/Escalador.js';

class CrearEscalador {
  constructor(escaladorRepository, passwordService, tokenService) {
    this.escaladorRepository = escaladorRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
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

      const token = this.tokenService.crear({ correo: escaladorCreado.correo, apodo: escaladorCreado.apodo });

      return token;
    } catch (error) {
      throw new Error(`Error al crear el escalador: ${error.message}`);
    }
  }
}

export default CrearEscalador;
