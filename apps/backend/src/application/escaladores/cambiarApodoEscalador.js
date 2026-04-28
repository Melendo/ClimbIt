import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class CambiarApodoEscalador {
  constructor(escaladorRepository, tokenService) {
    this.escaladorRepository = escaladorRepository;
    this.tokenService = tokenService;
  }

  async execute({ apodoActual, nuevoApodo, usuario }) {
    try {
      const escalador = await this.escaladorRepository.actualizarApodo(
        apodoActual,
        nuevoApodo
      );

      if (!escalador) {
        throw new NotFoundError(
          'Escalador no encontrado',
          'ESCALADOR_NOT_FOUND'
        );
      }

      usuario.apodo = escalador.apodo; // Actualiza el apodo en el payload del token
      const payload = {
        apodo: usuario.apodo,
        correo: usuario.correo,
        rol: usuario.rol,
        ...(usuario.rol === 'Gestor'
          ? { rocodromosGestionados: usuario.rocodromosGestionados }
          : {}),
      };
      const token = this.tokenService.crear(payload);

      return {
        id: escalador.id,
        correo: escalador.correo,
        apodo: escalador.apodo,
        descripcion: escalador.descripcion,
        idFotoPerfil: escalador.idFotoPerfil,
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al cambiar el apodo del escalador',
        'ESCALADOR_APODO_UPDATE_FAILED',
        error
      );
    }
  }
}

export default CambiarApodoEscalador;
