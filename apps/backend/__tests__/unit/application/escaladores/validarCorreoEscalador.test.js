import { jest } from '@jest/globals';
import ValidarCorreoEscalador from '../../../../src/application/escaladores/validarCorreoEscalador.js';
import { InternalServerError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('validarCorreoEscaladorUseCase', () => {
  it('deberia devolver disponible true cuando no existe el correo', async () => {
    const mockRepository = {
      encontrarPorCorreo: jest.fn().mockResolvedValue(null),
    };
    const useCase = new ValidarCorreoEscalador(mockRepository);

    const resultado = await useCase.execute('nuevo@correo.com');

    expect(mockRepository.encontrarPorCorreo).toHaveBeenCalledWith(
      'nuevo@correo.com'
    );
    expect(resultado).toEqual({ disponible: true });
  });

  it('deberia devolver disponible false cuando el correo ya existe', async () => {
    const mockRepository = {
      encontrarPorCorreo: jest
        .fn()
        .mockResolvedValue({ id: 1, correo: 'test@correo.com' }),
    };
    const useCase = new ValidarCorreoEscalador(mockRepository);

    const resultado = await useCase.execute('test@correo.com');

    expect(resultado).toEqual({ disponible: false });
  });

  it('deberia lanzar InternalServerError si falla el repositorio', async () => {
    const mockRepository = {
      encontrarPorCorreo: jest.fn().mockRejectedValue(new Error('db fail')),
    };
    const useCase = new ValidarCorreoEscalador(mockRepository);

    await expect(useCase.execute('test@correo.com')).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});
