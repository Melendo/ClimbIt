class ObtenerZonasRocodromo {
  constructor(rocodromoRepository) {
    this.rocodromoRepository = rocodromoRepository;
  }

  async execute(id) {
    try {
      return await this.rocodromoRepository.obtenerZonasDeRocodromo(id);
    } catch (error) {
      throw new Error(`Error al obtener el rocodromo por ID: ${error.message}`);
    }
  }
}

export default ObtenerZonasRocodromo;
