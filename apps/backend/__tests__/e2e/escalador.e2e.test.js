import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';

const db = await dbPromise;

describe('E2E: Crear escalador', () => {
  const escaladorTest = {
    correo: 'e2e@test.com',
    contrasena: '123456',
    apodo: 'E2ETester',
  };

  afterAll(async () => {
    await db.Escalador.destroy({ where: { correo: escaladorTest.correo } });
    await db.sequelize.close();
  });

  it('debería crear un escalador y devolverlo', async () => {
    const response = await request(app)
      .post('/escaladores/create')
      .send(escaladorTest)
      .expect(201);

    const escaladorEsperado = { ...escaladorTest };
    delete escaladorEsperado.contrasena;
    expect(response.body).toMatchObject(escaladorEsperado);
    expect(response.body.id).toBeDefined();

    const escaladorGuardado = await db.Escalador.findByPk(response.body.id);
    expect(escaladorGuardado).not.toBeNull();
    expect(escaladorGuardado.correo).toBe(escaladorTest.correo);
    expect(escaladorGuardado.contrasena).not.toBe(escaladorTest.contrasena);
    expect(escaladorGuardado.apodo).toBe(escaladorTest.apodo);
  });

  it('debería manejar errores al crear un escalador con datos inválidos', async () => {
    const response = await request(app)
      .post('/escaladores/create')
      .send({ correo: '', contrasena: '123', apodo: 'Test' })
      .expect(422);

    expect(response.body).toHaveProperty('status', 'invalid_request');
    expect(Array.isArray(response.body.errors)).toBe(true);
    const fields = response.body.errors.map((e) => e.field);
    expect(fields).toContain('correo');
  });
});
