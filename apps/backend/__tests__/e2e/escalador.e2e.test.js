import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';
import tokenService from '../../src/infrastructure/security/tokenService.js';

const db = await dbPromise;

describe('E2E: Escalador', () => {
  const FIXTURE_CORREOS = [
    'e2e@test.com',
    'suscripcion@test.com',
    'validacion@test.com',
    'descripcion@test.com',
    'cambio-apodo@test.com',
    'sin-suscripcion@test.com',
  ];
  const FIXTURE_ROCODROMO_NOMBRE = 'Boulder Test E2E';
  const escaladorTest = {
    correo: 'e2e@test.com',
    contrasena: 'Password123',
    apodo: 'E2ETester',
  };

  let escaladorSuscripcion;
  let rocodromoTest;
  let tokenSuscripcion;
  // eslint-disable-next-line no-unused-vars
  let escaladorValidacion;
  let escaladorDescripcion;
  let escaladorCambioApodo;
  let tokenDescripcion;
  let tokenCambioApodo;

  async function limpiarFixturesEscaladorE2E() {
    const rocodromos = await db.Rocodromo.findAll({
      where: { nombre: FIXTURE_ROCODROMO_NOMBRE },
      attributes: ['id'],
    });
    const idsRocodromos = rocodromos.map((r) => r.id);

    const escaladores = await db.Escalador.findAll({
      where: { correo: FIXTURE_CORREOS },
      attributes: ['id'],
    });
    const idsEscaladores = escaladores.map((e) => e.id);

    if (idsEscaladores.length > 0) {
      await db.Suscripcion.destroy({ where: { idEscalador: idsEscaladores } });
    }
    if (idsRocodromos.length > 0) {
      await db.Suscripcion.destroy({ where: { idRocodromo: idsRocodromos } });
    }

    await db.Escalador.destroy({ where: { correo: FIXTURE_CORREOS } });
    await db.Rocodromo.destroy({ where: { nombre: FIXTURE_ROCODROMO_NOMBRE } });
  }

  beforeAll(async () => {
    await limpiarFixturesEscaladorE2E();

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

     
    escaladorValidacion = await db.Escalador.create({
      correo: 'validacion@test.com',
      contrasena: 'hashedPassword123',
      apodo: 'ValidarApodo',
    });

    escaladorDescripcion = await db.Escalador.create({
      correo: 'descripcion@test.com',
      contrasena: 'hashedPassword123',
      apodo: 'DescripcionTester',
      descripcion: null,
    });

    tokenDescripcion = tokenService.crear({
      correo: escaladorDescripcion.correo,
      apodo: escaladorDescripcion.apodo,
    });

    escaladorCambioApodo = await db.Escalador.create({
      correo: 'cambio-apodo@test.com',
      contrasena: 'hashedPassword123',
      apodo: 'ApodoOriginal',
    });

    tokenCambioApodo = tokenService.crear({
      correo: escaladorCambioApodo.correo,
      apodo: escaladorCambioApodo.apodo,
    });
  });

  afterAll(async () => {
    await limpiarFixturesEscaladorE2E();
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

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
      expect(response.body.error).toContain('Acceso denegado');
    });

    it('debería retornar 404 si el rocódromo no existe', async () => {
      const fakeIdRocodromo = 999999;
      
      const response = await request(app)
        .post('/escaladores/suscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: fakeIdRocodromo })
        .expect(404);

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

    it('debería retornar 409 si el escalador ya está suscrito al rocódromo', async () => {
      // Intentar suscribirse nuevamente al mismo rocódromo
      const response = await request(app)
        .post('/escaladores/suscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: rocodromoTest.id })
        .expect(409);

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

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
      expect(response.body.error).toContain('Acceso denegado');
    });

    it('debería retornar 404 si el rocódromo no existe', async () => {
      const fakeIdRocodromo = 999999;
      
      const response = await request(app)
        .post('/escaladores/desuscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: fakeIdRocodromo })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('no encontrado');
    });

    it('debería retornar 404 si el escalador no está suscrito al rocódromo', async () => {
      // El escalador ya fue desuscrito en el primer test, intentar desuscribirse nuevamente
      const response = await request(app)
        .post('/escaladores/desuscribirse')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .send({ idRocodromo: rocodromoTest.id })
        .expect(404);

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

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
      expect(response.body.error).toContain('Acceso denegado');
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

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
      expect(response.body.error).toContain('Acceso denegado');
    });
  });

  describe('Validar apodo', () => {
    it('deberia devolver disponible false si el apodo ya existe (case-insensitive)', async () => {
      const response = await request(app)
        .get('/escaladores/validarApodo/validarapodo')
        .expect(200);

      expect(response.body).toEqual({ disponible: false });
    });

    it('deberia devolver disponible true si el apodo no existe', async () => {
      const response = await request(app)
        .get('/escaladores/validarApodo/ApodoNuevo123')
        .expect(200);

      expect(response.body).toEqual({ disponible: true });
    });

    it('deberia retornar 422 con apodo invalido', async () => {
      const response = await request(app)
        .get('/escaladores/validarApodo/!!!invalid!!!')
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('apodo');
    });
  });

  describe('Validar correo', () => {
    it('deberia devolver disponible false si el correo ya existe', async () => {
      const correo = encodeURIComponent('validacion@test.com');
      const response = await request(app)
        .get(`/escaladores/validarCorreo/${correo}`)
        .expect(200);

      expect(response.body).toEqual({ disponible: false });
    });

    it('deberia devolver disponible true si el correo no existe', async () => {
      const correo = encodeURIComponent('nuevo_correo@test.com');
      const response = await request(app)
        .get(`/escaladores/validarCorreo/${correo}`)
        .expect(200);

      expect(response.body).toEqual({ disponible: true });
    });

    it('deberia retornar 422 con correo invalido', async () => {
      const response = await request(app)
        .get('/escaladores/validarCorreo/no-es-email')
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('correo');
    });
  });

  describe('Actualizar descripcion', () => {
    it('deberia actualizar la descripcion del escalador autenticado', async () => {
      const response = await request(app)
        .put('/escaladores/actualizarDescripcion')
        .set('Authorization', `Bearer ${tokenDescripcion}`)
        .send({ descripcion: 'Nueva descripcion de perfil' })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('correo', escaladorDescripcion.correo);
      expect(response.body).toHaveProperty('apodo', escaladorDescripcion.apodo);
      expect(response.body).toHaveProperty('descripcion', 'Nueva descripcion de perfil');

      const escaladorActualizado = await db.Escalador.findByPk(escaladorDescripcion.id);
      expect(escaladorActualizado.descripcion).toBe('Nueva descripcion de perfil');
    });

    it('deberia retornar 401 si no se proporciona token', async () => {
      const response = await request(app)
        .put('/escaladores/actualizarDescripcion')
        .send({ descripcion: 'Texto' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
    });

    it('deberia retornar 422 si la descripcion es muy larga', async () => {
      const response = await request(app)
        .put('/escaladores/actualizarDescripcion')
        .set('Authorization', `Bearer ${tokenDescripcion}`)
        .send({ descripcion: 'a'.repeat(256) })
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('descripcion');
    });
  });

  describe('Cambiar apodo', () => {
    it('deberia actualizar el apodo y devolver un nuevo token', async () => {
      const response = await request(app)
        .put('/escaladores/cambiarApodo')
        .set('Authorization', `Bearer ${tokenCambioApodo}`)
        .send({ apodo: 'ApodoActualizado' })
        .expect(200);

      expect(response.body).toHaveProperty('apodo', 'ApodoActualizado');
      expect(response.body).toHaveProperty('correo', escaladorCambioApodo.correo);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');

      const decoded = tokenService.verificar(response.body.token);
      expect(decoded.apodo).toBe('ApodoActualizado');

      const escaladorActualizado = await db.Escalador.findOne({
        where: { correo: escaladorCambioApodo.correo },
      });
      expect(escaladorActualizado.apodo).toBe('ApodoActualizado');
    });

    it('deberia retornar 422 con apodo invalido', async () => {
      const response = await request(app)
        .put('/escaladores/cambiarApodo')
        .set('Authorization', `Bearer ${tokenCambioApodo}`)
        .send({ apodo: '!!!invalid!!!' })
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('apodo');
    });

    it('deberia retornar 401 si no se proporciona token', async () => {
      const response = await request(app)
        .put('/escaladores/cambiarApodo')
        .send({ apodo: 'OtroApodo' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
    });
  });
});
