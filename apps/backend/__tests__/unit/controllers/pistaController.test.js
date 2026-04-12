import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import PistaController from '../../../src/interfaces/http/controllers/pistaController.js';
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

    expect(useCases.crear.execute).toHaveBeenCalledWith(
      expect.objectContaining({ idZona: 2, nombre: 'Pista', dificultad: '6a' })
    );
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

    const next = jest.fn();

    await controller.crear(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('falló');
  });

  it('crear: sube imagen y actualiza la pista', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockResolvedValue({ id: 1 }) },
      actualizarImagen: { execute: jest.fn().mockResolvedValue({ id: 1, imagenUrl: '/uploads/imagenes_pistas/new.png' }) },
    };
    const controller = new PistaController(useCases);
    const req = {
      body: { idZona: 2, nombre: 'Pista', dificultad: '6a', imagenUrl: '/old.png' },
      file: { path: '/tmp/new.png', filename: 'new.png' },
    };
    const res = createResMock();

    jest.spyOn(fs, 'mkdir').mockResolvedValue();
    jest.spyOn(fs, 'rename').mockResolvedValue();
    jest.spyOn(fs, 'unlink').mockResolvedValue();

    await controller.crear(req, res, () => {});

    expect(useCases.crear.execute).toHaveBeenCalledWith(
      expect.objectContaining({ imagenUrl: null })
    );
    expect(useCases.actualizarImagen.execute).toHaveBeenCalledWith(1, '/uploads/imagenes_pistas/new.png');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('crear: usa next con error de limpieza', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new PistaController(useCases);
    const req = {
      body: { idZona: 2 },
      file: { path: '/tmp/new.png', filename: 'new.png' },
    };
    const res = createResMock();
    const next = jest.fn();

    const unlinkError = new Error('unlink fail');
    unlinkError.code = 'EACCES';
    jest.spyOn(fs, 'unlink').mockRejectedValue(unlinkError);

    await controller.crear(req, res, next);

    expect(next).toHaveBeenCalledWith(unlinkError);
  });

  it('crear: propaga el error original si no hay archivo para limpiar', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
    };
    const controller = new PistaController(useCases);
    const req = {
      body: { idZona: 2 },
      file: { path: '/tmp/new.png', filename: 'new.png' },
    };
    const res = createResMock();
    const next = jest.fn();

    const unlinkError = new Error('no file');
    unlinkError.code = 'ENOENT';
    jest.spyOn(fs, 'unlink').mockRejectedValue(unlinkError);

    await controller.crear(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('falló');
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

    const next = jest.fn();

    await controller.obtenerPistaPorId(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Pista con ID 999 no encontrada');
    expect(error.code).toBe('PISTA_NOT_FOUND');
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

    const next = jest.fn();

    await controller.obtenerImagen(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('La pista no tiene imagen asignada');
    expect(error.code).toBe('PISTA_IMAGEN_NO_ASIGNADA');
  });

  it('actualizarImagen: responde 400 si falta la imagen', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn() },
      actualizarImagen: { execute: jest.fn() },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 } };
    const res = createResMock();
    const next = jest.fn();

    await controller.actualizarImagen(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('PISTA_IMAGEN_REQUERIDA');
  });

  it('actualizarImagen: responde 404 si la pista no existe', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue(null) },
      actualizarImagen: { execute: jest.fn() },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 }, file: { path: '/tmp/new.png', filename: 'new.png' } };
    const res = createResMock();
    const next = jest.fn();

    jest.spyOn(fs, 'unlink').mockResolvedValue();

    await controller.actualizarImagen(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('PISTA_NOT_FOUND');
  });

  it('obtenerImagen: responde 404 si el archivo no existe', async () => {
    const useCases = {
      obtenerPistaPorId: { execute: jest.fn().mockResolvedValue({ id: 7, imagenUrl: '/uploads/imagenes_pistas/existing.png' }) },
    };
    const controller = new PistaController(useCases);
    const req = { params: { id: 7 } };
    const res = createResMock();
    const next = jest.fn();

    const accessError = new Error('no file');
    accessError.code = 'ENOENT';
    jest.spyOn(fs, 'access').mockRejectedValue(accessError);

    await controller.obtenerImagen(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0];
    expect(error.code).toBe('PISTA_IMAGEN_NOT_FOUND');
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

      const next = jest.fn();

      await controller.cambiarEstado(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
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

      const next = jest.fn();

      await controller.eliminar(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Error al eliminar la pista');
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

      const next = jest.fn();

      await controller.actualizar(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Error al actualizar la pista');
    });
  });

  describe('actualizarValoracion', () => {
    it('responde 200 con éxito cuando se actualiza la valoración', async () => {
      const useCases = {
        actualizarValoracion: {
          execute: jest.fn().mockResolvedValue({
            mensaje: 'Valoración actualizada exitosamente',
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = {
        params: { id: '1' },
        body: { valoracion: 8 },
        user: { apodo: 'TestClimber' },
      };
      const res = createResMock();

      await controller.actualizarValoracion(req, res, () => {});

      expect(useCases.actualizarValoracion.execute).toHaveBeenCalledWith({
        idPista: '1',
        escaladorApodo: 'TestClimber',
        nuevaValoracion: 8,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        mensaje: 'Valoración actualizada exitosamente',
      });
    });

    it('responde 200 con valoración mínima (1)', async () => {
      const useCases = {
        actualizarValoracion: {
          execute: jest.fn().mockResolvedValue({
            mensaje: 'Valoración actualizada exitosamente',
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = {
        params: { id: '1' },
        body: { valoracion: 1 },
        user: { apodo: 'TestClimber' },
      };
      const res = createResMock();

      await controller.actualizarValoracion(req, res, () => {});

      expect(useCases.actualizarValoracion.execute).toHaveBeenCalledWith({
        idPista: '1',
        escaladorApodo: 'TestClimber',
        nuevaValoracion: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responde 200 con valoración máxima (10)', async () => {
      const useCases = {
        actualizarValoracion: {
          execute: jest.fn().mockResolvedValue({
            mensaje: 'Valoración actualizada exitosamente',
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = {
        params: { id: '1' },
        body: { valoracion: 10 },
        user: { apodo: 'TestClimber' },
      };
      const res = createResMock();

      await controller.actualizarValoracion(req, res, () => {});

      expect(useCases.actualizarValoracion.execute).toHaveBeenCalledWith({
        idPista: '1',
        escaladorApodo: 'TestClimber',
        nuevaValoracion: 10,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responde 500 si el caso de uso lanza un error', async () => {
      const useCases = {
        actualizarValoracion: {
          execute: jest.fn().mockRejectedValue(
            new Error('Error al actualizar la valoración')
          ),
        },
      };
      const controller = new PistaController(useCases);
      const req = {
        params: { id: '999' },
        body: { valoracion: 8 },
        user: { apodo: 'TestClimber' },
      };
      const res = createResMock();

      const next = jest.fn();

      await controller.actualizarValoracion(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(
        'Error al actualizar la valoración'
      );
    });

    it('responde 500 si falta el apodo en req.user', async () => {
      const useCases = {
        actualizarValoracion: {
          execute: jest.fn(),
        },
      };
      const controller = new PistaController(useCases);
      const req = {
        params: { id: '1' },
        body: { valoracion: 8 },
        user: undefined,
      };
      const res = createResMock();

      const next = jest.fn();

      await controller.actualizarValoracion(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('obtenerValoracionTotal', () => {
    it('responde 200 con la valoración total de una pista', async () => {
      const useCases = {
        obtenerValoracionTotal: {
          execute: jest.fn().mockResolvedValue({
            idPista: 1,
            valoracionTotal: 8.5,
            numValoraciones: 4,
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = { params: { id: '1' } };
      const res = createResMock();

      await controller.obtenerValoracionTotal(req, res, () => {});

      expect(useCases.obtenerValoracionTotal.execute).toHaveBeenCalledWith({ idPista: '1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        idPista: 1,
        valoracionTotal: 8.5,
        numValoraciones: 4,
      });
    });

    it('responde 200 cuando no hay valoraciones', async () => {
      const useCases = {
        obtenerValoracionTotal: {
          execute: jest.fn().mockResolvedValue({
            idPista: 1,
            valoracionTotal: 0,
            numValoraciones: 0,
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = { params: { id: '1' } };
      const res = createResMock();

      await controller.obtenerValoracionTotal(req, res, () => {});

      expect(useCases.obtenerValoracionTotal.execute).toHaveBeenCalledWith({ idPista: '1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body.valoracionTotal).toBe(0);
      expect(res.body.numValoraciones).toBe(0);
    });

    it('responde 500 si el caso de uso lanza un error', async () => {
      const useCases = {
        obtenerValoracionTotal: {
          execute: jest.fn().mockRejectedValue(
            new Error('Error al obtener valoración total')
          ),
        },
      };
      const controller = new PistaController(useCases);
      const req = { params: { id: '999' } };
      const res = createResMock();

      const next = jest.fn();

      await controller.obtenerValoracionTotal(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(
        'Error al obtener valoración total'
      );
    });

    it('convierte el id de parámetro a string correctamente', async () => {
      const useCases = {
        obtenerValoracionTotal: {
          execute: jest.fn().mockResolvedValue({
            idPista: 123,
            valoracionTotal: 7.0,
            numValoraciones: 2,
          }),
        },
      };
      const controller = new PistaController(useCases);
      const req = { params: { id: '123' } };
      const res = createResMock();

      await controller.obtenerValoracionTotal(req, res, () => {});

      expect(useCases.obtenerValoracionTotal.execute).toHaveBeenCalledWith(
        { idPista: '123' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
