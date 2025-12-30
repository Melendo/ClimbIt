import { jest } from '@jest/globals';
import ObtenerPistaPorId from '../../../src/application/pistas/obtenerPistaPorId.js';

describe('obtenerPistaPorIdUseCase', () => {
  it('debería obtener una pista por su ID correctamente', async () => {
    const mockRepository = {
      obtenerPorId: jest.fn(async (id) => ({
        id,
        idZona: 1,
        nombre: 'Ex1',
        dificultad: '3a',
      })),
    };

    const obtenerPista = new ObtenerPistaPorId(mockRepository);

    const pistaId = 1;
    const resultado = await obtenerPista.execute(pistaId);

    expect(resultado).toMatchObject({
      id: 1,
      idZona: 1,
      nombre: 'Ex1',
      dificultad: '3a',
    });
  });

  it('no debería obtener una pista por su ID si no existe', async () => {
    const mockRepository = {
      obtenerPorId: jest.fn(async (id) => null),
    };

    const obtenerPista = new ObtenerPistaPorId(mockRepository);

    const pistaId = 999;
    const resultado = await obtenerPista.execute(pistaId);
    expect(resultado).toBeNull();
  });
});
