import { ValidationError } from '../../domain/sharedObjects/AppError.js';

class BuscarEscaladoresPorNombre {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(cadena, excludeApodo) {
    if (!cadena || cadena.trim().length < 2) {
      throw new ValidationError('La cadena de búsqueda debe tener al menos 2 caracteres', 'ESCALADOR_INVALID_SEARCH');
    }

    const escaladores = await this.escaladorRepository.buscarPorApodoSimilitud(cadena.trim(), 10, excludeApodo);

    return escaladores.map((escalador) => ({
      id: escalador.id,
      apodo: escalador.apodo,
      idFotoPerfil: escalador.idFotoPerfil,
    }));
  }
}

export default BuscarEscaladoresPorNombre;
