const CrearPistaUseCase = require('../../../src/application/pistas/crearPista');

describe('crearPistaUseCase', () => {
  it('debería crear y guardar una pista correctamente', async () => {
    const mockRepository = {
      crear: jest.fn(async (pista) => ({
        ...pista,
        id: 1,
      })),
    };

    const crearPista = new CrearPistaUseCase(mockRepository);

    const datos = { nombre: 'Ex1', dificultad: '3a' };
    const resultado = await crearPista.execute(datos);

    expect(resultado).toMatchObject({
      nombre: 'Ex1',
      dificultad: '3a',
      id: 1,
    });
  });
  it('no debería crear y ni guardar una pista por datos invalidos', async () => {
    const mockRepository = {
      crear: jest.fn(async (pista) => ({
        ...pista,
        id: 1,
      })),
    };

    const crearPista = new CrearPistaUseCase(mockRepository);

    const datos = {};
    await expect(() => crearPista.execute(datos)).rejects.toThrow(
      `Error al crear la pista`
    );
  });
});
