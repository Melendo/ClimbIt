import { describe, it, expect, jest } from '@jest/globals';
import CrearZona from '../../../../src/application/zonas/crearZona.js';
import Zona from '../../../../src/domain/zonas/Zona.js';

describe('CrearZona', () => {
  let mockZonaRepository;
  let mockRocodromoModel;
  let crearZona;

  beforeEach(() => {
    mockZonaRepository = {
      crearZona: jest.fn(),
    };
    mockRocodromoModel = {
      findByPk: jest.fn(),
    };
    crearZona = new CrearZona(mockZonaRepository, mockRocodromoModel);
  });

  it('debería crear una zona correctamente', async () => {
    // Arrange
    const datosZona = {
      idRoco: 1,
      nombre: 'Bloque Principal',
      tipo: 'Bloque',
    };

    const zonaCreada = {
      id: 1,
      idRoco: 1,
      nombre: 'Bloque Principal',
      tipo: 'Bloque',
    };

    mockRocodromoModel.findByPk.mockResolvedValue({ id: 1 });
    mockZonaRepository.crearZona.mockResolvedValue(zonaCreada);

    // Act
    const resultado = await crearZona.execute(datosZona);

    // Assert
    expect(mockRocodromoModel.findByPk).toHaveBeenCalledWith(datosZona.idRoco);
    expect(mockZonaRepository.crearZona).toHaveBeenCalledWith(
      expect.any(Zona)
    );
    expect(resultado).toEqual(zonaCreada);
  });

  it('debería lanzar un error si el rocodromo no existe', async () => {
    // Arrange
    const datosZona = {
      idRoco: 999,
      nombre: 'Bloque Principal',
      tipo: 'Bloque',
    };

    mockRocodromoModel.findByPk.mockResolvedValue(null);

    // Act & Assert
    await expect(crearZona.execute(datosZona)).rejects.toThrow(
      `Error al crear la zona: El rocodromo con ID ${datosZona.idRoco} no existe`
    );

    expect(mockZonaRepository.crearZona).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si el repositorio falla', async () => {
    // Arrange
    const datosZona = {
      idRoco: 1,
      nombre: 'Bloque Principal',
      tipo: 'Bloque',
    };

    const errorMsg = 'Error en BD';
    mockRocodromoModel.findByPk.mockResolvedValue({ id: 1 });
    mockZonaRepository.crearZona.mockRejectedValue(new Error(errorMsg));

    // Act & Assert
    await expect(crearZona.execute(datosZona)).rejects.toThrow(
      `Error al crear la zona: ${errorMsg}`
    );
  });
});
