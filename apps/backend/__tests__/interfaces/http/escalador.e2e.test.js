const request = require('supertest');
const app = require('../../../src/interfaces/http/server');
const pool = require('../../../src/infrastructure/db/postgres');

describe('E2E: Crear escalador', () => {
  afterAll(async () => {
    await pool.query('DELETE FROM escaladores WHERE nombre = $1', ['E2E']);
    await pool.end();
  });

  it('debería crear un escalador y devolverlo', async () => {
    const nuevoEscalador = { nombre: 'E2E', edad: 25, experiencia: 'avanzado' };

    const response = await request(app)
      .post('/escaladores')
      .send(nuevoEscalador)
      .expect(201);

    expect(response.body).toMatchObject(nuevoEscalador);

    const { rows } = await pool.query(
      'SELECT * FROM escaladores WHERE nombre = $1',
      [nuevoEscalador.nombre]
    );
    expect(rows[0]).toMatchObject(nuevoEscalador);
  });
});
