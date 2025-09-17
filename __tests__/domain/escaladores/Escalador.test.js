const Escalador = require('../../../src/domain/escaladores/Escalador');

describe('Escalador (Entidad de dominio)', () => {
  it('debería crear un escalador con los datos correctos', () => {
    const datos = { nombre: 'Ana', edad: 28, experiencia: 'avanzado' };
    const escalador = new Escalador(datos);

    expect(escalador.nombre).toBe('Ana');
    expect(escalador.edad).toBe(28);
    expect(escalador.experiencia).toBe('avanzado');
  });
});