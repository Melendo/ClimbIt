import { jest } from '@jest/globals';
import PistaController from '../../../src/interfaces/http/controllers/pistaController.js';

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

describe('Unit: PistaController', () => {
  it('crear: responde 201 con la pista creada', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockResolvedValue({ id: 1, idZona: 2, nombre: 'Pista', dificultad: '6a' }) },
    };
    const controller = new PistaController(useCases);
    const req = { body: { idZona: 2, nombre: 'Pista', dificultad: '6a' } };
    const res = createResMock();

    await controller.crear(req, res, () => {});

    expect(useCases.crear.execute).toHaveBeenCalledWith({ idZona: 2, nombre: 'Pista', dificultad: '6a' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body).toEqual({ id: 1, idZona: 2, nombre: 'Pista', dificultad: '6a' });
  });

  it('crear: responde 500 ante errores', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new PistaController(useCases);
    const req = { body: { idZona: 2, nombre: 'Pista', dificultad: '6a' } };
    const res = createResMock();

    await controller.crear(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: 'falló' });
  });

  it('obtenerPistaPorId: 200 cuando existe', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue({ id: 7, idZona: 2, nombre: 'Pista', dificultad: '6a' }) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 } };
    const res = createResMock();

    await controller.obtenerPistaPorId(req, res, () => {});

    expect(useCases.obtenerPistaPorId.execute).toHaveBeenCalledWith(7);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual({ id: 7, idZona: 2, nombre: 'Pista', dificultad: '6a' });
  });

  it('obtenerPistaPorId: 404 cuando no existe', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue(null) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 999 } };
    const res = createResMock();

    await controller.obtenerPistaPorId(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.body).toEqual({ error: 'Pista con ID 999 no encontrada' });
  });
});
