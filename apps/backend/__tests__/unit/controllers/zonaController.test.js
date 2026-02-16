import { jest } from '@jest/globals';
import ZonaController from '../../../src/interfaces/http/controllers/zonaController.js';

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

describe('Unit: ZonaController', () => {
  it('obtenerPistasDeZona: 200 cuando existe', async () => {
    const useCases = {
      obtenerPistasDeZona: { execute: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Pista 1' }]) },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 3 }, user: null };
    const res = createResMock();

    await controller.obtenerPistasDeZona(req, res, () => {});

    expect(useCases.obtenerPistasDeZona.execute).toHaveBeenCalledWith(3, null);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual([{ id: 1, nombre: 'Pista 1' }]);
  });

  it('obtenerPistasDeZona: 404 cuando no existe', async () => {
    const useCases = {
      obtenerPistasDeZona: { execute: jest.fn().mockResolvedValue(null) },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 999 } };
    const res = createResMock();

    await controller.obtenerPistasDeZona(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.body).toEqual({ error: 'Zona con ID 999 no encontrada' });
  });

  it('obtenerPistasDeZona: 500 ante errores', async () => {
    const useCases = {
      obtenerPistasDeZona: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 3 } };
    const res = createResMock();

    await controller.obtenerPistasDeZona(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: 'falló' });
  });
});
