class ObtenerZonaPorId {
  constructor(zonaRepository) {
    this.zonaRepository = zonaRepository;
  }

  async execute(idZona) {
    const zona = await this.zonaRepository.encontrarPorId(idZona);
    return zona;
  }
}

export default ObtenerZonaPorId;
