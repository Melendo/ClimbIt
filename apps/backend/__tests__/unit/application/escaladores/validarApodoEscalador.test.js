import { jest } from '@jest/globals';
import ValidarApodoEscalador from '../../../../src/application/escaladores/validarApodoEscalador.js';
import { InternalServerError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('validarApodoEscaladorUseCase', () => {
  it('deberia devolver disponible true cuando no existe el apodo', async () => {
    const mockRepository = {
      encontrarPorApodoInsensitive: jest.fn().mockResolvedValue(null),
    };
    const useCase = new ValidarApodoEscalador(mockRepository);

    const resultado = await useCase.execute('NuevoApodo');

    expect(mockRepository.encontrarPorApodoInsensitive).toHaveBeenCalledWith('nuevoapodo');
    expect(resultado).toEqual({ disponible: true });
  });

  it('deberia devolver disponible false cuando el apodo ya existe', async () => {
    const mockRepository = {
      encontrarPorApodoInsensitive: jest.fn().mockResolvedValue({ id: 1, apodo: 'Test' }),
    };
    const useCase = new ValidarApodoEscalador(mockRepository);

    const resultado = await useCase.execute('Test');

    expect(resultado).toEqual({ disponible: false });
  });

  it('deberia lanzar InternalServerError si falla el repositorio', async () => {
    const mockRepository = {
      encontrarPorApodoInsensitive: jest.fn().mockRejectedValue(new Error('db fail')),
    };
    const useCase = new ValidarApodoEscalador(mockRepository);

    await expect(useCase.execute('Test')).rejects.toBeInstanceOf(InternalServerError);
  });
});
