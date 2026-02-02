class AutenticarEscalador {
  constructor(escaladorRepository, passwordService, tokenService) {
    this.escaladorRepository = escaladorRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute(data) {
    try {
      const escaladorExistente =
        await this.escaladorRepository.encontrarPorCorreo(data.correo);
      if (!escaladorExistente) {
        throw new Error('Escalador no encontrado');
      }

      const passwordMatch = await this.passwordService.compare(
        data.contrasena,
        escaladorExistente.contrasena
      );
      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta');
      }
      const token = this.tokenService.crear({ correo: escaladorExistente.correo });
      return { token };
    } catch (error) {
      throw new Error(`Error al autenticar al escalador: ${error.message}`);
    }
  }
}

export default AutenticarEscalador;
