import Escalador from '../../domain/escaladores/Escalador.js';
import {
  AppError,
  ConflictError,
  InternalServerError,
  ValidationError,
} from '../../domain/sharedObjects/AppError.js';

class CrearEscalador {
  constructor(escaladorRepository, passwordService, tokenService) {
    this.escaladorRepository = escaladorRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute(data) {
    try {
      const [correoExistente, apodoExistente] = await Promise.all([
        this.escaladorRepository.encontrarPorCorreoInsensitive(data.correo),
        this.escaladorRepository.encontrarPorApodoInsensitive(data.apodo),
      ]);

      if (correoExistente || apodoExistente) {
        throw new ConflictError(
          'El correo o apodo ya está registrado',
          'ESCALADOR_DUPLICADO'
        );
      }

      const hashedPassword = await this.passwordService.hash(data.contrasena);
      const nuevoEscalador = new Escalador(
        null,
        data.correo,
        hashedPassword,
        data.apodo
      );

      const escaladorCreado =
        await this.escaladorRepository.crear(nuevoEscalador);

      const token = this.tokenService.crear({
        correo: escaladorCreado.correo,
        apodo: escaladorCreado.apodo,
        rol: 'Escalador',
      });

      return { token };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const originalMessage = (error?.message || '').toLowerCase();

      if (
        error?.name === 'SequelizeUniqueConstraintError' ||
        originalMessage.includes('duplicate') ||
        originalMessage.includes('unique')
      ) {
        throw new ConflictError(
          'El correo o apodo ya está registrado',
          'ESCALADOR_DUPLICADO',
          error
        );
      }

      if (
        originalMessage.includes('inválido') ||
        originalMessage.includes('invalido')
      ) {
        throw new ValidationError(error.message, 'ESCALADOR_INVALIDO', error);
      }

      throw new InternalServerError(
        'Error al crear el escalador',
        'ESCALADOR_CREATE_FAILED',
        error
      );
    }
  }
}

export default CrearEscalador;
