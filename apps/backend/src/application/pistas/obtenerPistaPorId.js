import Pista from '../../domain/pistas/Pista.js';
class ObtenerPistaPorId {
  constructor(pistaRepository) {
    this.pistaRepository = pistaRepository;
  }

  async execute(id) {
    try {
      const result = await this.pistaRepository.obtenerPorId(id);
      const pista = result
        ? new Pista(result.id, result.idZona, result.nombre, result.dificultad)
        : null;
      return pista;
    } catch (error) {
      throw new Error(`Error al obtener la pista por ID: ${error.message}`);
    }
  }
}

export default ObtenerPistaPorId;
