import request from 'supertest';
import app from '../../../src/interfaces/http/server.js';
import dbPromise from '../../../src/infrastructure/db/postgres/models/index.js';

const db = await dbPromise;

describe('E2E: Crear pista', () => {
  // Datos para pruebas
  const pistaTest = { nombre: 'E2E Test', dificultad: '6a' };

  // Limpieza después de todas las pruebas
  afterAll(async () => {
    await db.Pista.destroy({ where: { nombre: pistaTest.nombre } });
    await db.sequelize.close();
  });

  it('debería crear una pista y devolverla', async () => {
    // Enviar solicitud para crear pista
    const response = await request(app)
      .post('/pistas')
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
});
