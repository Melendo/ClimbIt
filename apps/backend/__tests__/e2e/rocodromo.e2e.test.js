import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';
import tokenService from '../../src/infrastructure/security/tokenService.js';

const db = await dbPromise;

describe('E2E: Rocodromos', () => {
  let rocodromoConZonas;
  let rocodromoSinZonas;
  const zonasCreadas = [];
  let token;

  beforeAll(async () => {
    token = tokenService.crear({ id: 1, correo: 'test@e2e.com', rol: 'admin' });
    
    rocodromoConZonas = await db.Rocodromo.create({
      nombre: 'Roco Con Zonas Integration',
      ubicacion: 'Test Location 1',
    });

    rocodromoSinZonas = await db.Rocodromo.create({
      nombre: 'Roco Sin Zonas Integration',
      ubicacion: 'Test Location 2',
    });

    zonasCreadas.push(await db.Zona.create({
      idRoco: rocodromoConZonas.id,
      tipo: 'Zona Boulder',
    }));

    zonasCreadas.push(await db.Zona.create({
      idRoco: rocodromoConZonas.id,
      tipo: 'Zona Cuerda',
    }));
  });

  afterAll(async () => {
    for (const zona of zonasCreadas) {
      if (zona) await zona.destroy();
    }
    if (rocodromoConZonas) await rocodromoConZonas.destroy();
    if (rocodromoSinZonas) await rocodromoSinZonas.destroy();
    
    await db.sequelize.close();
  });

  describe('GET /rocodromos/zonas/:id', () => {
    it('debería obtener la lista de zonas para un rocódromo existente con zonas', async () => {
      const response = await request(app)
        .get(`/rocodromos/zonas/${rocodromoConZonas.id}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      
      const tipos = response.body.map(z => z.tipo);
      expect(tipos).toContain('Zona Boulder');
      expect(tipos).toContain('Zona Cuerda');
    });

    it('debería obtener una lista vacía para un rocódromo existente sin zonas', async () => {
      const response = await request(app)
        .get(`/rocodromos/zonas/${rocodromoSinZonas.id}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    it('debería retornar 404 para un rocódromo que no existe', async () => {
      const fakeId = 9999999;
      const response = await request(app)
        .get(`/rocodromos/zonas/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/no encontrado/);
    });

    it('debería retornar 422 si el id no es entero positivo', async () => {
      const resNonInt = await request(app)
        .get(`/rocodromos/zonas/abc`)
        .expect(422);
      expect(resNonInt.body).toHaveProperty('status', 'invalid_request');
      expect(Array.isArray(resNonInt.body.errors)).toBe(true);
      const fieldsNonInt = resNonInt.body.errors.map((e) => e.field);
      expect(fieldsNonInt).toContain('id');

      const resZero = await request(app)
        .get(`/rocodromos/zonas/0`)
        .expect(422);
      expect(resZero.body).toHaveProperty('status', 'invalid_request');
      const fieldsZero = resZero.body.errors.map((e) => e.field);
      expect(fieldsZero).toContain('id');
    });
  });

  describe('GET /rocodromos/', () => {
    it('debería retornar 401 si no se envia token', async () => {
      await request(app)
        .get('/rocodromos/')
        .expect(401);
    });

    it('debería obtener todos los rocódromos con token valido', async () => {
      const response = await request(app)
        .get('/rocodromos/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      const nombres = response.body.map(r => r.nombre);
      expect(nombres).toContain('Roco Con Zonas Integration');
      expect(nombres).toContain('Roco Sin Zonas Integration');
    });
  });
});
