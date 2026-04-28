import {
  AppError,
  AuthenticationError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class AutenticarEscalador {
  constructor(escaladorRepository, passwordService, tokenService) {
    this.escaladorRepository = escaladorRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute(data) {
    try {
      const escaladorExistente =
        await this.escaladorRepository.encontrarPorCorreoInsensitive(
          data.correo
        );
      if (!escaladorExistente) {
        throw new NotFoundError(
          'Escalador no registrado',
          'ESCALADOR_NOT_FOUND'
        );
      }

      const passwordMatch = await this.passwordService.compare(
        data.contrasena,
        escaladorExistente.contrasena
      );
      if (!passwordMatch) {
        throw new AuthenticationError(
          'Contraseña incorrecta',
          'INVALID_CREDENTIALS'
        );
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
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al autenticar al escalador',
        'ESCALADOR_AUTH_FAILED',
        error
      );
    }
  }
}

export default AutenticarEscalador;
