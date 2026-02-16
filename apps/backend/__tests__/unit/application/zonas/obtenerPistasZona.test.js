import { describe, it, expect, jest } from '@jest/globals';
import ObtenerPistasZona from '../../../../src/application/zonas/obtenerPistasZona.js';

describe('obtenerPistasZonaUseCase', () => {
  it('debería obtener las pistas de una zona por su ID correctamente', async () => {
    // Arrange
    const mockPistas = [
      { id: 1, idZona: 1, nombre: 'Pista 1', dificultad: '5a' },
      { id: 2, idZona: 1, nombre: 'Pista 2', dificultad: '6b' },
    ];
    
    const mockRepository = {
      obtenerPistasDeZona: jest.fn(async (id, idEscalador) => mockPistas),
    };

    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(async () => null),
    };

    const obtenerPistasZona = new ObtenerPistasZona(mockRepository, mockEscaladorRepository);
    const zonaId = 1;

    // Act
    const resultado = await obtenerPistasZona.execute(zonaId);

    // Assert
    expect(mockRepository.obtenerPistasDeZona).toHaveBeenCalledWith(zonaId, null);
    expect(resultado).toEqual(mockPistas);
  });

  it('debería retornar null si no se encuentran pistas (o la zona no existe)', async () => {
    // Arrange
    const mockRepository = {
      obtenerPistasDeZona: jest.fn(async (id, idEscalador) => null),
    };

    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(async () => null),
    };

    const obtenerPistasZona = new ObtenerPistasZona(mockRepository, mockEscaladorRepository);
    const zonaId = 999;

    // Act
    const resultado = await obtenerPistasZona.execute(zonaId);

    // Assert
    expect(mockRepository.obtenerPistasDeZona).toHaveBeenCalledWith(zonaId, null);
    expect(resultado).toBeNull();
  });

  it('debería lanzar un error si el repositorio falla', async () => {
    // Arrange
    const errorMsg = 'Error de conexión';
    const mockRepository = {
      obtenerPistasDeZona: jest.fn(async () => {
        throw new Error(errorMsg);
      }),
    };

    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(async () => null),
    };

    const obtenerPistasZona = new ObtenerPistasZona(mockRepository, mockEscaladorRepository);
    const zonaId = 1;

    // Act & Assert
    await expect(obtenerPistasZona.execute(zonaId)).rejects.toThrow(
      `Error al obtener la zona por ID: ${errorMsg}`
    );
  });
});
