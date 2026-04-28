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
  const FIXTURE_ROCODROMO_NOMBRES = [
    'Boulder Test E2E',
    'Stats Roco E2E',
    'Stats Roco Sin Datos E2E',
  ];
  const escaladorTest = {
    correo: 'e2e@test.com',
    contrasena: 'Password123',
    apodo: 'E2ETester',
  };

  let escaladorSuscripcion;
  let rocodromoTest;
  let rocodromoStats;
  let rocodromoStatsSinDatos;
  let tokenSuscripcion;
  // eslint-disable-next-line no-unused-vars
  let escaladorValidacion;
  let escaladorDescripcion;
  let escaladorCambioApodo;
  let tokenDescripcion;
  let tokenCambioApodo;

  async function limpiarFixturesEscaladorE2E() {
    const rocodromos = await db.Rocodromo.findAll({
      where: { nombre: FIXTURE_ROCODROMO_NOMBRES },
      attributes: ['id'],
    });
    const idsRocodromos = rocodromos.map((r) => r.id);

    const escaladores = await db.Escalador.findAll({
      where: { correo: FIXTURE_CORREOS },
      attributes: ['id'],
    });
    const idsEscaladores = escaladores.map((e) => e.id);

    const zonas = await db.Zona.findAll({
      where: { idRoco: idsRocodromos },
      attributes: ['id'],
    });
    const idsZonas = zonas.map((z) => z.id);

    const pistas = await db.Pista.findAll({
      where: { idZona: idsZonas },
      attributes: ['id'],
    });
    const idsPistas = pistas.map((p) => p.id);

    if (idsPistas.length > 0) {
      await db.EscalaPista.destroy({ where: { idPista: idsPistas } });
    }
    if (idsEscaladores.length > 0) {
      await db.EscalaPista.destroy({ where: { idEscalador: idsEscaladores } });
    }
    if (idsZonas.length > 0) {
      await db.Pista.destroy({ where: { idZona: idsZonas } });
      await db.Zona.destroy({ where: { id: idsZonas } });
    }

    if (idsEscaladores.length > 0) {
      await db.Suscripcion.destroy({ where: { idEscalador: idsEscaladores } });
    }
    if (idsRocodromos.length > 0) {
      await db.Suscripcion.destroy({ where: { idRocodromo: idsRocodromos } });
    }

    await db.Escalador.destroy({ where: { correo: FIXTURE_CORREOS } });
    await db.Rocodromo.destroy({
      where: { nombre: FIXTURE_ROCODROMO_NOMBRES },
    });
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

    rocodromoStats = await db.Rocodromo.create({
      nombre: 'Stats Roco E2E',
      ubicacion: 'Stats City 1',
    });

    rocodromoStatsSinDatos = await db.Rocodromo.create({
      nombre: 'Stats Roco Sin Datos E2E',
      ubicacion: 'Stats City 2',
    });

    // Generar token de autenticación
    tokenSuscripcion = tokenService.crear({
      correo: escaladorSuscripcion.correo,
      apodo: escaladorSuscripcion.apodo,
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

    const zonaStats = await db.Zona.create({
      idRoco: rocodromoStats.id,
      nombre: 'Zona Stats',
    });

    const zonaOtra = await db.Zona.create({
      idRoco: rocodromoTest.id,
      nombre: 'Zona Otra',
    });

    await db.Zona.create({
      idRoco: rocodromoStatsSinDatos.id,
      nombre: 'Zona Vacia',
    });

    const pistaFlashStats = await db.Pista.create({
      idZona: zonaStats.id,
      nombre: 'Boulder Stats',
      dificultad: 'V4',
      tipo: 'boulder',
    });
    const pistaCompletadaStats = await db.Pista.create({
      idZona: zonaStats.id,
      nombre: 'Via Stats',
      dificultad: '6b',
      tipo: 'via',
    });
    const pistaProyectoStats = await db.Pista.create({
      idZona: zonaStats.id,
      nombre: 'Proyecto Stats',
      dificultad: '7a',
      tipo: 'via',
    });
    const pistaInactivaCompletadaStats = await db.Pista.create({
      idZona: zonaStats.id,
      nombre: 'Via Inactiva Stats',
      dificultad: '7b',
      tipo: 'via',
      activo: false,
    });
    const pistaOtra = await db.Pista.create({
      idZona: zonaOtra.id,
      nombre: 'Fuera Roco Stats',
      dificultad: 'V2',
      tipo: 'boulder',
    });

    await db.EscalaPista.create({
      idPista: pistaFlashStats.id,
      idEscalador: escaladorSuscripcion.id,
      estado: 'flash',
      fechaCompletado: new Date('2026-04-03T10:00:00.000Z'),
    });
    await db.EscalaPista.create({
      idPista: pistaCompletadaStats.id,
      idEscalador: escaladorSuscripcion.id,
      estado: 'completado',
      fechaCompletado: new Date('2026-04-07T10:00:00.000Z'),
    });
    await db.EscalaPista.create({
      idPista: pistaProyectoStats.id,
      idEscalador: escaladorSuscripcion.id,
      estado: 'proyecto',
      fechaCompletado: null,
    });
    await db.EscalaPista.create({
      idPista: pistaInactivaCompletadaStats.id,
      idEscalador: escaladorSuscripcion.id,
      estado: 'completado',
      fechaCompletado: new Date('2025-11-14T10:00:00.000Z'),
    });
    await db.EscalaPista.create({
      idPista: pistaOtra.id,
      idEscalador: escaladorSuscripcion.id,
      estado: 'flash',
      fechaCompletado: new Date('2026-04-09T10:00:00.000Z'),
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

      const escaladorGuardado = await db.Escalador.findOne({
        where: { correo: escaladorTest.correo },
      });
      expect(escaladorGuardado).not.toBeNull();
      expect(escaladorGuardado.correo).toBe(escaladorTest.correo);
      expect(escaladorGuardado.contrasena).not.toBe(escaladorTest.contrasena);
      expect(escaladorGuardado.apodo).toBe(escaladorTest.apodo);
    });

    it('debería manejar errores al crear un escalador con datos inválidos', async () => {
      const response = await request(app)
        .post('/escaladores/create')
        .send({
          correo: 'test@test.com',
          contrasena: '123',
          apodo: '!!!invalid!!!',
        })
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
      const escaladorActualizado = await db.Escalador.findByPk(
        escaladorSuscripcion.id
      );
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
      const escaladorActualizado = await db.Escalador.findByPk(
        escaladorSuscripcion.id
      );
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

  describe('Estadisticas por rocodromo del escalador', () => {
    it('deberia obtener resumen filtrado por rocodromo', async () => {
      const response = await request(app)
        .get(`/escaladores/stats/rocodromo/${rocodromoStats.id}/resumen`)
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(200);

      expect(response.body).toEqual({
        totalRutas: 2,
        totalFlash: 1,
        totalCompletado: 1,
        totalProyecto: 1,
        totalRutasActivasRocodromo: 3,
        porcentajeFlash: expect.any(Number),
      });
    });

    it('deberia obtener tipos filtrados por rocodromo', async () => {
      const response = await request(app)
        .get(`/escaladores/stats/rocodromo/${rocodromoStats.id}/tipos`)
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(200);

      expect(response.body.totalBloques).toBe(1);
      expect(response.body.totalVias).toBe(1);
      expect(response.body.porcentajeBloques).toBeCloseTo(50, 8);
      expect(response.body.porcentajeVias).toBeCloseTo(50, 8);
      expect(response.body.favoritaTexto).toBe('Bloque');
    });

    it('deberia obtener dificultad maxima por tipo incluyendo pistas inactivas', async () => {
      const response = await request(app)
        .get(
          `/escaladores/stats/rocodromo/${rocodromoStats.id}/dificultad-maxima`
        )
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(200);

      expect(response.body).toEqual({
        maxDificultadBloque: 'V4',
        maxDificultadVia: '7b',
      });
    });

    it('deberia obtener actividad mensual filtrada por rocodromo', async () => {
      const response = await request(app)
        .get(
          `/escaladores/stats/rocodromo/${rocodromoStats.id}/actividad-mensual?year=2026&month=4`
        )
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(200);

      expect(response.body).toHaveProperty('year', 2026);
      expect(response.body).toHaveProperty('month', 4);
      expect(response.body.actividadMensual).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ dia: 3, rutas: 1 }),
          expect.objectContaining({ dia: 7, rutas: 1 }),
        ])
      );
      expect(
        response.body.actividadMensual.find((item) => item.dia === 9)
      ).toBeUndefined();
    });

    it('deberia retornar ceros si el rocodromo no tiene datos del escalador', async () => {
      const response = await request(app)
        .get(
          `/escaladores/stats/rocodromo/${rocodromoStatsSinDatos.id}/resumen`
        )
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(200);

      expect(response.body).toEqual({
        totalRutas: 0,
        totalFlash: 0,
        totalCompletado: 0,
        totalProyecto: 0,
        totalRutasActivasRocodromo: 0,
        porcentajeFlash: 0,
      });
    });

    it('deberia retornar 401 sin token', async () => {
      const response = await request(app)
        .get(`/escaladores/stats/rocodromo/${rocodromoStats.id}/resumen`)
        .expect(401);

      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
    });

    it('deberia retornar 404 si el rocodromo no existe', async () => {
      const response = await request(app)
        .get('/escaladores/stats/rocodromo/999999/resumen')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 'ROCODROMO_NOT_FOUND');
    });

    it('deberia retornar 422 con id invalido', async () => {
      const response = await request(app)
        .get('/escaladores/stats/rocodromo/no-valido/resumen')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('id');
    });

    it('deberia retornar 401 sin token en dificultad maxima', async () => {
      const response = await request(app)
        .get(
          `/escaladores/stats/rocodromo/${rocodromoStats.id}/dificultad-maxima`
        )
        .expect(401);

      expect(response.body).toHaveProperty('code', 'AUTH_TOKEN_MISSING');
    });

    it('deberia retornar 404 en dificultad maxima si el rocodromo no existe', async () => {
      const response = await request(app)
        .get('/escaladores/stats/rocodromo/999999/dificultad-maxima')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 'ROCODROMO_NOT_FOUND');
    });

    it('deberia retornar 422 en dificultad maxima con id invalido', async () => {
      const response = await request(app)
        .get('/escaladores/stats/rocodromo/no-valido/dificultad-maxima')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('id');
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

      const rocodromoIds = response.body.map((r) => r.id);
      expect(rocodromoIds).toContain(rocodromoTest.id);

      const rocodromoEnRespuesta = response.body.find(
        (r) => r.id === rocodromoTest.id
      );
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
      expect(response.body).toHaveProperty(
        'correo',
        escaladorDescripcion.correo
      );
      expect(response.body).toHaveProperty('apodo', escaladorDescripcion.apodo);
      expect(response.body).toHaveProperty(
        'descripcion',
        'Nueva descripcion de perfil'
      );

      const escaladorActualizado = await db.Escalador.findByPk(
        escaladorDescripcion.id
      );
      expect(escaladorActualizado.descripcion).toBe(
        'Nueva descripcion de perfil'
      );
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
      expect(response.body).toHaveProperty(
        'correo',
        escaladorCambioApodo.correo
      );
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

  describe('Buscar escaladores', () => {
    it('debería encontrar escaladores por coincidencia de apodo excluyendo al que busca', async () => {
      // E2ETester fue creado en otro test, y ApodoActualizado también
      const response = await request(app)
        .get('/escaladores/buscar?q=test')
        .set('Authorization', `Bearer ${tokenSuscripcion}`) // SuscripcionTester busca 'test'
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // SuscripcionTester -> test
      // E2ETester -> test
      // ApodoOriginal ya cambió
      expect(response.body.length).toBeGreaterThan(0);
      expect(
        response.body.some(
          (e) =>
            e.apodo === 'E2ETester' ||
            e.apodo === 'SuscripcionTester' ||
            e.apodo === 'DescripcionTester'
        )
      ).toBe(true);

      // Verify that tokenSuscripcion (SuscripcionTester) is not in the list if the search matched him
      const foundMe = response.body.find(
        (e) => e.apodo === 'SuscripcionTester'
      );
      expect(foundMe).toBeUndefined();
    });

    it('debería retornar 422 si la búsqueda tiene menos de 2 caracteres', async () => {
      const response = await request(app)
        .get('/escaladores/buscar?q=a')
        .set('Authorization', `Bearer ${tokenSuscripcion}`)
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('q');
    });
  });
});
