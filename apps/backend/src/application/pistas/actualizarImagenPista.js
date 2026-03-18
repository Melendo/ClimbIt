class ActualizarImagenPista {
  constructor(pistaRepository) {
    this.pistaRepository = pistaRepository;
  }

  async execute(idPista, imagenUrl) {
    const pistaActualizada = await this.pistaRepository.actualizarImagenUrl(
      idPista,
      imagenUrl
    );

    if (!pistaActualizada) {
      throw new Error(`Pista con ID ${idPista} no encontrada`);
    }

    return pistaActualizada;
  }
}

export default ActualizarImagenPista;
