class CambiarEstadoPista {
  constructor(pistaRepository, escaladorRepository) {
    this.pistaRepository = pistaRepository;
    this.escaladorRepository = escaladorRepository;
  }
  async execute({ idPista, nuevoEstado, escaladorApodo }) {
    try {
      const pista = await this.pistaRepository.obtenerPorId(idPista);
      if (!pista) {
        throw new Error(`Pista con ID ${idPista} no encontrada`);
      }

      const escalador =
        await this.escaladorRepository.encontrarPorApodo(escaladorApodo);
      if (!escalador) {
        throw new Error(`Escalador con apodo ${escaladorApodo} no encontrado`);
      }

      if (nuevoEstado !== 'S/N') {
        await this.pistaRepository.cambiarEstado(
          idPista,
          escalador.id,
          nuevoEstado
        );
      }else{
        await this.pistaRepository.eliminarEstadoPista(idPista, escalador.id);
      }
      return {
        mensaje: `Estado de la pista con ID ${idPista} cambiado a ${nuevoEstado} exitosamente.`,
      };
    } catch (error) {
      throw new Error(
        `Error al cambiar el estado de la pista: ${error.message}`
      );
    }
  }
}

export default CambiarEstadoPista;
