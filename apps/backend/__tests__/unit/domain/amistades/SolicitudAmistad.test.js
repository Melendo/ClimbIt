import SolicitudAmistad from '../../../../src/domain/amistades/SolicitudAmistad.js';

describe('SolicitudAmistad (Entidad de dominio)', () => {
  it('crea solicitud valida y asigna estado por defecto', () => {
    const solicitud = new SolicitudAmistad(1, 2, 3, null);

    expect(solicitud.id).toBe(1);
    expect(solicitud.idRemitente).toBe(2);
    expect(solicitud.idDestinatario).toBe(3);
    expect(solicitud.estado).toBe('pendiente');
  });

  it('falla cuando faltan ids obligatorios', () => {
    expect(() => new SolicitudAmistad(1, null, 3, 'pendiente')).toThrow(
      'Los identificadores de solicitud son obligatorios'
    );
    expect(() => new SolicitudAmistad(1, 2, null, 'pendiente')).toThrow(
      'Los identificadores de solicitud son obligatorios'
    );
  });

  it('falla cuando remitente y destinatario son iguales', () => {
    expect(() => new SolicitudAmistad(1, 4, 4, 'pendiente')).toThrow(
      'Un escalador no puede enviarse una solicitud a sí mismo'
    );
  });

  it('falla cuando el estado no es valido', () => {
    expect(() => new SolicitudAmistad(1, 2, 3, 'cancelada')).toThrow(
      'Estado de solicitud inválido'
    );
  });
});
