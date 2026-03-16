class ActualizarLogoRocodromo {
  constructor(rocodromosRepository) {
    this.rocodromosRepository = rocodromosRepository;
  }

  async execute(idRocodromo, logoUrl) {
    const rocodromo =
      await this.rocodromosRepository.actualizarLogoRocodromo(idRocodromo, logoUrl);
    return rocodromo;
  }
}

export default ActualizarLogoRocodromo;
