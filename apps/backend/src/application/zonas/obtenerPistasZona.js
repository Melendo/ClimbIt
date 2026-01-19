class ObtenerPistasZona {
  constructor(zonaRepository) {
    this.zonaRepository = zonaRepository;
  }

  async execute(id) {
    try {
      return await this.zonaRepository.obtenerPistasDeZona(id);
    } catch (error) {
      throw new Error(`Error al obtener la zona por ID: ${error.message}`);
    }
  }
}

export default ObtenerPistasZona;
