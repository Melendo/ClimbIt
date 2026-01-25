import { jest } from '@jest/globals';
import EscaladorController from '../../../src/interfaces/http/controllers/escaladorController.js';

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

describe('Unit: EscaladorController', () => {
  it('crear: responde 201 con el escalador creado', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockResolvedValue({ id: 1, correo: 'a@b.com', apodo: 'Tester' }) },
    };
    const controller = new EscaladorController(useCases);
    const req = { body: { correo: 'a@b.com', contrasena: '123', apodo: 'Tester' } };
    const res = createResMock();

    await controller.crear(req, res, () => {});

    expect(useCases.crear.execute).toHaveBeenCalledWith({ correo: 'a@b.com', contrasena: '123', apodo: 'Tester' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body).toEqual({ id: 1, correo: 'a@b.com', apodo: 'Tester' });
  });

  it('crear: responde 500 ante errores', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new EscaladorController(useCases);
    const req = { body: { correo: 'a@b.com', contrasena: '123', apodo: 'Tester' } };
    const res = createResMock();

    await controller.crear(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: 'falló' });
  });
});
