import request from 'supertest';
import app from '../../../src/interfaces/http/server.js';
import dbPromise from '../../../src/infrastructure/db/postgres/models/index.js';

const db = await dbPromise;

describe('E2E: Crear escalador', () => {
  // Datos para pruebas
  const escaladorTest = {
    nombre: 'E2E Test',
    edad: 25,
    experiencia: 'Avanzado',
  };

  // Limpieza después de todas las pruebas
  afterAll(async () => {
    await db.Escalador.destroy({ where: { nombre: escaladorTest.nombre } });
    await db.sequelize.close();
  });

  it('debería crear un escalador y devolverlo', async () => {
    // Enviar solicitud para crear escalador
    const response = await request(app)
      .post('/escaladores')
      .send(escaladorTest)
      .expect(201);

    // Verificar respuesta de la API
    expect(response.body).toMatchObject(escaladorTest);
    expect(response.body.id).toBeDefined();

    // Verificar que se guardó en la base de datos
    const escaladorGuardado = await db.Escalador.findByPk(response.body.id);
    expect(escaladorGuardado).not.toBeNull();
    expect(escaladorGuardado.nombre).toBe(escaladorTest.nombre);
    expect(escaladorGuardado.edad).toBe(escaladorTest.edad);
    expect(escaladorGuardado.experiencia).toBe(escaladorTest.experiencia);
  });
});
