import { describe, it, expect, jest } from '@jest/globals';
import ObtenerRocodromosSuscritos from '../../../../src/application/escaladores/obtenerRocodromosSuscritos.js';

describe('ObtenerRocodromosSuscritos', () => {
  it('debería obtener los rocodromos suscritos del escalador', async () => {
    // Arrange
    const apodo = 'TestClimber';
    const escaladorId = 1;
    const rocodromos = [
      {
        id: 1,
        nombre: 'Rocodromo A',
        ubicacion: 'Madrid',
      },
      {
        id: 2,
        nombre: 'Rocodromo B',
        ubicacion: 'Barcelona',
      },
    ];

    const escaladorEncontrado = {
      id: escaladorId,
      apodo: 'TestClimber',
    };

    const mockRepository = {
      encontrarPorApodo: jest.fn(async () => escaladorEncontrado),
      obtenerRocodromosSuscritos: jest.fn(async () => rocodromos),
    };

    const obtenerSuscritos = new ObtenerRocodromosSuscritos(mockRepository);

    // Act
    const resultado = await obtenerSuscritos.execute(apodo);

    // Assert
    expect(mockRepository.encontrarPorApodo).toHaveBeenCalledWith(apodo);
    expect(mockRepository.obtenerRocodromosSuscritos).toHaveBeenCalledWith(escaladorId);
    expect(resultado).toEqual(rocodromos);
  });

  it('debería retornar un array vacío si el escalador no tiene rocodromos suscritos', async () => {
    // Arrange
    const apodo = 'TestClimber';
    const escaladorId = 1;
    const escaladorEncontrado = {
      id: escaladorId,
      apodo: 'TestClimber',
    };

    const mockRepository = {
      encontrarPorApodo: jest.fn(async () => escaladorEncontrado),
      obtenerRocodromosSuscritos: jest.fn(async () => []),
    };

    const obtenerSuscritos = new ObtenerRocodromosSuscritos(mockRepository);

    // Act
    const resultado = await obtenerSuscritos.execute(apodo);

    // Assert
    expect(mockRepository.encontrarPorApodo).toHaveBeenCalledWith(apodo);
    expect(mockRepository.obtenerRocodromosSuscritos).toHaveBeenCalledWith(escaladorId);
    expect(resultado).toEqual([]);
  });

  it('debería lanzar un error si el escalador no existe', async () => {
    // Arrange
    const apodo = 'NoExistente';
    const mockRepository = {
      encontrarPorApodo: jest.fn(async () => null),
      obtenerRocodromosSuscritos: jest.fn(),
    };

    const obtenerSuscritos = new ObtenerRocodromosSuscritos(mockRepository);

    // Act & Assert
    await expect(obtenerSuscritos.execute(apodo)).rejects.toThrow(
      'Escalador no encontrado'
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
      obtenerRocodromosSuscritos: jest.fn(),
    };

    const obtenerSuscritos = new ObtenerRocodromosSuscritos(mockRepository);

    // Act & Assert
    await expect(obtenerSuscritos.execute(apodo)).rejects.toThrow(errorMsg);
  });
});
