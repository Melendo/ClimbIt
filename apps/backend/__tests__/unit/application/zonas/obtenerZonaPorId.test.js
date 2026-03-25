import { describe, it, expect, jest } from '@jest/globals';
import ObtenerZonaPorId from '../../../../src/application/zonas/obtenerZonaPorId.js';

describe('ObtenerZonaPorId', () => {
  it('debería devolver la zona por su id correctamente', async () => {
    const zona = {
      id: 1,
      idRoco: 10,
      nombre: 'Bloque Principal',
      mapa: '/uploads/mapas_zonas/mapa-1.svg',
    };

    const mockZonaRepository = {
      encontrarPorId: jest.fn().mockResolvedValue(zona),
    };

    const useCase = new ObtenerZonaPorId(mockZonaRepository);

    const resultado = await useCase.execute(1);

    expect(mockZonaRepository.encontrarPorId).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(zona);
  });

  it('debería devolver null si la zona no existe', async () => {
    const mockZonaRepository = {
      encontrarPorId: jest.fn().mockResolvedValue(null),
    };

    const useCase = new ObtenerZonaPorId(mockZonaRepository);

    const resultado = await useCase.execute(999);

    expect(mockZonaRepository.encontrarPorId).toHaveBeenCalledWith(999);
    expect(resultado).toBeNull();
  });
});