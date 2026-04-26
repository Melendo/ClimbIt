import { jest } from '@jest/globals';
import AmistadController from '../../../src/interfaces/http/controllers/amistadController.js';

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

describe('Unit: AmistadController', () => {
  it('enviarSolicitud responde 201 con el resultado del caso de uso', async () => {
    const useCases = {
      enviarSolicitud: { execute: jest.fn().mockResolvedValue({ mensaje: 'ok' }) },
    };
    const controller = new AmistadController(useCases);
    const req = { user: { apodo: 'ivan' }, body: { apodoDestinatario: 'ana' } };
    const res = createResMock();

    await controller.enviarSolicitud(req, res, () => {});

    expect(useCases.enviarSolicitud.execute).toHaveBeenCalledWith({
      apodoRemitente: 'ivan',
      apodoDestinatario: 'ana',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body).toEqual({ mensaje: 'ok' });
  });

  it('responderSolicitud responde 200', async () => {
    const useCases = {
      responderSolicitud: { execute: jest.fn().mockResolvedValue({ mensaje: 'respondida' }) },
    };
    const controller = new AmistadController(useCases);
    const req = { user: { apodo: 'ana' }, body: { idSolicitud: 10, respuesta: 'aceptada' } };
    const res = createResMock();

    await controller.responderSolicitud(req, res, () => {});

    expect(useCases.responderSolicitud.execute).toHaveBeenCalledWith({
      apodoDestinatario: 'ana',
      idSolicitud: 10,
      respuesta: 'aceptada',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('listarAmigos responde 200 con la lista', async () => {
    const useCases = {
      listarAmigos: { execute: jest.fn().mockResolvedValue([{ id: 2, apodo: 'ana' }]) },
    };
    const controller = new AmistadController(useCases);
    const req = { user: { apodo: 'ivan' } };
    const res = createResMock();

    await controller.listarAmigos(req, res, () => {});

    expect(useCases.listarAmigos.execute).toHaveBeenCalledWith({ apodoEscalador: 'ivan' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual([{ id: 2, apodo: 'ana' }]);
  });

  it('consultarPerfilAmigo responde 200 con el perfil', async () => {
    const useCases = {
      consultarPerfilAmigo: { execute: jest.fn().mockResolvedValue({ id: 2, apodo: 'ana' }) },
    };
    const controller = new AmistadController(useCases);
    const req = { user: { apodo: 'ivan' }, params: { apodo: 'ana' } };
    const res = createResMock();

    await controller.consultarPerfilAmigo(req, res, () => {});

    expect(useCases.consultarPerfilAmigo.execute).toHaveBeenCalledWith({
      apodoSolicitante: 'ivan',
      apodoPerfil: 'ana',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('eliminarAmigo responde 200', async () => {
    const useCases = {
      eliminarAmigo: { execute: jest.fn().mockResolvedValue({ mensaje: 'Amigo eliminado correctamente' }) },
    };
    const controller = new AmistadController(useCases);
    const req = { user: { apodo: 'ivan' }, params: { apodoAmigo: 'ana' } };
    const res = createResMock();

    await controller.eliminarAmigo(req, res, () => {});

    expect(useCases.eliminarAmigo.execute).toHaveBeenCalledWith({
      apodoSolicitante: 'ivan',
      apodoAmigo: 'ana',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('propaga errores mediante next', async () => {
    const expectedError = new Error('fallo');
    const useCases = {
      enviarSolicitud: { execute: jest.fn().mockRejectedValue(expectedError) },
    };
    const controller = new AmistadController(useCases);
    const req = { user: { apodo: 'ivan' }, body: { apodoDestinatario: 'ana' } };
    const res = createResMock();
    const next = jest.fn();

    await controller.enviarSolicitud(req, res, next);

    expect(next).toHaveBeenCalledWith(expectedError);
  });

  it('listarSolicitudesPendientes responde 200 con la lista', async () => {
    const useCases = {
      listarSolicitudesPendientes: { execute: jest.fn().mockResolvedValue([{ id: 1, remitente: { apodo: 'ana' } }]) },
    };
    const controller = new AmistadController(useCases);
    const req = { user: { apodo: 'ivan' } };
    const res = createResMock();

    await controller.listarSolicitudesPendientes(req, res, () => {});

    expect(useCases.listarSolicitudesPendientes.execute).toHaveBeenCalledWith({ apodoEscalador: 'ivan' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual([{ id: 1, remitente: { apodo: 'ana' } }]);
  });
});
