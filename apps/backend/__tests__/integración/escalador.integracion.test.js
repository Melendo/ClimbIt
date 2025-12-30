import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';

const db = await dbPromise;

describe('E2E: Crear escalador', () => {
  // Datos para pruebas
  const escaladorTest = {
    correo: 'e2e@test.com',
    contrasena: '123456',
    apodo: 'E2ETester',
  };

  // Limpieza después de todas las pruebas
  afterAll(async () => {
    await db.Escalador.destroy({ where: { correo: escaladorTest.correo } });
    await db.sequelize.close();
  });

  it('debería crear un escalador y devolverlo', async () => {
    // Enviar solicitud para crear escalador
    const response = await request(app)
      .post('/escaladores/create')
      .send(escaladorTest)
      .expect(201);

    // Verificar respuesta de la API
    expect(response.body).toMatchObject(escaladorTest);
    expect(response.body.id).toBeDefined();

    // Verificar que se guardó en la base de datos
    const escaladorGuardado = await db.Escalador.findByPk(response.body.id);
    expect(escaladorGuardado).not.toBeNull();
    expect(escaladorGuardado.correo).toBe(escaladorTest.correo);
    expect(escaladorGuardado.contrasena).toBe(escaladorTest.contrasena);
    expect(escaladorGuardado.apodo).toBe(escaladorTest.apodo);
  });

  it('debería manejar errores al crear un escalador con datos inválidos', async () => {
    // Enviar solicitud con datos inválidos (correo vacío)
    const response = await request(app)
      .post('/escaladores/create')
      .send({ correo: '', contrasena: '123', apodo: 'Test' })
      .expect(500);

    // Verificar respuesta de la API
    expect(response.body).toHaveProperty('error');
  });
});
