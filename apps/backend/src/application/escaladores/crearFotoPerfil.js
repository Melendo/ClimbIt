import FotosPerfil from '../../domain/fotosPerfil/FotosPerfil.js';

class CrearFotoPerfil {
  constructor(fotosPerfilRepository) {
    this.fotosPerfilRepository = fotosPerfilRepository;
  }

  async execute({ urlFoto }) {
    try {
      const fotoPerfil = new FotosPerfil(null, urlFoto, true);
      return await this.fotosPerfilRepository.crear(fotoPerfil);
    } catch (error) {
      throw new Error(`Error al crear la foto de perfil: ${error.message}`);
    }
  }
}

export default CrearFotoPerfil;
