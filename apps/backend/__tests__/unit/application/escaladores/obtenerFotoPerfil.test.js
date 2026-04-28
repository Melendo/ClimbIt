import { jest } from '@jest/globals';
import ObtenerFotoPerfil from '../../../../src/application/escaladores/obtenerFotoPerfil.js';

describe('ObtenerFotoPerfil', () => {
  it('devuelve la foto cuando existe', async () => {
    const fotosPerfilRepository = {
      encontrarPorId: jest.fn().mockResolvedValue({
        id: 9,
        urlFoto: '/uploads/fotos_perfil/foto.png',
        activo: true,
      }),
    };

    const useCase = new ObtenerFotoPerfil(fotosPerfilRepository);

    const resultado = await useCase.execute(9);

    expect(fotosPerfilRepository.encontrarPorId).toHaveBeenCalledWith(9);
    expect(resultado).toEqual({
      id: 9,
      urlFoto: '/uploads/fotos_perfil/foto.png',
      activo: true,
    });
  });

  it('devuelve null si no existe', async () => {
    const fotosPerfilRepository = {
      encontrarPorId: jest.fn().mockResolvedValue(null),
    };

    const useCase = new ObtenerFotoPerfil(fotosPerfilRepository);

    const resultado = await useCase.execute(9);

    expect(resultado).toBeNull();
  });
});
