import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';
import tokenService from '../../src/infrastructure/security/tokenService.js';

const db = await dbPromise;

describe('E2E: Zonas', () => {
  let rocodromo;
  let zonaConPistas;
  let zonaSinPistas;
  const pistasCreadas = [];
  let token;

  beforeAll(async () => {
    token = tokenService.crear({ id: 1, correo: 'test@e2e.com', rol: 'admin' });
    
    rocodromo = await db.Rocodromo.create({
      nombre: 'Roco Zonas Integration',
      ubicacion: 'Test Location Zonas',
    });

    zonaConPistas = await db.Zona.create({
      idRoco: rocodromo.id,
      tipo: 'Zona Con Pistas Test',
    });

    zonaSinPistas = await db.Zona.create({
      idRoco: rocodromo.id,
      tipo: 'Zona Vacía Test',
    });

    pistasCreadas.push(await db.Pista.create({
      idZona: zonaConPistas.id,
      nombre: 'Pista Test 1',
      dificultad: '5a',
    }));

    pistasCreadas.push(await db.Pista.create({
      idZona: zonaConPistas.id,
      nombre: 'Pista Test 2',
      dificultad: '7b',
    }));
  });

  afterAll(async () => {
    for (const pista of pistasCreadas) {
      if (pista) await pista.destroy();
    }
    if (zonaConPistas) await zonaConPistas.destroy();
    if (zonaSinPistas) await zonaSinPistas.destroy();
    if (rocodromo) await rocodromo.destroy();
    
    await db.sequelize.close();
  });

  describe('GET /zonas/pistas/:id', () => {
    it('debería obtener la lista de pistas para una zona existente con pistas', async () => {
      const response = await request(app)
        .get(`/zonas/pistas/${zonaConPistas.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      
      const nombres = response.body.map(p => p.nombre);
      expect(nombres).toContain('Pista Test 1');
      expect(nombres).toContain('Pista Test 2');
    });

    it('debería obtener una lista vacía para una zona existente sin pistas', async () => {
      const response = await request(app)
        .get(`/zonas/pistas/${zonaSinPistas.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    it('debería retornar 404 para una zona que no existe', async () => {
      const fakeId = 999999;
      const response = await request(app)
        .get(`/zonas/pistas/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/no encontrada/);
    });

    it('debería retornar 422 si el id no es entero positivo', async () => {
      const resNonInt = await request(app)
        .get(`/zonas/pistas/xyz`)
        .set('Authorization', `Bearer ${token}`)
        .expect(422);
      expect(resNonInt.body).toHaveProperty('status', 'invalid_request');
      expect(Array.isArray(resNonInt.body.errors)).toBe(true);
      const fieldsNonInt = resNonInt.body.errors.map((e) => e.field);
      expect(fieldsNonInt).toContain('id');

      const resZero = await request(app)
        .get(`/zonas/pistas/0`)
        .set('Authorization', `Bearer ${token}`)
        .expect(422);
      expect(resZero.body).toHaveProperty('status', 'invalid_request');
      const fieldsZero = resZero.body.errors.map((e) => e.field);
      expect(fieldsZero).toContain('id');
    });
  });
});
