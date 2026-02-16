class ObtenerPistasZona {
  constructor(zonaRepository, escaladorRepository) {
    this.zonaRepository = zonaRepository;
    this.escaladorRepository = escaladorRepository;
  }

  async execute(id, escaladorApodo) {
    try {
      let idEscalador = null;

      if (escaladorApodo) {
        const escalador = await this.escaladorRepository.encontrarPorApodo(escaladorApodo);
        if (escalador) {
          idEscalador = escalador.id;
        }
      }

      return await this.zonaRepository.obtenerPistasDeZona(id, idEscalador);
    } catch (error) {
      throw new Error(`Error al obtener la zona por ID: ${error.message}`);
    }
  }
}

export default ObtenerPistasZona;
