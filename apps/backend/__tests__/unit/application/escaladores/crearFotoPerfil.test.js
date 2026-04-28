import { jest } from '@jest/globals';
import CrearFotoPerfil from '../../../../src/application/escaladores/crearFotoPerfil.js';

describe('CrearFotoPerfil', () => {
  it('crea una foto de perfil en el repositorio', async () => {
    const fotosPerfilRepository = {
      crear: jest.fn().mockResolvedValue({
        id: 1,
        urlFoto: '/uploads/fotos_perfil/foto.png',
        activo: true,
      }),
    };

    const useCase = new CrearFotoPerfil(fotosPerfilRepository);

    const resultado = await useCase.execute({
      urlFoto: '/uploads/fotos_perfil/foto.png',
    });

    expect(fotosPerfilRepository.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        urlFoto: '/uploads/fotos_perfil/foto.png',
        activo: true,
      })
    );
    expect(resultado).toEqual({
      id: 1,
      urlFoto: '/uploads/fotos_perfil/foto.png',
      activo: true,
    });
  });
});
