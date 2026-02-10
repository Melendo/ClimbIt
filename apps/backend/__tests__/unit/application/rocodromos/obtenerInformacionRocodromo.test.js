import { describe, it, expect, jest } from '@jest/globals';
import ObtenerInformacionRocodromo from '../../../../src/application/rocodromos/obtenerInformacionRocodromo.js';

describe('ObtenerInformacionRocodromo', () => {
  it('debería obtener la información del rocodromo correctamente', async () => {
    // Arrange
    const rocodromoId = 1;
    const infoRocodromo = {
      id: 1,
      nombre: 'Rocodromo Test',
      ubicacion: 'Madrid',
      tipo: 'Artificial',
    };

    const mockRepository = {
      encontrarPorId: jest.fn(async () => infoRocodromo),
    };

    const obtenerInfo = new ObtenerInformacionRocodromo(mockRepository);

    // Act
    const resultado = await obtenerInfo.execute(rocodromoId);

    // Assert
    expect(mockRepository.encontrarPorId).toHaveBeenCalledWith(rocodromoId);
    expect(resultado).toEqual(infoRocodromo);
  });

  it('debería retornar null si el rocodromo no existe', async () => {
    // Arrange
    const rocodromoId = 999;
    const mockRepository = {
      encontrarPorId: jest.fn(async () => null),
    };

    const obtenerInfo = new ObtenerInformacionRocodromo(mockRepository);

    // Act
    const resultado = await obtenerInfo.execute(rocodromoId);

    // Assert
    expect(mockRepository.encontrarPorId).toHaveBeenCalledWith(rocodromoId);
    expect(resultado).toBeNull();
  });

  it('debería lanzar un error si el repositorio falla', async () => {
    // Arrange
    const rocodromoId = 1;
    const errorMsg = 'Error en BD';
    const mockRepository = {
      encontrarPorId: jest.fn(async () => {
        throw new Error(errorMsg);
      }),
    };

    const obtenerInfo = new ObtenerInformacionRocodromo(mockRepository);

    // Act & Assert
    await expect(obtenerInfo.execute(rocodromoId)).rejects.toThrow(errorMsg);
  });
});
