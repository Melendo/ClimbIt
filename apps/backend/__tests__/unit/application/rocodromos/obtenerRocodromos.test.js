import { describe, it, expect, jest } from '@jest/globals';
import ObtenerRocodromos from '../../../../src/application/rocodromos/obtenerRocodromos.js';

describe('ObtenerRocodromos', () => {
  it('debería obtener todos los rocódromos correctamente', async () => {
    // Arrange
    const mockRocodromos = [
        { id: 1, nombre: 'Roco 1', ubicacion: 'Loc 1' },
      { id: 2, nombre: 'Roco 2', ubicacion: 'Loc 2' },
    ];
    
    const mockRepository = {
      obtenerRocodromos: jest.fn(async () => mockRocodromos),
    };

    const obtenerRocodromos = new ObtenerRocodromos(mockRepository);

    // Act
    const resultado = await obtenerRocodromos.execute();

    // Assert
    expect(mockRepository.obtenerRocodromos).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual(mockRocodromos);
  });

  it('debería lanzar un error si el repositorio falla', async () => {
    // Arrange
    const errorMsg = 'Error en BD';
    const mockRepository = {
      obtenerRocodromos: jest.fn(async () => {
        throw new Error(errorMsg);
      }),
    };

    const obtenerRocodromos = new ObtenerRocodromos(mockRepository);

    // Act & Assert
    await expect(obtenerRocodromos.execute()).rejects.toThrow(
      `Error al obtener los rocodromos: ${errorMsg}`
    );
  });
});
