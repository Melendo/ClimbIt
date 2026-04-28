import Amistad from '../../../../src/domain/amistades/Amistad.js';

describe('Amistad (Entidad de dominio)', () => {
  it('crea una amistad valida cuando idEscalador1 es menor que idEscalador2', () => {
    const fechaInicio = new Date('2026-04-25T12:00:00.000Z');
    const amistad = new Amistad(1, 2, 7, fechaInicio);

    expect(amistad.id).toBe(1);
    expect(amistad.idEscalador1).toBe(2);
    expect(amistad.idEscalador2).toBe(7);
    expect(amistad.fechaInicio).toBe(fechaInicio);
  });

  it('falla cuando faltan ids obligatorios', () => {
    expect(() => new Amistad(1, null, 7)).toThrow(
      'Los identificadores de amistad son obligatorios'
    );
    expect(() => new Amistad(1, 2, null)).toThrow(
      'Los identificadores de amistad son obligatorios'
    );
  });

  it('falla cuando idEscalador1 no es menor que idEscalador2', () => {
    expect(() => new Amistad(1, 5, 5)).toThrow(
      'La amistad debe almacenarse con idEscalador1 menor que idEscalador2'
    );
    expect(() => new Amistad(1, 8, 3)).toThrow(
      'La amistad debe almacenarse con idEscalador1 menor que idEscalador2'
    );
  });
});
