class ObtenerPerfilEscalador {
  constructor(escaladorRepository) {
    this.escaladorRepository = escaladorRepository;
  }

  async execute(apodo) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);
      if (!escalador) {
        throw new Error('Escalador no encontrado');
      }
      const perfil = {
        id: escalador.id,
        correo: escalador.correo,
        apodo: escalador.apodo,
      };
      return perfil;
    } catch (error) {
      throw new Error(
        `Error al obtener perfil del escalador: ${error.message}`
      );
    }
  }
}

export default ObtenerPerfilEscalador;
