class ObtenerFotoPerfil {
  constructor(fotosPerfilRepository) {
    this.fotosPerfilRepository = fotosPerfilRepository;
  }

  async execute(id) {
    try {
      const fotoPerfil = await this.fotosPerfilRepository.encontrarPorId(id);
      if (!fotoPerfil) {
        return null;
      }

      return fotoPerfil;
    } catch (error) {
      throw new Error(`Error al obtener la foto de perfil: ${error.message}`);
    }
  }
}

export default ObtenerFotoPerfil;
