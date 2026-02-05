class ObtenerRocodromosSuscritos {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(apodo) {
    const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);
    if (!escalador) {
      throw new Error('Escalador no encontrado');
    }
    const rocodromosSuscritos =
      await this.escaladorRepository.obtenerRocodromosSuscritos(escalador.id);
    return rocodromosSuscritos;
  }
}

export default ObtenerRocodromosSuscritos;
