import request from 'supertest';
import app from '../../../src/interfaces/http/server.js';
import dbPromise from '../../../src/infrastructure/db/postgres/models/index.js';

const db = await dbPromise;

describe('E2E: Pistas', () => {
  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('E2E: Crear pista', () => {
    // Datos para pruebas
    const pistaTest = { nombre: 'E2E Test', dificultad: '6a' };

    // Limpieza después de todas las pruebas
    afterAll(async () => {
      await db.Pista.destroy({ where: { nombre: pistaTest.nombre } });
    });

    it('debería crear una pista y devolverla', async () => {
      // Enviar solicitud para crear pista
      const response = await request(app)
        .post('/pistas/create')
        .send(pistaTest)
        .expect(201);

      // Verificar respuesta de la API
      expect(response.body).toMatchObject(pistaTest);
      expect(response.body.id).toBeDefined();

      // Verificar que se guardó en la base de datos usando Sequelize
      const pistaGuardada = await db.Pista.findByPk(response.body.id);
      expect(pistaGuardada).not.toBeNull();
      expect(pistaGuardada.nombre).toBe(pistaTest.nombre);
      expect(pistaGuardada.dificultad).toBe(pistaTest.dificultad);
    });

    it('debería manejar errores al crear una pista con datos inválidos', async () => {
      // Enviar solicitud con datos inválidos (nombre vacío)
      const response = await request(app)
        .post('/pistas/create')
        .send({ nombre: '', dificultad: '6a' })
        .expect(500);

      // Verificar respuesta de la API
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('E2E: Obtener pista', () => {
    // Datos para pruebas
    const pistaTest = { nombre: 'E2E Test', dificultad: '6a' };
    let pistaCreadaId;

    // Crear pista antes de las pruebas
    beforeAll(async () => {
      const pistaCreada = await db.Pista.create(pistaTest);
      pistaCreadaId = pistaCreada.id;
    });

    // Limpieza después de todas las pruebas
    afterAll(async () => {
      await db.Pista.destroy({ where: { id: pistaCreadaId } });
    });

    it('debería obtener una pista por ID', async () => {
      // Enviar solicitud para obtener pista
      const response = await request(app)
        .get(`/pistas/${pistaCreadaId}`)
        .expect(200);

      // Verificar respuesta de la API
      expect(response.body).toMatchObject(pistaTest);
      expect(response.body.id).toBe(pistaCreadaId);
    });

    it('debería devolver 404 si la pista no existe', async () => {
      const idInexistente = 999999;

      // Enviar solicitud para obtener pista inexistente
      const response = await request(app)
        .get(`/pistas/${idInexistente}`)
        .expect(404);

      // Verificar respuesta de la API
      expect(response.body).toHaveProperty(
        'error',
        `Pista con ID ${idInexistente} no encontrada`
      );
    });
  });
});
