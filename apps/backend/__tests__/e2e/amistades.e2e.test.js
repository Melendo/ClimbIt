import request from 'supertest';
import app from '../../src/interfaces/http/server.js';
import dbPromise from '../../src/infrastructure/db/postgres/models/index.js';
import tokenService from '../../src/infrastructure/security/tokenService.js';

const db = await dbPromise;

describe('E2E: Amistades', () => {
  let escaladorOrigen;
  let escaladorDestino;
  let escaladorTercero;
  let tokenOrigen;
  let tokenDestino;
  // eslint-disable-next-line no-unused-vars
  let tokenTercero;
  let solicitudId;

  async function limpiarDatos() {
    const apodos = ['amistad-origen-e2e', 'amistad-destino-e2e', 'amistad-tercero-e2e'];
    const escaladores = await db.Escalador.findAll({
      where: { apodo: apodos },
      attributes: ['id'],
    });
    const idsEscaladores = escaladores.map((e) => e.id);

    if (idsEscaladores.length > 0) {
      await db.Amistad.destroy({
        where: {
          [db.Sequelize.Op.or]: [
            { idEscalador1: idsEscaladores },
            { idEscalador2: idsEscaladores },
          ],
        },
      });

      await db.SolicitudAmistad.destroy({
        where: {
          [db.Sequelize.Op.or]: [
            { idRemitente: idsEscaladores },
            { idDestinatario: idsEscaladores },
          ],
        },
      });
    }

    await db.Escalador.destroy({ where: { apodo: apodos } });
  }

  beforeAll(async () => {
    await limpiarDatos();

    escaladorOrigen = await db.Escalador.create({
      correo: 'origen@amistad-e2e.com',
      contrasena: 'hashedPassword123',
      apodo: 'amistad-origen-e2e',
    });
    escaladorDestino = await db.Escalador.create({
      correo: 'destino@amistad-e2e.com',
      contrasena: 'hashedPassword123',
      apodo: 'amistad-destino-e2e',
    });
    escaladorTercero = await db.Escalador.create({
      correo: 'tercero@amistad-e2e.com',
      contrasena: 'hashedPassword123',
      apodo: 'amistad-tercero-e2e',
    });

    tokenOrigen = tokenService.crear({
      id: escaladorOrigen.id,
      correo: escaladorOrigen.correo,
      apodo: escaladorOrigen.apodo,
      rol: 'Escalador',
    });
    tokenDestino = tokenService.crear({
      id: escaladorDestino.id,
      correo: escaladorDestino.correo,
      apodo: escaladorDestino.apodo,
      rol: 'Escalador',
    });
    tokenTercero = tokenService.crear({
      id: escaladorTercero.id,
      correo: escaladorTercero.correo,
      apodo: escaladorTercero.apodo,
      rol: 'Escalador',
    });
  });

  afterAll(async () => {
    await limpiarDatos();
    await db.sequelize.close();
  });

  describe('POST /amistades/enviar', () => {
    it('debería enviar una solicitud de amistad', async () => {
      const response = await request(app)
        .post('/amistades/enviar')
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .send({ apodoDestinatario: escaladorDestino.apodo })
        .expect(201);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('Solicitud de amistad enviada correctamente');
      expect(response.body).toHaveProperty('solicitud');
      expect(response.body.solicitud).toHaveProperty('id');
      expect(response.body.solicitud.idRemitente).toBe(escaladorOrigen.id);
      expect(response.body.solicitud.idDestinatario).toBe(escaladorDestino.id);
      expect(response.body.solicitud.estado).toBe('pendiente');

      solicitudId = response.body.solicitud.id;
    });

     
    it('debería impedir enviar solicitud duplicada', async () => {
      const response = await request(app)
        .post('/amistades/enviar')
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .send({ apodoDestinatario: escaladorDestino.apodo })
        
      expect(response.status).toBe(409);
    });
  });

  describe('POST /amistades/responder', () => {
    it('debería aceptar la solicitud y crear amistad', async () => {
      const response = await request(app)
        .post('/amistades/responder')
        .set('Authorization', `Bearer ${tokenDestino}`)
        .send({ idSolicitud: solicitudId, respuesta: 'aceptada' })
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('aceptada correctamente');
      expect(response.body.solicitud).toEqual({ id: solicitudId, estado: 'aceptada' });
      expect(response.body).toHaveProperty('amistad');
      expect(response.body.amistad.idEscalador1).toBeLessThan(response.body.amistad.idEscalador2);

      const amistadGuardada = await db.Amistad.findOne({
        where: {
          idEscalador1: Math.min(escaladorOrigen.id, escaladorDestino.id),
          idEscalador2: Math.max(escaladorOrigen.id, escaladorDestino.id),
        },
      });
      expect(amistadGuardada).not.toBeNull();
    });

    it('debería rechazar una solicitud sin crear amistad', async () => {
      const nuevaSolicitud = await db.SolicitudAmistad.create({
        idRemitente: escaladorTercero.id,
        idDestinatario: escaladorOrigen.id,
        estado: 'pendiente',
      });

      const response = await request(app)
        .post('/amistades/responder')
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .send({ idSolicitud: nuevaSolicitud.id, respuesta: 'rechazada' })
        .expect(200);

      expect(response.body.solicitud).toEqual({ id: nuevaSolicitud.id, estado: 'rechazada' });
      const amistadInexistente = await db.Amistad.findOne({
        where: {
          idEscalador1: Math.min(escaladorTercero.id, escaladorOrigen.id),
          idEscalador2: Math.max(escaladorTercero.id, escaladorOrigen.id),
        },
      });
      expect(amistadInexistente).toBeNull();
    });
  });

  describe('GET /amistades/mis-amigos', () => {
    it('debería listar los amigos del usuario autenticado', async () => {
      const response = await request(app)
        .get('/amistades/mis-amigos')
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: escaladorDestino.id,
        apodo: escaladorDestino.apodo,
      });
    });
  });

  describe('GET /amistades/solicitudes-pendientes', () => {
    it('debería listar las solicitudes pendientes para el usuario autenticado', async () => {
      // Limpiamos solicitudes previas para evitar error de constraint único
      await db.SolicitudAmistad.destroy({
        where: {
          idRemitente: escaladorTercero.id,
          idDestinatario: escaladorOrigen.id
        }
      });

      // Creamos una solicitud pendiente para que haya resultados
      const nuevaSolicitud = await db.SolicitudAmistad.create({
        idRemitente: escaladorTercero.id,
        idDestinatario: escaladorOrigen.id,
        estado: 'pendiente',
      });

      const response = await request(app)
        .get('/amistades/solicitudes-pendientes')
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      
      const solicitudDevuelta = response.body.find(s => s.idSolicitud === nuevaSolicitud.id);
      expect(solicitudDevuelta).toBeDefined();
      expect(solicitudDevuelta.idRemitente).toBe(escaladorTercero.id);
      expect(solicitudDevuelta.apodo).toBe(escaladorTercero.apodo);
    });
  });

  describe('GET /amistades/perfil/:apodo', () => {
    it('debería permitir ver el perfil completo de un amigo', async () => {
      const response = await request(app)
        .get(`/amistades/perfil/${escaladorDestino.apodo}`)
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: escaladorDestino.id,
        correo: escaladorDestino.correo,
        apodo: escaladorDestino.apodo,
      });
    });

    it('debería denegar el acceso al perfil si no hay amistad', async () => {
      const response = await request(app)
        .get(`/amistades/perfil/${escaladorTercero.apodo}`)
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /amistades/:apodoAmigo', () => {
    it('debería eliminar la amistad y limpiar solicitudes vinculadas', async () => {
      const response = await request(app)
        .delete(`/amistades/${escaladorDestino.apodo}`)
        .set('Authorization', `Bearer ${tokenOrigen}`)
        .expect(200);

      expect(response.body).toHaveProperty('mensaje', 'Amigo eliminado correctamente');

      const amistadEliminada = await db.Amistad.findOne({
        where: {
          idEscalador1: Math.min(escaladorOrigen.id, escaladorDestino.id),
          idEscalador2: Math.max(escaladorOrigen.id, escaladorDestino.id),
        },
      });
      expect(amistadEliminada).toBeNull();
    });
  });
});
