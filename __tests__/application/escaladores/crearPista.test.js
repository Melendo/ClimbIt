const crearEscaladorUseCase = require('../../../src/application/pistas/crearPista');

describe('crearPistaUseCase', () => {
  it('debería crear y guardar una pista correctamente', async () => {
    const mockRepository = {
      guardar: jest.fn(async (pista) => ({
        ...pista,
        id: 1,
      })),
    };

    const crearPista = crearEscaladorUseCase(mockRepository);

    const datos = { nombre: 'Ex1', dificultad: 'intermedio' };
    const resultado = await crearPista(datos);

    expect(resultado).toMatchObject({ nombre: 'Ex1', dificultad: 'intermedio', id: 1 });
  });
});