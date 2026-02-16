import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';
import tokenService from '../../src/infrastructure/security/tokenService.js';

const db = await dbPromise;

describe('E2E: Escalador', () => {
  const escaladorTest = {
    correo: 'e2e@test.com',
    contrasena: 'Password123',
    apodo: 'E2ETester',
  };

  let escaladorSuscripcion;
  let rocodromoTest;
  let tokenSuscripcion;

  beforeAll(async () => {
    // Crear escalador de prueba para suscripción
    escaladorSuscripcion = await db.Escalador.create({
      correo: 'suscripcion@test.com',
      contrasena: 'hashedPassword123',
      apodo: 'SuscripcionTester',
    });

    // Crear rocódromo de prueba
    rocodromoTest = await db.Rocodromo.create({
      nombre: 'Boulder Test E2E',
      ubicacion: 'Test City',
    });

    // Generar token de autenticación
    tokenSuscripcion = tokenService.crear({ 
      correo: escaladorSuscripcion.correo, 
      apodo: escaladorSuscripcion.apodo 
    });
  });

  afterAll(async () => {
    // Limpiar registros
    await db.Escalador.destroy({ where: { correo: escaladorTest.correo } });
    
    // Limpiar asociaciones y registros de suscripción
    if (escaladorSuscripcion && rocodromoTest) {
      try {
        await escaladorSuscripcion.removeRocodromo(rocodromoTest.id);
      } catch (error) {
        // Ignorar si ya fue eliminado
        error;
      }
    }
    if (escaladorSuscripcion) await escaladorSuscripcion.destroy();
    if (rocodromoTest) await rocodromoTest.destroy();
    
    await db.sequelize.close();
  });

  describe('Crear escalador', () => {
    it('debería crear un escalador y devolver un token', async () => {
      const response = await request(app)
        .post('/escaladores/create')
        .send(escaladorTest)
        .expect(201);

      expect(response.body).toHaveProperty('token'); // Esperamos un objeto con token
      expect(response.body.token).toEqual(expect.any(String)); // El token es un string JWT

      const escaladorGuardado = await db.Escalador.findOne({ where: { correo: escaladorTest.correo } });
      expect(escaladorGuardado).not.toBeNull();
      expect(escaladorGuardado.correo).toBe(escaladorTest.correo);
      expect(escaladorGuardado.contrasena).not.toBe(escaladorTest.contrasena);
      expect(escaladorGuardado.apodo).toBe(escaladorTest.apodo);
    });

    it('debería manejar errores al crear un escalador con datos inválidos', async () => {
      const response = await request(app)
        .post('/escaladores/create')
        .send({ correo: 'test@test.com', contrasena: '123', apodo: '!!!invalid!!!' })
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      expect(Array.isArray(response.body.errors)).toBe(true);
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('apodo');
    });
  });

  describe('Suscribirse a rocódromo', () => {
    it('debería suscribir un escalador a un rocódromo exitosamente', async () => {
      const response = await request(app)
        .post('/escaladores/suscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: rocodromoTest.id })
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('suscrito al rocódromo');
      expect(response.body.mensaje).toContain(escaladorSuscripcion.apodo);
      expect(response.body.mensaje).toContain(rocodromoTest.nombre);

      // Verificar que la suscripción se guardó en la base de datos
      const escaladorActualizado = await db.Escalador.findByPk(escaladorSuscripcion.id);
      const rocodromos = await escaladorActualizado.getRocodromos();
      
      expect(rocodromos).toHaveLength(1);
      expect(rocodromos[0].id).toBe(rocodromoTest.id);
    });

    it('debería retornar 401 si no se proporciona token de autenticación', async () => {
      const response = await request(app)
        .post('/escaladores/suscribirse')
        .send({ idRocodromo: rocodromoTest.id })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Acceso denegado');
    });

    it('debería retornar 500 si el rocódromo no existe', async () => {
      const fakeIdRocodromo = 999999;
      
      const response = await request(app)
        .post('/escaladores/suscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: fakeIdRocodromo })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('no encontrado');
    });

    it('debería manejar errores al suscribirse con datos inválidos', async () => {
      const response = await request(app)
        .post('/escaladores/suscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: 'invalid' })
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
    });

    it('debería retornar 500 si el escalador ya está suscrito al rocódromo', async () => {
      // Intentar suscribirse nuevamente al mismo rocódromo
      const response = await request(app)
        .post('/escaladores/suscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: rocodromoTest.id })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ya está suscrito');
    });
  });

  describe('Desuscribirse de rocódromo', () => {
    it('debería desuscribir un escalador de un rocódromo exitosamente', async () => {
      const response = await request(app)
        .post('/escaladores/desuscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: rocodromoTest.id })
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('desuscrito del rocódromo');
      expect(response.body.mensaje).toContain(escaladorSuscripcion.apodo);
      expect(response.body.mensaje).toContain(rocodromoTest.nombre);

      // Verificar que la desuscripción se eliminó de la base de datos
      const escaladorActualizado = await db.Escalador.findByPk(escaladorSuscripcion.id);
      const rocodromos = await escaladorActualizado.getRocodromos();
      
      expect(rocodromos).toHaveLength(0);
    });

    it('debería retornar 401 si no se proporciona token de autenticación', async () => {
      const response = await request(app)
        .post('/escaladores/desuscribirse')
        .send({ idRocodromo: rocodromoTest.id })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Acceso denegado');
    });

    it('debería retornar 500 si el rocódromo no existe', async () => {
      const fakeIdRocodromo = 999999;
      
      const response = await request(app)
        .post('/escaladores/desuscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: fakeIdRocodromo })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('no encontrado');
    });

    it('debería retornar 500 si el escalador no está suscrito al rocódromo', async () => {
      // El escalador ya fue desuscrito en el primer test, intentar desuscribirse nuevamente
      const response = await request(app)
        .post('/escaladores/desuscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: rocodromoTest.id })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('no está suscrito');
    });

    it('debería manejar errores al desuscribirse con datos inválidos', async () => {
      const response = await request(app)
        .post('/escaladores/desuscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: 'invalid' })
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
    });
  });

  describe('Obtener perfil del escalador', () => {
    it('debería obtener el perfil del escalador autenticado', async () => {
      const response = await request(app)
        .get('/escaladores/perfil')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('correo');
      expect(response.body).toHaveProperty('apodo');
      expect(response.body.correo).toBe(escaladorSuscripcion.correo);
      expect(response.body.apodo).toBe(escaladorSuscripcion.apodo);
    });

    it('debería retornar 401 si no se proporciona token de autenticación', async () => {
      const response = await request(app)
        .get('/escaladores/perfil')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Acceso denegado');
    });
  });

  describe('Obtener rocodromos suscritos', () => {
    beforeAll(async () => {
      // Suscribir el escalador a un rocódromo
      await escaladorSuscripcion.addRocodromo(rocodromoTest);
    });

    it('debería obtener los rocodromos suscritos del escalador', async () => {
      const response = await request(app)
        .get('/escaladores/mis-rocodromos')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      
      const rocodromoIds = response.body.map(r => r.id);
      expect(rocodromoIds).toContain(rocodromoTest.id);
      
      const rocodromoEnRespuesta = response.body.find(r => r.id === rocodromoTest.id);
      expect(rocodromoEnRespuesta).toHaveProperty('nombre');
      expect(rocodromoEnRespuesta).toHaveProperty('ubicacion');
    });

    it('debería retornar un array vacío si el escalador no tiene suscripciones', async () => {
      // Crear nuevo escalador sin suscripciones
      const escaladorSinSuscripcion = await db.Escalador.create({
        correo: 'sin-suscripcion@test.com',
        contrasena: 'hashedPassword123',
        apodo: 'SinSuscripcionTester',
      });

      const tokenSinSuscripcion = tokenService.crear({
        correo: escaladorSinSuscripcion.correo,
        apodo: escaladorSinSuscripcion.apodo,
      });

      const response = await request(app)
        .get('/escaladores/mis-rocodromos')
        .set('Authorization', `Bearer ${tokenSinSuscripcion}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);

      // Limpiar
      await escaladorSinSuscripcion.destroy();
    });

    it('debería retornar 401 si no se proporciona token de autenticación', async () => {
      const response = await request(app)
        .get('/escaladores/mis-rocodromos')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Acceso denegado');
    });
  });
});
