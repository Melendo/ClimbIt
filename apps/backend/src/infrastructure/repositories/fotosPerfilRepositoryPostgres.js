import FotosPerfilRepository from '../../domain/fotosPerfil/fotosPerfilRepository.js';
import FotosPerfil from '../../domain/fotosPerfil/FotosPerfil.js';

class FotosPerfilRepositoryPostgres extends FotosPerfilRepository {
  constructor(fotosPerfilModel) {
    super();
    this.FotosPerfilModel = fotosPerfilModel;
  }

  _toDomain(fotoPerfilModel) {
    if (!fotoPerfilModel) return null;

    try {
      return new FotosPerfil(
        fotoPerfilModel.id,
        fotoPerfilModel.urlFoto,
        fotoPerfilModel.activo
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async crear(fotoPerfil) {
    const data = {
      urlFoto: fotoPerfil.urlFoto,
      activo: fotoPerfil.activo,
    };

    const fotoPerfilModel = await this.FotosPerfilModel.create(data);
    return this._toDomain(fotoPerfilModel);
  }

  async encontrarPorId(id) {
    const fotoPerfilModel = await this.FotosPerfilModel.findByPk(id);
    return this._toDomain(fotoPerfilModel);
  }

  async obtenerActivas() {
    const fotosPerfilModel = await this.FotosPerfilModel.findAll({
      where: { activo: true },
      order: [['id', 'ASC']],
    });

    return fotosPerfilModel.map((fotoPerfil) => this._toDomain(fotoPerfil));
  }
}

export default FotosPerfilRepositoryPostgres;
