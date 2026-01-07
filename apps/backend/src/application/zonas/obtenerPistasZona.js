class ObtenerPistasZona {
  constructor(zonaRepository) {
    this.zonaRepository = zonaRepository;
  }

  async execute(id) {
    try {
      const result = await this.zonaRepository.obtenerPistasDeZona(id);
      const pistas = result ? result : null;
      return pistas;
    } catch (error) {
      throw new Error(`Error al obtener la zona por ID: ${error.message}`);
    }
  }
}

export default ObtenerPistasZona;
