class ActualizarFotoPerfilEscalador {
  constructor(escaladorRepository, fotosPerfilRepository) {
    this.escaladorRepository = escaladorRepository;
    this.fotosPerfilRepository = fotosPerfilRepository;
  }

  async execute({ apodo, idFotoPerfil, urlFoto }) {
    try {
      const fotoPerfil = await this.fotosPerfilRepository.encontrarPorId(
        idFotoPerfil
      );

      if (!fotoPerfil) {
        throw new Error('Foto de perfil no encontrada');
      }

      if (!fotoPerfil.activo) {
        throw new Error('La foto de perfil no está activa');
      }

      if (urlFoto && fotoPerfil.urlFoto !== urlFoto) {
        throw new Error('La URL de la foto no coincide con la foto seleccionada');
      }

      const escalador = await this.escaladorRepository.actualizarFotoUrl(
        apodo,
        fotoPerfil.urlFoto
      );

      if (!escalador) {
        throw new Error('Escalador no encontrado');
      }

      return { fotoUrl: escalador.fotoUrl };
    } catch (error) {
      throw new Error(
        `Error al actualizar la foto de perfil del escalador: ${error.message}`
      );
    }
  }
}

export default ActualizarFotoPerfilEscalador;
