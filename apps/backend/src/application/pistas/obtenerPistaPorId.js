import Pista from '../../domain/pistas/Pista.js';
class ObtenerPistaPorId {
  constructor(pistaRepository, escaladorRepository) {
    this.pistaRepository = pistaRepository;
    this.escaladorRepository = escaladorRepository;
  }

  async execute(id, escaladorApodo) {
    try {
      const result = await this.pistaRepository.obtenerPorId(id);
      const pista = result
        ? new Pista(result.id, result.idZona, result.nombre, result.dificultad)
        : null;

      if (!pista) return null;

      // Obtener el estado del escalador en esta pista
      let estado = null;
      if (escaladorApodo) {
        const escalador = await this.escaladorRepository.encontrarPorApodo(escaladorApodo);
        if (escalador) {
          estado = await this.pistaRepository.obtenerEstado(pista.id, escalador.id);
        }
      }

      return { ...pista, estado };
    } catch (error) {
      throw new Error(`Error al obtener la pista por ID: ${error.message}`);
    }
  }
}

export default ObtenerPistaPorId;
