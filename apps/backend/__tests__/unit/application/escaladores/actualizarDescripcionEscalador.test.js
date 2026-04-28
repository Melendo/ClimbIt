import { jest } from '@jest/globals';
import ActualizarDescripcionEscalador from '../../../../src/application/escaladores/actualizarDescripcionEscalador.js';
import {
  InternalServerError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('actualizarDescripcionEscaladorUseCase', () => {
  it('deberia devolver el perfil actualizado', async () => {
    const mockRepository = {
      actualizarDescripcion: jest.fn().mockResolvedValue({
        id: 7,
        correo: 'test@correo.com',
        apodo: 'Tester',
        descripcion: 'Nueva descripcion',
        idFotoPerfil: 2,
      }),
    };

    const useCase = new ActualizarDescripcionEscalador(mockRepository);
    const resultado = await useCase.execute({
      apodo: 'Tester',
      descripcion: 'Nueva descripcion',
    });

    expect(mockRepository.actualizarDescripcion).toHaveBeenCalledWith(
      'Tester',
      'Nueva descripcion'
    );
    expect(resultado).toEqual({
      id: 7,
      correo: 'test@correo.com',
      apodo: 'Tester',
      descripcion: 'Nueva descripcion',
      idFotoPerfil: 2,
    });
  });

  it('deberia lanzar NotFoundError si no existe el escalador', async () => {
    const mockRepository = {
      actualizarDescripcion: jest.fn().mockResolvedValue(null),
    };
    const useCase = new ActualizarDescripcionEscalador(mockRepository);

    await expect(
      useCase.execute({ apodo: 'NoExiste', descripcion: 'Texto' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar InternalServerError si falla el repositorio', async () => {
    const mockRepository = {
      actualizarDescripcion: jest.fn().mockRejectedValue(new Error('db fail')),
    };
    const useCase = new ActualizarDescripcionEscalador(mockRepository);

    await expect(
      useCase.execute({ apodo: 'Tester', descripcion: 'Texto' })
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
