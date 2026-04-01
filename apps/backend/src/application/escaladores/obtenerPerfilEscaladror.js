import { AppError, NotFoundError, InternalServerError } from '../../domain/sharedObjects/AppError.js';

class ObtenerPerfilEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(apodo) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);
      if (!escalador) {
        throw new NotFoundError('Escalador no encontrado', 'ESCALADOR_NOT_FOUND');
      }
      const perfil = {
        id: escalador.id,
        correo: escalador.correo,
        apodo: escalador.apodo,
        descripcion: escalador.descripcion,
        idFotoPerfil: escalador.idFotoPerfil,
      };
      return perfil;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new InternalServerError(
        'Error al obtener perfil del escalador',
        'ESCALADOR_PROFILE_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerPerfilEscalador;
