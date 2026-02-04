import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';
import tokenService from '../../src/infrastructure/security/tokenService.js';

const db = await dbPromise;

describe('E2E: Pistas', () => {
  let rocodromo;
  let zona;

  beforeAll(async () => {
    rocodromo = await db.Rocodromo.create({
      nombre: 'Roco Test',
      ubicacion: 'Test Location',
    });
    zona = await db.Zona.create({
      idRoco: rocodromo.id,
      tipo: 'Bloque',
    });
  });

  afterAll(async () => {
    if (zona) await zona.destroy();
    if (rocodromo) await rocodromo.destroy();
    await db.sequelize.close();
  });

  describe('E2E: Crear pista', () => {
    let pistaTest;
    let token;

    beforeEach(() => {
      pistaTest = {
        idZona: zona.id,
        nombre: 'E2E Test',
        dificultad: '6a',
      };
      token = tokenService.crear({ id: 1, correo: 'test@e2e.com', role: 'admin' });
    });

    afterAll(async () => {
      await db.Pista.destroy({ where: { nombre: 'E2E Test' } });
    });

    it('debería crear una pista y devolverla', async () => {
      const response = await request(app)
        .post('/pistas/create')
        .set('Authorization', `Bearer ${token}`)
        .send(pistaTest)
        .expect(201);

      expect(response.body).toMatchObject(pistaTest);
      expect(response.body.id).toBeDefined();

      const pistaGuardada = await db.Pista.findByPk(response.body.id);
      expect(pistaGuardada).not.toBeNull();
      expect(pistaGuardada.idZona).toBe(pistaTest.idZona);
      expect(pistaGuardada.nombre).toBe(pistaTest.nombre);
      expect(pistaGuardada.dificultad).toBe(pistaTest.dificultad);
    });

    it('debería manejar errores al crear una pista con datos inválidos', async () => {
      const response = await request(app)
        .post('/pistas/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ idZona: zona.id, nombre: '', dificultad: '6a' })
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      expect(Array.isArray(response.body.errors)).toBe(true);
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('nombre');
    });

    it('debería fallar al crear una pista sin token', async () => {
      const response = await request(app)
        .post('/pistas/create')
        .send(pistaTest)
        .expect(401);

      expect(response.body.message).toMatch(/Acceso denegado/);
    });

    it('debería fallar al crear una pista con token inválido', async () => {
      const response = await request(app)
        .post('/pistas/create')
        .set('Authorization', 'Bearer token_invalido_123')
        .send(pistaTest)
        .expect(401);

      expect(response.body.message).toMatch(/Token inválido/);
    });

    it('debería fallar con formato de cabecera inválido (No Bearer)', async () => {
      const response = await request(app)
        .post('/pistas/create')
        .set('Authorization', 'Basic token123')
        .send(pistaTest)
        .expect(400);

      expect(response.body.message).toMatch(/Formato inválido/);
    });

    it('debería fallar si la cabecera tiene Bearer pero no token', async () => {
      // Al enviar 'Bearer ', es posible que se haga trim y quede 'Bearer', fallando el check de formato.
      // O que se mantenga el espacio y falle el check de token vacío.
      const response = await request(app)
        .post('/pistas/create')
        .set('Authorization', 'Bearer ')
        .send(pistaTest)
        .expect(400);

      expect(response.body.message).toMatch(/Formato inválido|Token no encontrado/);
    });

    it('debería fallar con token expirado', async () => {
      const secret = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
      // Creamos un token que expiró hace 1 segundo
      const expiredToken = jwt.sign({ id: 1 }, secret, { expiresIn: '-1s' });

      const response = await request(app)
        .post('/pistas/create')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(pistaTest)
        .expect(401);

      expect(response.body.message).toMatch(/El token ha expirado/);
    });
  });

  describe('E2E: Obtener pista', () => {
    let pistaTest;
    let pistaCreadaId;
    let token;

    beforeAll(async () => {
      pistaTest = {
        idZona: zona.id,
        nombre: 'E2E Test',
        dificultad: '6a',
      };
      const pistaCreada = await db.Pista.create(pistaTest);
      pistaCreadaId = pistaCreada.id;
      token = tokenService.crear({ id: 1, correo: 'test@e2e.com', role: 'admin' });
    });

    afterAll(async () => {
      if (pistaCreadaId) {
        await db.Pista.destroy({ where: { id: pistaCreadaId } });
      }
    });

    it('debería obtener una pista por ID', async () => {
      const response = await request(app)
        .get(`/pistas/${pistaCreadaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject(pistaTest);
      expect(response.body.id).toBe(pistaCreadaId);
    });

    it('debería devolver 404 si la pista no existe', async () => {
      const idInexistente = 999999;

      const response = await request(app)
        .get(`/pistas/${idInexistente}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty(
        'error',
        `Pista con ID ${idInexistente} no encontrada`
      );
    });
  });

  describe('E2E: Cambiar estado de pista', () => {
    let pistaTest;
    let escaladorTest;
    let token;

    beforeAll(async () => {
      // Crear escalador de prueba
      escaladorTest = await db.Escalador.create({
        correo: 'cambiarestado@test.com',
        contrasena: 'hashedPassword123',
        apodo: 'CambiaEstadoTester',
      });

      // Crear pista de prueba
      pistaTest = await db.Pista.create({
        idZona: zona.id,
        nombre: 'Pista Cambiar Estado',
        dificultad: '6b',
      });

      // Generar token de autenticación
      token = tokenService.crear({ 
        correo: escaladorTest.correo, 
        apodo: escaladorTest.apodo 
      });
    });

    afterAll(async () => {
      // Limpiar asociaciones y registros creados
      if (escaladorTest && pistaTest) {
        try {
          await escaladorTest.removePista(pistaTest.id);
        } catch (error) {
          // Ignorar si ya fue eliminado
          error
        }
      }
      if (pistaTest) await pistaTest.destroy();
      if (escaladorTest) await escaladorTest.destroy();
    });

    it('debería cambiar el estado de una pista exitosamente', async () => {
      const response = await request(app)
        .post(`/pistas/cambiar-estado/${pistaTest.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'Completado' })
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('Estado de la pista');
      expect(response.body.mensaje).toContain('Completado');

      // Verificar que el estado se guardó en la base de datos
      const pistaActualizada = await db.Pista.findByPk(pistaTest.id);
      const escaladores = await pistaActualizada.getEscaladores({ 
        where: { id: escaladorTest.id } 
      });
      
      expect(escaladores).toHaveLength(1);
      expect(escaladores[0].EscalaPista.estado).toBe('Completado');
    });

    it('debería actualizar el estado si ya existe una relación', async () => {
      // El estado ya fue creado en el test anterior con 'Completado'
      const response = await request(app)
        .post(`/pistas/cambiar-estado/${pistaTest.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'Flash' })
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('Flash');

      // Verificar que el estado se actualizó
      const pistaActualizada = await db.Pista.findByPk(pistaTest.id);
      const escaladores = await pistaActualizada.getEscaladores({ 
        where: { id: escaladorTest.id } 
      });
      
      expect(escaladores).toHaveLength(1);
      expect(escaladores[0].EscalaPista.estado).toBe('Flash');
    });

    it('debería retornar 401 si no se proporciona token de autenticación', async () => {
      const response = await request(app)
        .post(`/pistas/cambiar-estado/${pistaTest.id}`)
        .send({ estado: 'completado' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Acceso denegado');
    });

    it('debería retornar 500 si la pista no existe', async () => {
      const fakeIdPista = 999999;
      
      const response = await request(app)
        .post(`/pistas/cambiar-estado/${fakeIdPista}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'Completado' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('no encontrada');
    });
  });
});
