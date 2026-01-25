import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';

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

    beforeEach(() => {
      pistaTest = {
        idZona: zona.id,
        nombre: 'E2E Test',
        dificultad: '6a',
      };
    });

    afterAll(async () => {
      await db.Pista.destroy({ where: { nombre: 'E2E Test' } });
    });

    it('debería crear una pista y devolverla', async () => {
      const response = await request(app)
        .post('/pistas/create')
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
        .send({ idZona: zona.id, nombre: '', dificultad: '6a' })
        .expect(422);

      expect(response.body).toHaveProperty('status', 'invalid_request');
      expect(Array.isArray(response.body.errors)).toBe(true);
      const fields = response.body.errors.map((e) => e.field);
      expect(fields).toContain('nombre');
    });
  });

  describe('E2E: Obtener pista', () => {
    let pistaTest;
    let pistaCreadaId;

    beforeAll(async () => {
      pistaTest = {
        idZona: zona.id,
        nombre: 'E2E Test',
        dificultad: '6a',
      };
      const pistaCreada = await db.Pista.create(pistaTest);
      pistaCreadaId = pistaCreada.id;
    });

    afterAll(async () => {
      if (pistaCreadaId) {
        await db.Pista.destroy({ where: { id: pistaCreadaId } });
      }
    });

    it('debería obtener una pista por ID', async () => {
      const response = await request(app)
        .get(`/pistas/${pistaCreadaId}`)
        .expect(200);

      expect(response.body).toMatchObject(pistaTest);
      expect(response.body.id).toBe(pistaCreadaId);
    });

    it('debería devolver 404 si la pista no existe', async () => {
      const idInexistente = 999999;

      const response = await request(app)
        .get(`/pistas/${idInexistente}`)
        .expect(404);

      expect(response.body).toHaveProperty(
        'error',
        `Pista con ID ${idInexistente} no encontrada`
      );
    });
  });
});
