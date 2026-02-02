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

  describe('autenticar', () => {
    it('responde 200 con el token si las credenciales son correctas', async () => {
        const useCases = {
            autenticar: { execute: jest.fn().mockResolvedValue({ token: 'fake_token_jwt' }) }
        };
        const controller = new EscaladorController(useCases);
        const req = { body: { correo: 'test@example.com', contrasena: '123456' } };
        const res = createResMock();

        await controller.autenticar(req, res, () => {});

        expect(useCases.autenticar.execute).toHaveBeenCalledWith({ 
            correo: 'test@example.com', 
            contrasena: '123456' 
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ token: 'fake_token_jwt' });
    });

    it('responde 401 si el caso de uso lanza un error (credenciales inválidas)', async () => {
        const errorMessage = 'Credenciales inválidas';
        const useCases = {
            autenticar: { execute: jest.fn().mockRejectedValue(new Error(errorMessage)) }
        };
        const controller = new EscaladorController(useCases);
        const req = { body: { correo: 'test@example.com', contrasena: 'wrong' } };
        const res = createResMock();

        await controller.autenticar(req, res, () => {});

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ error: errorMessage });
    });
  });
});
