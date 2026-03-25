import { jest } from '@jest/globals';
import ActualizarFotoPerfilEscalador from '../../../../src/application/escaladores/actualizarFotoPerfilEscalador.js';

describe('ActualizarFotoPerfilEscalador', () => {
  it('actualiza la foto del escalador si la foto existe y está activa', async () => {
    const escaladorRepository = {
      actualizarFotoUrl: jest.fn().mockResolvedValue({ fotoUrl: '/uploads/fotos_perfil/foto-1.png' }),
    };
    const fotosPerfilRepository = {
      encontrarPorId: jest.fn().mockResolvedValue({
        id: 1,
        urlFoto: '/uploads/fotos_perfil/foto-1.png',
        activo: true,
      }),
    };

    const useCase = new ActualizarFotoPerfilEscalador(
      escaladorRepository,
      fotosPerfilRepository
    );

    const resultado = await useCase.execute({
      apodo: 'tester',
      idFotoPerfil: 1,
    });

    expect(fotosPerfilRepository.encontrarPorId).toHaveBeenCalledWith(1);
    expect(escaladorRepository.actualizarFotoUrl).toHaveBeenCalledWith(
      'tester',
      '/uploads/fotos_perfil/foto-1.png'
    );
    expect(resultado).toEqual({ fotoUrl: '/uploads/fotos_perfil/foto-1.png' });
  });

  it('rechaza una foto inactiva', async () => {
    const escaladorRepository = {
      actualizarFotoUrl: jest.fn(),
    };
    const fotosPerfilRepository = {
      encontrarPorId: jest.fn().mockResolvedValue({
        id: 1,
        urlFoto: '/uploads/fotos_perfil/foto-1.png',
        activo: false,
      }),
    };

    const useCase = new ActualizarFotoPerfilEscalador(
      escaladorRepository,
      fotosPerfilRepository
    );

    await expect(
      useCase.execute({
        apodo: 'tester',
        idFotoPerfil: 1,
      })
    ).rejects.toThrow('La foto de perfil no está activa');
  });
});
