import { jest } from '@jest/globals';
import CambiarApodoEscalador from '../../../../src/application/escaladores/cambiarApodoEscalador.js';
import { InternalServerError, NotFoundError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('cambiarApodoEscaladorUseCase', () => {
  it('deberia devolver perfil actualizado y token', async () => {
    const mockRepository = {
      actualizarApodo: jest.fn().mockResolvedValue({
        id: 3,
        correo: 'test@correo.com',
        apodo: 'NuevoApodo',
        descripcion: 'Bio',
        idFotoPerfil: 1,
      }),
    };
    const mockTokenService = {
      crear: jest.fn().mockReturnValue('nuevo_token'),
    };

    const useCase = new CambiarApodoEscalador(mockRepository, mockTokenService);
    const resultado = await useCase.execute({
      apodoActual: 'ViejoApodo',
      nuevoApodo: 'NuevoApodo',
      usuario: { correo: 'test@correo.com', apodo: 'ViejoApodo', rol: 'Escalador' },
    });

    expect(mockRepository.actualizarApodo).toHaveBeenCalledWith(
      'ViejoApodo',
      'NuevoApodo'
    );
    expect(mockTokenService.crear).toHaveBeenCalledWith({
      correo: 'test@correo.com',
      apodo: 'NuevoApodo',
      rol: 'Escalador',
    });
    expect(resultado).toEqual({
      id: 3,
      correo: 'test@correo.com',
      apodo: 'NuevoApodo',
      descripcion: 'Bio',
      idFotoPerfil: 1,
      token: 'nuevo_token',
    });
  });

  it('deberia lanzar NotFoundError si no existe el escalador', async () => {
    const mockRepository = {
      actualizarApodo: jest.fn().mockResolvedValue(null),
    };
    const mockTokenService = {
      crear: jest.fn(),
    };
    const useCase = new CambiarApodoEscalador(mockRepository, mockTokenService);

    await expect(
      useCase.execute({
        apodoActual: 'NoExiste',
        nuevoApodo: 'NuevoApodo',
        usuario: { correo: 'test@correo.com', apodo: 'NoExiste' },
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar InternalServerError si falla el repositorio', async () => {
    const mockRepository = {
      actualizarApodo: jest.fn().mockRejectedValue(new Error('db fail')),
    };
    const mockTokenService = {
      crear: jest.fn(),
    };
    const useCase = new CambiarApodoEscalador(mockRepository, mockTokenService);

    await expect(
      useCase.execute({
        apodoActual: 'ViejoApodo',
        nuevoApodo: 'NuevoApodo',
        usuario: { correo: 'test@correo.com', apodo: 'ViejoApodo' },
      })
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
