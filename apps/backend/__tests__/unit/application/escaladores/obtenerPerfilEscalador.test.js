import { describe, it, expect, jest } from '@jest/globals';
import ObtenerPerfilEscalador from '../../../../src/application/escaladores/obtenerPerfilEscaladror.js';

describe('ObtenerPerfilEscalador', () => {
  it('debería obtener el perfil del escalador correctamente', async () => {
    // Arrange
    const apodo = 'TestClimber';
    const escaladorEncontrado = {
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    };

    const mockRepository = {
      encontrarPorApodo: jest.fn(async () => escaladorEncontrado),
    };

    const obtenerPerfil = new ObtenerPerfilEscalador(mockRepository);

    // Act
    const resultado = await obtenerPerfil.execute(apodo);

    // Assert
    expect(mockRepository.encontrarPorApodo).toHaveBeenCalledWith(apodo);
    expect(resultado).toEqual({
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    });
  });

  it('debería lanzar un error si el escalador no existe', async () => {
    // Arrange
    const apodo = 'NoExistente';
    const mockRepository = {
      encontrarPorApodo: jest.fn(async () => null),
    };

    const obtenerPerfil = new ObtenerPerfilEscalador(mockRepository);

    // Act & Assert
    await expect(obtenerPerfil.execute(apodo)).rejects.toThrow(
      'Error al obtener perfil del escalador: Escalador no encontrado'
    );
  });

  it('debería lanzar un error si el repositorio falla', async () => {
    // Arrange
    const apodo = 'TestClimber';
    const errorMsg = 'Error en BD';
    const mockRepository = {
      encontrarPorApodo: jest.fn(async () => {
        throw new Error(errorMsg);
      }),
    };

    const obtenerPerfil = new ObtenerPerfilEscalador(mockRepository);

    // Act & Assert
    await expect(obtenerPerfil.execute(apodo)).rejects.toThrow(
      `Error al obtener perfil del escalador: ${errorMsg}`
    );
  });
});
