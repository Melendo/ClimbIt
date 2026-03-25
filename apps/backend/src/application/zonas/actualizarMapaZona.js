class ActualizarMapaZona {
  constructor(zonaRepository) {
    this.zonaRepository = zonaRepository;
  }

  async execute(idZona, mapaUrl) {
    const zona = await this.zonaRepository.actualizarMapaZona(idZona, mapaUrl);
    return zona;
  }
}

export default ActualizarMapaZona;
