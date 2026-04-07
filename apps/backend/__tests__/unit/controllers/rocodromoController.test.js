import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import RocodromoController from '../../../src/interfaces/http/controllers/rocodromoController.js';
import { BadRequestError, NotFoundError } from '../../../src/domain/sharedObjects/AppError.js';

function createResMock() {
  const res = {
    statusCode: null,
    body: null,
    sentFile: null,
  };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload) => {
    res.body = payload;
    return res;
  });
  res.headersSent = false;
  res.sendFile = jest.fn((filePath, cb) => {
    res.sentFile = filePath;
    if (cb) cb(null);
    return res;
  });
  return res;
}

afterEach(() => {
  jest.restoreAllMocks();
});

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

    const next = jest.fn();

    await controller.obtenerZonasDeRocodromo(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Rocódromo con ID 999 no encontrado');
    expect(error.code).toBe('ROCODROMO_NOT_FOUND');
  });

  it('obtenerZonasDeRocodromo: 500 ante errores', async () => {
    const useCases = {
      obtenerZonasRocodromo: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 5 } };
    const res = createResMock();

    const next = jest.fn();

    await controller.obtenerZonasDeRocodromo(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('falló');
  });

  it('obtenerRocodromos: 200 devuelve lista', async () => {
    const mockRocodromos = [{ id: 1, nombre: 'Roco1' }];
    const useCases = {
      obtenerRocodromos: { execute: jest.fn().mockResolvedValue(mockRocodromos) },
    };
    const controller = new RocodromoController(useCases);
    const req = {};
    const res = createResMock();

    await controller.obtenerRocodromos(req, res, () => {});

    expect(useCases.obtenerRocodromos.execute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual(mockRocodromos);
  });

  it('obtenerRocodromos: 500 ante errores', async () => {
    const useCases = {
      obtenerRocodromos: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new RocodromoController(useCases);
    const req = {};
    const res = createResMock();

    const next = jest.fn();

    await controller.obtenerRocodromos(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('falló');
  });

  it('subirLogo: actualiza el logo y elimina el anterior', async () => {
    const useCases = {
      obtenerInformacion: { execute: jest.fn().mockResolvedValue({ id: 1, logoUrl: '/uploads/logos_rocodromos/old.png' }) },
      actualizarLogo: { execute: jest.fn().mockResolvedValue({ id: 1, logoUrl: '/uploads/logos_rocodromos/new.png' }) },
    };
    const controller = new RocodromoController(useCases);
    const req = {
      params: { id: 1 },
      file: { filename: 'new.png' },
    };
    const res = createResMock();

    jest.spyOn(fs, 'unlink').mockResolvedValue();

    await controller.subirLogo(req, res, () => {});

    expect(useCases.obtenerInformacion.execute).toHaveBeenCalledWith(1);
    expect(fs.unlink).toHaveBeenCalledWith(
      path.resolve(process.cwd(), 'uploads', 'logos_rocodromos', 'old.png')
    );
    expect(useCases.actualizarLogo.execute).toHaveBeenCalledWith(1, '/uploads/logos_rocodromos/new.png');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual({ logoUrl: '/uploads/logos_rocodromos/new.png' });
  });

  it('subirLogo: responde 400 si falta el archivo', async () => {
    const useCases = {
      obtenerInformacion: { execute: jest.fn() },
      actualizarLogo: { execute: jest.fn() },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();
    const next = jest.fn();

    await controller.subirLogo(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ROCODROMO_LOGO_REQUERIDO');
  });

  it('subirLogo: responde 404 si el rocódromo no existe', async () => {
    const useCases = {
      obtenerInformacion: { execute: jest.fn().mockResolvedValue(null) },
      actualizarLogo: { execute: jest.fn() },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 1 }, file: { filename: 'new.png' } };
    const res = createResMock();
    const next = jest.fn();

    jest.spyOn(fs, 'unlink').mockResolvedValue();

    await controller.subirLogo(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ROCODROMO_NOT_FOUND');
  });

  it('obtenerLogo: devuelve el archivo del rocódromo', async () => {
    const useCases = {
      obtenerInformacion: { execute: jest.fn().mockResolvedValue({ id: 1, logoUrl: '/uploads/logos_rocodromos/logo.png' }) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();

    await controller.obtenerLogo(req, res, () => {});

    expect(useCases.obtenerInformacion.execute).toHaveBeenCalledWith(1);
    expect(res.sentFile).toBe(path.resolve(process.cwd(), 'uploads', 'logos_rocodromos', 'logo.png'));
  });

  it('obtenerLogo: responde 404 si no hay logo', async () => {
    const useCases = {
      obtenerInformacion: { execute: jest.fn().mockResolvedValue({ id: 1, logoUrl: null }) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();
    const next = jest.fn();

    await controller.obtenerLogo(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ROCODROMO_LOGO_NOT_FOUND');
  });

  it('obtenerLogo: responde 404 si el archivo no existe', async () => {
    const useCases = {
      obtenerInformacion: { execute: jest.fn().mockResolvedValue({ id: 1, logoUrl: '/uploads/logos_rocodromos/logo.png' }) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();
    const next = jest.fn();

    res.sendFile = jest.fn((_filePath, cb) => {
      res.sentFile = _filePath;
      if (cb) cb(new Error('no file'));
      return res;
    });

    await controller.obtenerLogo(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ROCODROMO_LOGO_NOT_FOUND');
  });

  it('obtenerEscalasDificultad: responde 404 si no existe', async () => {
    const useCases = {
      obtenerEscalasDificultad: { execute: jest.fn().mockResolvedValue(null) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();
    const next = jest.fn();

    await controller.obtenerEscalasDificultad(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ROCODROMO_NOT_FOUND');
  });

  it('obtenerEscalasDificultad: responde 500 ante errores', async () => {
    const useCases = {
      obtenerEscalasDificultad: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new RocodromoController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();

    await controller.obtenerEscalasDificultad(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: 'falló' });
  });
});
