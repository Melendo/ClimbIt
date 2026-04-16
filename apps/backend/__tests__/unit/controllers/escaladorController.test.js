import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import EscaladorController from '../../../src/interfaces/http/controllers/escaladorController.js';
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

describe('Unit: EscaladorController', () => {
  it('crear: responde 201 con el token del escalador creado', async () => {
    const useCases = {
      crear: { execute: jest.fn().mockResolvedValue('fake_jwt_token') },
    };
    const controller = new EscaladorController(useCases);
    const req = { body: { correo: 'a@b.com', contrasena: '123', apodo: 'Tester' } };
    const res = createResMock();

    await controller.crear(req, res, () => {});

    expect(useCases.crear.execute).toHaveBeenCalledWith({ correo: 'a@b.com', contrasena: '123', apodo: 'Tester' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body).toEqual('fake_jwt_token');
  });

  it('crear: responde 500 ante errores', async () => {
    const expectedError = new Error('falló');
    const useCases = {
      crear: { execute: jest.fn().mockRejectedValue(expectedError) },
    };
    const controller = new EscaladorController(useCases);
    const req = { body: { correo: 'a@b.com', contrasena: '123', apodo: 'Tester' } };
    const res = createResMock();
    const next = jest.fn();

    await controller.crear(req, res, next);

    expect(next).toHaveBeenCalledWith(expectedError);
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
      const expectedError = new Error(errorMessage);
        const useCases = {
            autenticar: { execute: jest.fn().mockRejectedValue(expectedError) }
        };
        const controller = new EscaladorController(useCases);
        const req = { body: { correo: 'test@example.com', contrasena: 'wrong' } };
        const res = createResMock();
        const next = jest.fn();

        await controller.autenticar(req, res, next);

        expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('suscribirse', () => {
    it('responde 200 con mensaje de éxito cuando la suscripción es exitosa', async () => {
      const useCases = {
        suscribirseRocodromo: { 
          execute: jest.fn().mockResolvedValue({ 
            mensaje: 'Escalador TestClimber suscrito al rocódromo Boulder Central exitosamente.' 
          }) 
        }
      };
      const controller = new EscaladorController(useCases);
      const req = { 
        user: { apodo: 'TestClimber' },
        body: { idRocodromo: 1 } 
      };
      const res = createResMock();

      await controller.suscribirse(req, res, () => {});

      expect(useCases.suscribirseRocodromo.execute).toHaveBeenCalledWith({ 
        escaladorApodo: 'TestClimber', 
        idRocodromo: 1 
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ 
        mensaje: 'Escalador TestClimber suscrito al rocódromo Boulder Central exitosamente.' 
      });
    });

    it('responde 500 si el caso de uso lanza un error', async () => {
      const errorMessage = 'Error al suscribirse al rocódromo: Rocódromo con ID 999 no encontrado';
      const expectedError = new Error(errorMessage);
      const useCases = {
        suscribirseRocodromo: { 
          execute: jest.fn().mockRejectedValue(expectedError) 
        }
      };
      const controller = new EscaladorController(useCases);
      const req = { 
        user: { apodo: 'TestClimber' },
        body: { idRocodromo: 999 } 
      };
      const res = createResMock();
      const next = jest.fn();

      await controller.suscribirse(req, res, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('desuscribirse', () => {
    it('responde 200 con mensaje de éxito cuando la desuscripción es exitosa', async () => {
      const useCases = {
        desuscribirseRocodromo: { 
          execute: jest.fn().mockResolvedValue({ 
            mensaje: 'Escalador TestClimber desuscrito del rocódromo Boulder Central exitosamente.' 
          }) 
        }
      };
      const controller = new EscaladorController(useCases);
      const req = { 
        user: { apodo: 'TestClimber' },
        body: { idRocodromo: 1 } 
      };
      const res = createResMock();

      await controller.desuscribirse(req, res, () => {});

      expect(useCases.desuscribirseRocodromo.execute).toHaveBeenCalledWith({ 
        escaladorApodo: 'TestClimber', 
        idRocodromo: 1 
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ 
        mensaje: 'Escalador TestClimber desuscrito del rocódromo Boulder Central exitosamente.' 
      });
    });

    it('responde 500 si el caso de uso lanza un error', async () => {
      const errorMessage = 'Error al desuscribirse del rocódromo: El escalador TestClimber no está suscrito al rocódromo con ID 1';
      const expectedError = new Error(errorMessage);
      const useCases = {
        desuscribirseRocodromo: { 
          execute: jest.fn().mockRejectedValue(expectedError) 
        }
      };
      const controller = new EscaladorController(useCases);
      const req = { 
        user: { apodo: 'TestClimber' },
        body: { idRocodromo: 1 } 
      };
      const res = createResMock();
      const next = jest.fn();

      await controller.desuscribirse(req, res, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('fotos de perfil', () => {
    it('crearFotoPerfil responde 201 con la foto creada', async () => {
      const useCases = {
        crearFotoPerfil: {
          execute: jest.fn().mockResolvedValue({ id: 3, urlFoto: '/uploads/fotos_perfil/foto.png' }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        file: {
          path: '/tmp/foto.png',
          filename: 'foto.png',
        },
      };
      const res = createResMock();

      await controller.crearFotoPerfil(req, res, () => {});

      expect(useCases.crearFotoPerfil.execute).toHaveBeenCalledWith({
        urlFoto: '/uploads/fotos_perfil/foto.png',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.body).toEqual({
        id: 3,
        nombre: 'foto.png',
        urlFoto: '/uploads/fotos_perfil/foto.png',
      });
    });

    it('crearFotoPerfil usa next si falla el guardado y la limpieza', async () => {
      const useCases = {
        crearFotoPerfil: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        file: {
          path: '/tmp/foto.png',
          filename: 'foto.png',
        },
      };
      const res = createResMock();
      const next = jest.fn();

      const unlinkError = new Error('unlink fail');
      unlinkError.code = 'EACCES';
      jest.spyOn(fs, 'unlink').mockRejectedValue(unlinkError);

      await controller.crearFotoPerfil(req, res, next);

      expect(next).toHaveBeenCalledWith(unlinkError);
    });

    it('crearFotoPerfil propaga el error original si no hay archivo para limpiar', async () => {
      const useCases = {
        crearFotoPerfil: { execute: jest.fn().mockRejectedValue(new Error('falló')) },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        file: {
          path: '/tmp/foto.png',
          filename: 'foto.png',
        },
      };
      const res = createResMock();
      const next = jest.fn();

      const unlinkError = new Error('no file');
      unlinkError.code = 'ENOENT';
      jest.spyOn(fs, 'unlink').mockRejectedValue(unlinkError);

      await controller.crearFotoPerfil(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('falló');
    });

    it('crearFotoPerfil responde 400 si no se envía imagen', async () => {
      const useCases = {
        crearFotoPerfil: { execute: jest.fn() },
      };
      const controller = new EscaladorController(useCases);
      const req = {};
      const res = createResMock();
      const next = jest.fn();

      await controller.crearFotoPerfil(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('La imagen es requerida');
      expect(error.code).toBe('FOTO_PERFIL_REQUERIDA');
    });

    it('obtenerFotosPerfil responde 200 con el listado', async () => {
      const useCases = {
        obtenerFotosPerfil: { execute: jest.fn().mockResolvedValue([{ id: 1, nombre: 'foto.png' }]) },
      };
      const controller = new EscaladorController(useCases);
      const req = {};
      const res = createResMock();

      await controller.obtenerFotosPerfil(req, res, () => {});

      expect(useCases.obtenerFotosPerfil.execute).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual([{ id: 1, nombre: 'foto.png' }]);
    });

    it('obtenerFotoPerfil devuelve el archivo solicitado', async () => {
      const useCases = {
        obtenerFotoPerfil: {
          execute: jest.fn().mockResolvedValue({ id: 4, urlFoto: '/uploads/fotos_perfil/foto.png' }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = { params: { id: 4 } };
      const res = createResMock();

      jest.spyOn(fs, 'access').mockResolvedValue();

      await controller.obtenerFotoPerfil(req, res, () => {});

      expect(useCases.obtenerFotoPerfil.execute).toHaveBeenCalledWith(4);
      expect(res.sentFile).toBe(path.resolve(process.cwd(), 'uploads', 'fotos_perfil', 'foto.png'));
    });

    it('obtenerFotoPerfil responde 404 si no existe', async () => {
      const useCases = {
        obtenerFotoPerfil: { execute: jest.fn().mockResolvedValue(null) },
      };
      const controller = new EscaladorController(useCases);
      const req = { params: { id: 4 } };
      const res = createResMock();
      const next = jest.fn();

      await controller.obtenerFotoPerfil(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Foto de perfil con ID 4 no encontrada');
      expect(error.code).toBe('FOTO_PERFIL_NOT_FOUND');
    });

    it('obtenerFotoPerfil responde 404 si el archivo no existe', async () => {
      const useCases = {
        obtenerFotoPerfil: {
          execute: jest.fn().mockResolvedValue({ id: 4, urlFoto: '/uploads/fotos_perfil/foto.png' }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = { params: { id: 4 } };
      const res = createResMock();
      const next = jest.fn();

      const accessError = new Error('no file');
      accessError.code = 'ENOENT';
      jest.spyOn(fs, 'access').mockRejectedValue(accessError);

      await controller.obtenerFotoPerfil(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = next.mock.calls[0][0];
      expect(error.code).toBe('FOTO_PERFIL_NOT_FOUND');
    });

    it('actualizarFotoPerfil responde 200 con el resultado del caso de uso', async () => {
      const useCases = {
        actualizarFotoPerfil: { execute: jest.fn().mockResolvedValue({ fotoUrl: '/uploads/fotos_perfil/foto.png' }) },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        user: { apodo: 'Tester' },
        body: { idFotoPerfil: 1 },
      };
      const res = createResMock();

      await controller.actualizarFotoPerfil(req, res, () => {});

      expect(useCases.actualizarFotoPerfil.execute).toHaveBeenCalledWith({
        apodo: 'Tester',
        idFotoPerfil: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ fotoUrl: '/uploads/fotos_perfil/foto.png' });
    });
  });

  describe('estadisticas', () => {
    it('obtenerResumenEstadisticas responde 200 con datos del escalador autenticado', async () => {
      const useCases = {
        obtenerResumenEstadisticas: {
          execute: jest.fn().mockResolvedValue({ totalRutas: 9, totalFlash: 3 }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = { user: { apodo: 'Tester' } };
      const res = createResMock();

      await controller.obtenerResumenEstadisticas(req, res, () => {});

      expect(useCases.obtenerResumenEstadisticas.execute).toHaveBeenCalledWith({
        apodo: 'Tester',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ totalRutas: 9, totalFlash: 3 });
    });

    it('obtenerTiposEstadisticasPublico responde 200 con datos del apodo en params', async () => {
      const useCases = {
        obtenerTiposEstadisticas: {
          execute: jest.fn().mockResolvedValue({ totalBloques: 4, totalVias: 2 }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = { params: { apodo: 'PerfilPublico' } };
      const res = createResMock();

      await controller.obtenerTiposEstadisticasPublico(req, res, () => {});

      expect(useCases.obtenerTiposEstadisticas.execute).toHaveBeenCalledWith({
        apodo: 'PerfilPublico',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ totalBloques: 4, totalVias: 2 });
    });

    it('obtenerActividadMensual usa query params y responde 200', async () => {
      const useCases = {
        obtenerActividadMensual: {
          execute: jest.fn().mockResolvedValue({
            year: 2026,
            month: 4,
            actividadMensual: [{ dia: 1, rutas: 2 }],
          }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        user: { apodo: 'Tester' },
        query: { year: '2026', month: '4' },
      };
      const res = createResMock();

      await controller.obtenerActividadMensual(req, res, () => {});

      expect(useCases.obtenerActividadMensual.execute).toHaveBeenCalledWith({
        apodo: 'Tester',
        year: 2026,
        month: 4,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        year: 2026,
        month: 4,
        actividadMensual: [{ dia: 1, rutas: 2 }],
      });
    });

    it('obtenerResumenEstadisticasRocodromo responde 200 con datos filtrados', async () => {
      const useCases = {
        obtenerResumenEstadisticasRocodromo: {
          execute: jest.fn().mockResolvedValue({
            totalRutas: 4,
            totalFlash: 1,
            totalRutasActivasRocodromo: 11,
          }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        user: { apodo: 'Tester' },
        params: { id: '7' },
      };
      const res = createResMock();

      await controller.obtenerResumenEstadisticasRocodromo(req, res, () => {});

      expect(useCases.obtenerResumenEstadisticasRocodromo.execute).toHaveBeenCalledWith({
        apodo: 'Tester',
        idRocodromo: 7,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        totalRutas: 4,
        totalFlash: 1,
        totalRutasActivasRocodromo: 11,
      });
    });

    it('obtenerTiposEstadisticasRocodromo responde 200 con datos filtrados', async () => {
      const useCases = {
        obtenerTiposEstadisticasRocodromo: {
          execute: jest.fn().mockResolvedValue({ totalBloques: 3, totalVias: 1 }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        user: { apodo: 'Tester' },
        params: { id: '7' },
      };
      const res = createResMock();

      await controller.obtenerTiposEstadisticasRocodromo(req, res, () => {});

      expect(useCases.obtenerTiposEstadisticasRocodromo.execute).toHaveBeenCalledWith({
        apodo: 'Tester',
        idRocodromo: 7,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ totalBloques: 3, totalVias: 1 });
    });

    it('obtenerActividadMensualRocodromo usa params y query, responde 200', async () => {
      const useCases = {
        obtenerActividadMensualRocodromo: {
          execute: jest.fn().mockResolvedValue({
            year: 2026,
            month: 4,
            actividadMensual: [{ dia: 6, rutas: 2 }],
          }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        user: { apodo: 'Tester' },
        params: { id: '7' },
        query: { year: '2026', month: '4' },
      };
      const res = createResMock();

      await controller.obtenerActividadMensualRocodromo(req, res, () => {});

      expect(useCases.obtenerActividadMensualRocodromo.execute).toHaveBeenCalledWith({
        apodo: 'Tester',
        idRocodromo: 7,
        year: 2026,
        month: 4,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        year: 2026,
        month: 4,
        actividadMensual: [{ dia: 6, rutas: 2 }],
      });
    });

    it('obtenerDificultadMaximaRocodromo responde 200 con maximas por tipo', async () => {
      const useCases = {
        obtenerDificultadMaximaRocodromo: {
          execute: jest.fn().mockResolvedValue({
            maxDificultadBloque: 'V6',
            maxDificultadVia: '7a',
          }),
        },
      };
      const controller = new EscaladorController(useCases);
      const req = {
        user: { apodo: 'Tester' },
        params: { id: '7' },
      };
      const res = createResMock();

      await controller.obtenerDificultadMaximaRocodromo(req, res, () => {});

      expect(useCases.obtenerDificultadMaximaRocodromo.execute).toHaveBeenCalledWith({
        apodo: 'Tester',
        idRocodromo: 7,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({
        maxDificultadBloque: 'V6',
        maxDificultadVia: '7a',
      });
    });
  });
});
