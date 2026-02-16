import { describe, it, expect, jest } from '@jest/globals';
import ObtenerZonasRocodromo from '../../../../src/application/rocodromos/obtenerZonasRocodromo.js';

describe('ObtenerZonasRocodromo', () => {
  it('debería obtener las zonas de un rocódromo por su ID correctamente', async () => {
    // Arrange
    const mockZonas = [
      { id: 1, idRoco: 1, tipo: 'Boulder' },
      { id: 2, idRoco: 1, tipo: 'Cuerda' },
    ];
    
    const mockRepository = {
      obtenerZonasDeRocodromo: jest.fn(async (id) => mockZonas),
    };

    const obtenerZonasRocodromo = new ObtenerZonasRocodromo(mockRepository);
    const rocodromoId = 1;

    // Act
    const resultado = await obtenerZonasRocodromo.execute(rocodromoId);

    // Assert
    expect(mockRepository.obtenerZonasDeRocodromo).toHaveBeenCalledWith(rocodromoId);
    expect(resultado).toEqual(mockZonas);
  });

  it('debería retornar null si el rocódromo no existe', async () => {
    // Arrange
    const mockRepository = {
      obtenerZonasDeRocodromo: jest.fn(async (id) => null),
    };

    const obtenerZonasRocodromo = new ObtenerZonasRocodromo(mockRepository);
    const rocodromoId = 999;

    // Act
    const resultado = await obtenerZonasRocodromo.execute(rocodromoId);

    // Assert
    expect(mockRepository.obtenerZonasDeRocodromo).toHaveBeenCalledWith(rocodromoId);
    expect(resultado).toBeNull();
  });

  it('debería lanzar un error si el repositorio falla', async () => {
    // Arrange
    const errorMsg = 'Error de conexión';
    const mockRepository = {
      obtenerZonasDeRocodromo: jest.fn(async () => {
        throw new Error(errorMsg);
      }),
    };

    const obtenerZonasRocodromo = new ObtenerZonasRocodromo(mockRepository);
    const rocodromoId = 1;

    // Act & Assert
    await expect(obtenerZonasRocodromo.execute(rocodromoId)).rejects.toThrow(
      `Error al obtener el rocodromo por ID: ${errorMsg}`
    );
  });
});
