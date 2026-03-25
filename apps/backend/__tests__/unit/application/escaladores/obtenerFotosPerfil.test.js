import { jest } from '@jest/globals';
import ObtenerFotosPerfil from '../../../../src/application/escaladores/obtenerFotosPerfil.js';

describe('ObtenerFotosPerfil', () => {
  it('devuelve el listado de fotos activas con nombre de archivo', async () => {
    const fotosPerfilRepository = {
      obtenerActivas: jest.fn().mockResolvedValue([
        { id: 1, urlFoto: '/uploads/fotos_perfil/foto-1.png' },
        { id: 2, urlFoto: '/uploads/fotos_perfil/foto-2.jpg' },
      ]),
    };

    const useCase = new ObtenerFotosPerfil(fotosPerfilRepository);

    const resultado = await useCase.execute();

    expect(fotosPerfilRepository.obtenerActivas).toHaveBeenCalled();
    expect(resultado).toEqual([
      { id: 1, nombre: 'foto-1.png', urlFoto: '/uploads/fotos_perfil/foto-1.png' },
      { id: 2, nombre: 'foto-2.jpg', urlFoto: '/uploads/fotos_perfil/foto-2.jpg' },
    ]);
  });
});