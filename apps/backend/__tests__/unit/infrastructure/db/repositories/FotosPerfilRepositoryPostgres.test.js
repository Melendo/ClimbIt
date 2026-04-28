import { jest } from '@jest/globals';
import FotosPerfilRepositoryPostgres from '../../../../../src/infrastructure/repositories/fotosPerfilRepositoryPostgres.js';
import FotosPerfil from '../../../../../src/domain/fotosPerfil/FotosPerfil.js';

describe('FotosPerfilRepositoryPostgres', () => {
  let repository;
  let mockModel;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    };

    repository = new FotosPerfilRepositoryPostgres(mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('crea una foto de perfil y la devuelve como entidad de dominio', async () => {
    const fotoPerfil = new FotosPerfil(
      null,
      '/uploads/fotos_perfil/foto-1.png',
      true
    );
    mockModel.create.mockResolvedValue({
      id: 1,
      urlFoto: fotoPerfil.urlFoto,
      activo: true,
    });

    const resultado = await repository.crear(fotoPerfil);

    expect(mockModel.create).toHaveBeenCalledWith({
      urlFoto: '/uploads/fotos_perfil/foto-1.png',
      activo: true,
    });
    expect(resultado).toBeInstanceOf(FotosPerfil);
    expect(resultado.id).toBe(1);
  });

  it('devuelve solo las fotos activas', async () => {
    mockModel.findAll.mockResolvedValue([
      { id: 1, urlFoto: '/uploads/fotos_perfil/a.png', activo: true },
      { id: 2, urlFoto: '/uploads/fotos_perfil/b.png', activo: true },
    ]);

    const resultado = await repository.obtenerActivas();

    expect(mockModel.findAll).toHaveBeenCalledWith({
      where: { activo: true },
      order: [['id', 'ASC']],
    });
    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toBeInstanceOf(FotosPerfil);
  });

  it('encuentra una foto por id', async () => {
    mockModel.findByPk.mockResolvedValue({
      id: 7,
      urlFoto: '/uploads/fotos_perfil/x.png',
      activo: false,
    });

    const resultado = await repository.encontrarPorId(7);

    expect(mockModel.findByPk).toHaveBeenCalledWith(7);
    expect(resultado).toBeInstanceOf(FotosPerfil);
    expect(resultado.id).toBe(7);
    expect(resultado.activo).toBe(false);
  });
});
