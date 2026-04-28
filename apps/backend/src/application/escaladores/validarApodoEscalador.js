import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ValidarApodoEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(apodo) {
    try {
      const apodoNormalizado = apodo.toLowerCase();
      const escalador =
        await this.escaladorRepository.encontrarPorApodoInsensitive(
          apodoNormalizado
        );

      return { disponible: !escalador };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al validar apodo del escalador',
        'ESCALADOR_APODO_VALIDATE_FAILED',
        error
      );
    }
  }
}

export default ValidarApodoEscalador;
