import { AppError, InternalServerError } from '../../domain/sharedObjects/AppError.js';

class ValidarCorreoEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(correo) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorCorreo(correo);

      return { disponible: !escalador };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al validar correo del escalador',
        'ESCALADOR_CORREO_VALIDATE_FAILED',
        error
      );
    }
  }
}

export default ValidarCorreoEscalador;
