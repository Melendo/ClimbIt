import { jest } from '@jest/globals';
import ZonaController from '../../../src/interfaces/http/controllers/zonaController.js';
import { BadRequestError, NotFoundError } from '../../../src/domain/sharedObjects/AppError.js';
import fs from 'fs/promises';
import path from 'path';

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
    const next = jest.fn();

    await controller.obtenerPistasDeZona(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Zona con ID 999 no encontrada');
    expect(error.code).toBe('ZONA_NOT_FOUND');
  });

  it('obtenerPistasDeZona: 500 ante errores', async () => {
    const useCases = {
      obtenerPistasDeZona: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 3 } };
    const res = createResMock();
    const next = jest.fn();

    await controller.obtenerPistasDeZona(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('falló');
  });

  it('subirMapa: responde 400 si falta el archivo', async () => {
    const useCases = {
      obtenerZonaPorId: { execute: jest.fn() },
      actualizarMapa: { execute: jest.fn() },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();
    const next = jest.fn();

    await controller.subirMapa(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ZONA_MAPA_REQUERIDO');
  });

  it('subirMapa: responde 404 si la zona no existe', async () => {
    const useCases = {
      obtenerZonaPorId: { execute: jest.fn().mockResolvedValue(null) },
      actualizarMapa: { execute: jest.fn() },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 1 }, file: { filename: 'mapa.png' } };
    const res = createResMock();
    const next = jest.fn();

    jest.spyOn(fs, 'unlink').mockResolvedValue();

    await controller.subirMapa(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ZONA_NOT_FOUND');
  });

  it('subirMapa: elimina mapa anterior y actualiza', async () => {
    const useCases = {
      obtenerZonaPorId: { execute: jest.fn().mockResolvedValue({ id: 1, mapa: '/uploads/mapas_zonas/old.png' }) },
      actualizarMapa: { execute: jest.fn().mockResolvedValue({ id: 1, mapa: '/uploads/mapas_zonas/new.png' }) },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 1 }, file: { filename: 'new.png' } };
    const res = createResMock();

    jest.spyOn(fs, 'unlink').mockResolvedValue();

    await controller.subirMapa(req, res, () => {});

    expect(fs.unlink).toHaveBeenCalledWith(
      path.resolve(process.cwd(), 'uploads', 'mapas_zonas', 'old.png')
    );
    expect(useCases.actualizarMapa.execute).toHaveBeenCalledWith(1, '/uploads/mapas_zonas/new.png');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('obtenerMapa: responde 404 si no hay mapa', async () => {
    const useCases = {
      obtenerZonaPorId: { execute: jest.fn().mockResolvedValue({ id: 1, mapa: null }) },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();
    const next = jest.fn();

    await controller.obtenerMapa(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ZONA_MAPA_NOT_FOUND');
  });

  it('obtenerMapa: responde 404 si el archivo no existe', async () => {
    const useCases = {
      obtenerZonaPorId: { execute: jest.fn().mockResolvedValue({ id: 1, mapa: '/uploads/mapas_zonas/mapa.png' }) },
    };
    const controller = new ZonaController(useCases);
    const req = { params: { id: 1 } };
    const res = createResMock();
    const next = jest.fn();

    res.sendFile = jest.fn((_filePath, cb) => {
      if (cb) cb(new Error('no file'));
      return res;
    });

    await controller.obtenerMapa(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('ZONA_MAPA_NOT_FOUND');
  });
});
