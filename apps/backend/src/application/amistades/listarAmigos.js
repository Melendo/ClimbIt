import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ListarAmigos {
  constructor(escaladorRepository, amistadRepository) {
    this.escaladorRepository = escaladorRepository;
    this.amistadRepository = amistadRepository;
  }

  async execute({ apodoEscalador }) {
    try {
      const escalador =
        await this.escaladorRepository.encontrarPorApodo(apodoEscalador);
      if (!escalador) {
        throw new NotFoundError(
          `Escalador ${apodoEscalador} no encontrado`,
          'ESCALADOR_NOT_FOUND'
        );
      }

      const idsAmigos = await this.amistadRepository.listarIdsAmigosDeEscalador(
        escalador.id
      );
      if (!idsAmigos.length) {
        return [];
      }

      const amigos = await this.escaladorRepository.encontrarPorIds(idsAmigos);

      return amigos.map((amigo) => ({
        id: amigo.id,
        apodo: amigo.apodo,
        descripcion: amigo.descripcion,
        idFotoPerfil: amigo.idFotoPerfil,
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al listar amigos',
        'AMISTAD_LISTAR_AMIGOS_FAILED',
        error
      );
    }
  }
}

export default ListarAmigos;
