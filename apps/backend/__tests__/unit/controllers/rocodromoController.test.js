import { jest } from '@jest/globals';
import RocodromoController from '../../../src/interfaces/http/controllers/rocodromoController.js';

function createResMock() {
  const res = {
    statusCode: null,
    body: null,
  };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload) => {
    res.body = payload;
    return res;
  });
  return res;
}

describe('Unit: RocodromoController', () => {
  it('obtenerZonasDeRocodromo: 200 cuando existe', async () => {
    const useCases = {
      obtenerZonasRocodromo: { execute: jest.fn().mockResolvedValue([{ id: 1, tipo: 'Boulder' }]) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 5 } };
    const res = createResMock();

    await controller.obtenerZonasDeRocodromo(req, res, () => {});

    expect(useCases.obtenerZonasRocodromo.execute).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual([{ id: 1, tipo: 'Boulder' }]);
  });

  it('obtenerZonasDeRocodromo: 404 cuando no existe', async () => {
    const useCases = {
      obtenerZonasRocodromo: { execute: jest.fn().mockResolvedValue(null) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 999 } };
    const res = createResMock();

    await controller.obtenerZonasDeRocodromo(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.body).toEqual({ error: 'Rocódromo con ID 999 no encontrado' });
  });

  it('obtenerZonasDeRocodromo: 500 ante errores', async () => {
    const useCases = {
      obtenerZonasRocodromo: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 5 } };
    const res = createResMock();

    await controller.obtenerZonasDeRocodromo(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: 'falló' });
  });
});
