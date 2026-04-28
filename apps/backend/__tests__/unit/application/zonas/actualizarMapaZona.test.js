import { describe, it, expect, jest } from '@jest/globals';
import ActualizarMapaZona from '../../../../src/application/zonas/actualizarMapaZona.js';

describe('ActualizarMapaZona', () => {
  it('debería actualizar el mapa de una zona correctamente', async () => {
    const zonaActualizada = {
      id: 1,
      idRoco: 10,
      nombre: 'Bloque Principal',
      mapa: '/uploads/mapas_zonas/mapa-1.svg',
    };

    const mockZonaRepository = {
      actualizarMapaZona: jest.fn().mockResolvedValue(zonaActualizada),
    };

    const useCase = new ActualizarMapaZona(mockZonaRepository);

    const resultado = await useCase.execute(
      1,
      '/uploads/mapas_zonas/mapa-1.svg'
    );

    expect(mockZonaRepository.actualizarMapaZona).toHaveBeenCalledWith(
      1,
      '/uploads/mapas_zonas/mapa-1.svg'
    );
    expect(resultado).toEqual(zonaActualizada);
  });

  it('debera lanzar un error si la zona no existe', async () => {
    const mockZonaRepository = {
      actualizarMapaZona: jest.fn().mockResolvedValue(null),
    };

    const useCase = new ActualizarMapaZona(mockZonaRepository);

    await expect(
      useCase.execute(999, '/uploads/mapas_zonas/mapa-1.svg')
    ).rejects.toThrow('Zona con ID 999 no encontrada');
  });

  it('deberia propagar el error del repositorio', async () => {
    const mockZonaRepository = {
      actualizarMapaZona: jest.fn().mockRejectedValue(new Error('Error BD')),
    };

    const useCase = new ActualizarMapaZona(mockZonaRepository);

    await expect(
      useCase.execute(1, '/uploads/mapas_zonas/mapa-1.svg')
    ).rejects.toThrow('Error al actualizar el mapa de la zona');
  });
});
