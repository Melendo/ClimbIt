const request = require('supertest');
const app = require('../../../src/interfaces/http/server');
const pool = require('../../../src/infrastructure/db/postgres');

describe('E2E: Crear pista', () => {
  afterAll(async () => {
    await pool.query('DELETE FROM pistas WHERE nombre = $1', ['E2E']);
    await pool.end();
  });

  it('debería crear una pista y devolverla', async () => {
    const nuevaPista = { nombre: 'E2E', dificultad: 'intermedio' };

    const response = await request(app)
      .post('/pistas')
      .send(nuevaPista)
      .expect(201);

    expect(response.body).toMatchObject(nuevaPista);

    const { rows } = await pool.query(
      'SELECT * FROM pistas WHERE nombre = $1',
      [nuevaPista.nombre]
    );
    expect(rows[0]).toMatchObject(nuevaPista);
  });
});
