import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import PistaController from '../../../src/interfaces/http/controllers/pistaController.js';

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
  res.sendFile = jest.fn((filePath) => {
    res.sentFile = filePath;
    return res;
  });
  return res;
}

afterEach(() => {
  jest.restoreAllMocks();
});

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
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue({ id: 7, idZona: 2, nombre: 'Pista', dificultad: '6a', estado: 'Flash' }) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 }, user: { apodo: 'TestClimber' } };
    const res = createResMock();

    await controller.obtenerPistaPorId(req, res, () => {});

    expect(useCases.obtenerPistaPorId.execute).toHaveBeenCalledWith(7, 'TestClimber');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual({ id: 7, idZona: 2, nombre: 'Pista', dificultad: '6a', estado: 'Flash' });
  });

  it('obtenerPistaPorId: pasa null como apodo si no hay user', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue({ id: 7, idZona: 2, nombre: 'Pista', dificultad: '6a', estado: null }) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 } };
    const res = createResMock();

    await controller.obtenerPistaPorId(req, res, () => {});

    expect(useCases.obtenerPistaPorId.execute).toHaveBeenCalledWith(7, null);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('obtenerPistaPorId: 404 cuando no existe', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue(null) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 999 }, user: { apodo: 'TestClimber' } };
    const res = createResMock();

    await controller.obtenerPistaPorId(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.body).toEqual({ error: 'Pista con ID 999 no encontrada' });
  });

  it('actualizarImagen: actualiza la imagen y elimina la anterior', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue({ id: 7, imagenUrl: '/uploads/imagenes_pistas/old.png' }) },
      actualizarImagen: { execute: jest.fn().mockResolvedValue({ id: 7, imagenUrl: '/uploads/imagenes_pistas/new.png' }) },
      crear: { execute: jest.fn() },
    };
    const controller = new PistaController(useCases);
    const req = {
      params: { id: 7 },
      file: { path: '/tmp/new.png', filename: 'new.png' },
    };
    const res = createResMock();

    jest.spyOn(fs, 'unlink').mockResolvedValue();
    jest.spyOn(fs, 'mkdir').mockResolvedValue();
    jest.spyOn(fs, 'rename').mockResolvedValue();

    await controller.actualizarImagen(req, res, () => {});

    expect(useCases.obtenerPistaPorId.execute).toHaveBeenCalledWith(7, null);
    expect(fs.unlink).toHaveBeenCalledWith(
      path.resolve(process.cwd(), 'uploads', 'imagenes_pistas', 'old.png')
    );
    expect(fs.rename).toHaveBeenCalledWith(
      '/tmp/new.png',
      path.resolve(process.cwd(), 'uploads', 'imagenes_pistas', 'new.png')
    );
    expect(useCases.actualizarImagen.execute).toHaveBeenCalledWith(7, '/uploads/imagenes_pistas/new.png');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body).toEqual({ id: 7, imagenUrl: '/uploads/imagenes_pistas/new.png' });
  });

  it('obtenerImagen: devuelve el archivo de la pista', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue({ id: 7, imagenUrl: '/uploads/imagenes_pistas/existing.png' }) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 } };
    const res = createResMock();

    jest.spyOn(fs, 'access').mockResolvedValue();

    await controller.obtenerImagen(req, res, () => {});

    expect(useCases.obtenerPistaPorId.execute).toHaveBeenCalledWith(7, null);
    expect(res.sentFile).toBe(path.resolve(process.cwd(), 'uploads', 'imagenes_pistas', 'existing.png'));
  });

  it('obtenerImagen: responde 404 si la pista no tiene imagen', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue({ id: 7, imagenUrl: null }) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 } };
    const res = createResMock();

    await controller.obtenerImagen(req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.body).toEqual({ error: 'La pista no tiene imagen asignada' });
  });

  describe('cambiarEstado', () => {
    it('responde 200 con mensaje de éxito cuando el cambio de estado es exitoso', async () => {
      const useCases = {
        cambiarEstado: { 
          execute: jest.fn().mockResolvedValue({ 
            mensaje: 'Estado de la pista con ID 1 cambiado a completado exitosamente.' 
          }) 
        }
      };
      const controller = new PistaController(useCases);
      const req = { 
        params: { id: '1' },
        body: { estado: 'completado' },
        user: { apodo: 'TestClimber' }
      };
      const res = createResMock();

      await controller.cambiarEstado(req, res, () => {});

      expect(useCases.cambiarEstado.execute).toHaveBeenCalledWith({ 
        idPista: '1', 
        nuevoEstado: 'completado',
        escaladorApodo: 'TestClimber'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ 
        mensaje: 'Estado de la pista con ID 1 cambiado a completado exitosamente.' 
      });
    });

    it('responde 500 si el caso de uso lanza un error', async () => {
      const errorMessage = 'Error al cambiar el estado de la pista: Pista con ID 999 no encontrada';
      const useCases = {
        cambiarEstado: { 
          execute: jest.fn().mockRejectedValue(new Error(errorMessage)) 
        }
      };
      const controller = new PistaController(useCases);
      const req = { 
        params: { id: '999' },
        body: { estado: 'completado' },
        user: { apodo: 'TestClimber' }
      };
      const res = createResMock();

      await controller.cambiarEstado(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body).toEqual({ error: errorMessage });
    });
  });

  describe('eliminar', () => {
    it('responde 200 con mensaje de exito cuando inactiva la pista', async () => {
      const useCases = {
        eliminar: {
          execute: jest.fn().mockResolvedValue({
            mensaje: 'Pista con ID 1 inactivada exitosamente.',
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = { params: { id: '1' } };
      const res = createResMock();

      await controller.eliminar(req, res, () => {});

      expect(useCases.eliminar.execute).toHaveBeenCalledWith({ idPista: '1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        mensaje: 'Pista con ID 1 inactivada exitosamente.',
      });
    });

    it('responde 500 si el caso de uso lanza un error', async () => {
      const useCases = {
        eliminar: {
          execute: jest.fn().mockRejectedValue(new Error('Error al eliminar la pista')),
        },
      };
      const controller = new PistaController(useCases);
      const req = { params: { id: '999' } };
      const res = createResMock();

      await controller.eliminar(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body).toEqual({ error: 'Error al eliminar la pista' });
    });
  });

  describe('actualizar', () => {
    it('responde 200 con la pista actualizada', async () => {
      const useCases = {
        actualizar: {
          execute: jest.fn().mockResolvedValue({
            id: 1,
            nombre: 'Pista Actualizada',
            dificultad: '6b',
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = {
        params: { id: '1' },
        body: {
          nombre: 'Pista Actualizada',
          dificultad: '6b',
        },
      };
      const res = createResMock();

      await controller.actualizar(req, res, () => {});

      expect(useCases.actualizar.execute).toHaveBeenCalledWith({
        idPista: '1',
        idZona: undefined,
        nombre: 'Pista Actualizada',
        tipo: undefined,
        dificultad: '6b',
        colorPresas: undefined,
        posX: undefined,
        posY: undefined,
        fechaCreacion: undefined,
        fechaRetirada: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        id: 1,
        nombre: 'Pista Actualizada',
        dificultad: '6b',
      });
    });

    it('responde 500 si el caso de uso lanza un error', async () => {
      const useCases = {
        actualizar: {
          execute: jest.fn().mockRejectedValue(new Error('Error al actualizar la pista')),
        },
      };
      const controller = new PistaController(useCases);
      const req = { params: { id: '999' }, body: { nombre: 'Nueva' } };
      const res = createResMock();

      await controller.actualizar(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body).toEqual({ error: 'Error al actualizar la pista' });
    });
  });
});
