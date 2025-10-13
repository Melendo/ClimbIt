const Escalador = require('../../../src/domain/pistas/Pista');

describe('Pista (Entidad de dominio)', () => {
  it('debería crear una pista con los datos correctos', () => {
    const datos = { nombre: 'Ex1', dificultad: 'intermedio' };
    const escalador = new Escalador(datos);

    expect(escalador.nombre).toBe('Ex1');
    expect(escalador.dificultad).toBe('intermedio');
  });
});