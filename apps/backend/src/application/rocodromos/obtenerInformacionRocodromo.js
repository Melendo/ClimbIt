class ObtenerInformacionRocodromo {
  constructor(rocodromosRepository) {
    this.rocodromosRepository = rocodromosRepository;
  }

  async execute(idRocodromo) {
    const rocodromo =
      await this.rocodromosRepository.encontrarPorId(idRocodromo);
    return rocodromo;
  }
}

export default ObtenerInformacionRocodromo;
