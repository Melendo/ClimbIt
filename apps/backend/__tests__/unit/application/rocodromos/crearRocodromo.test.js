import { describe, it, expect, jest } from '@jest/globals';
import CrearRocodromo from '../../../../src/application/rocodromos/crearRocodromo.js';
import Rocodromo from '../../../../src/domain/rocodromos/Rocodromo.js';

describe('CrearRocodromo', () => {
  it('debería crear un rocodromo correctamente', async () => {
    // Arrange
    const datosRocodromo = {
      nombre: 'Rocodromo Test',
      ubicacion: 'Madrid',
    };

    const rocodromoCreado = new Rocodromo(
      1,
      datosRocodromo.nombre,
      datosRocodromo.ubicacion
    );

    const mockRepository = {
      crearRocodromo: jest.fn(async (rocodromo) => {
        // Verify that the rocodromo instance is passed correctly
        expect(rocodromo).toBeInstanceOf(Rocodromo);
        expect(rocodromo.nombre).toBe(datosRocodromo.nombre);
        expect(rocodromo.ubicacion).toBe(datosRocodromo.ubicacion);
        return rocodromoCreado;
      }),
    };

    const crearRoco = new CrearRocodromo(mockRepository);

    // Act
    const resultado = await crearRoco.execute(datosRocodromo);

    // Assert
    expect(resultado).toBeDefined();
    expect(resultado.nombre).toBe(datosRocodromo.nombre);
    expect(resultado.ubicacion).toBe(datosRocodromo.ubicacion);
  });

  it('debería lanzar un error si faltan datos requeridos', async () => {
    // Arrange
    const datosIncompletos = {
      nombre: 'Rocodromo Test',
      // falta ubicacion
    };

    const mockRepository = {
      crearRocodromo: jest.fn(),
    };

    const crearRoco = new CrearRocodromo(mockRepository);

    // Act & Assert
    await expect(crearRoco.execute(datosIncompletos)).rejects.toThrow();
  });

  it('debería lanzar un error si el repositorio falla', async () => {
    // Arrange
    const datosRocodromo = {
      nombre: 'Rocodromo Test',
      ubicacion: 'Madrid',
      tipo: 'Artificial',
    };

    const errorMsg = 'Error en BD';
    const mockRepository = {
      crearRocodromo: jest.fn(async () => {
        throw new Error(errorMsg);
      }),
    };

    const crearRoco = new CrearRocodromo(mockRepository);

    // Act & Assert
    await expect(crearRoco.execute(datosRocodromo)).rejects.toThrow(
      `Error al crear el rocodromo: ${errorMsg}`
    );
  });
});
