class ObtenerFotosPerfil {
	constructor(fotosPerfilRepository) {
		this.fotosPerfilRepository = fotosPerfilRepository;
	}

	async execute() {
		try {
			const fotosPerfil = await this.fotosPerfilRepository.obtenerActivas();

			return fotosPerfil.map((fotoPerfil) => ({
				id: fotoPerfil.id,
				nombre: fotoPerfil.urlFoto.split('/').pop(),
				urlFoto: fotoPerfil.urlFoto,
			}));
		} catch (error) {
			throw new Error(`Error al obtener fotos de perfil: ${error.message}`);
		}
	}
}

export default ObtenerFotosPerfil;
