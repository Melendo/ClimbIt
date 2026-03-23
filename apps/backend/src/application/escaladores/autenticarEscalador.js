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
        throw new Error('Escalador no registrado');
      }

      const passwordMatch = await this.passwordService.compare(
        data.contrasena,
        escaladorExistente.contrasena
      );
      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta');
      }
      const esAdmin = Boolean(escaladorExistente.isAdmin);
      let rocodromosGestionados = [];
      let rol = 'Escalador';

      if (esAdmin) {
        rol = 'Admin';
      } else {
        rocodromosGestionados =
          await this.escaladorRepository.obtenerIdsRocodromosGestionados(
            escaladorExistente.id
          );
        rol = rocodromosGestionados.length > 0 ? 'Gestor' : 'Escalador';
      }

      const payload = {
        correo: escaladorExistente.correo,
        apodo: escaladorExistente.apodo,
        rol,
        ...(rol === 'Gestor' ? { rocodromosGestionados } : {}),
      };
      const token = this.tokenService.crear(payload);
      return { token };
    } catch (error) {
      throw new Error(`Error al autenticar al escalador: ${error.message}`);
    }
  }
}

export default AutenticarEscalador;
