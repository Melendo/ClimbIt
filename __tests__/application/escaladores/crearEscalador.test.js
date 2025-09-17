const crearEscaladorUseCase = require('../../../src/application/escaladores/crearEscalador');

describe('crearEscaladorUseCase', () => {
  it('debería crear y guardar un escalador correctamente', async () => {
    const mockRepository = {
      guardar: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = crearEscaladorUseCase(mockRepository);

    const datos = { nombre: 'Juan', edad: 30, experiencia: 'intermedio' };
    const resultado = await crearEscalador(datos);

    expect(resultado).toMatchObject({ nombre: 'Juan', edad: 30, experiencia: 'intermedio', id: 1 });
  });
});