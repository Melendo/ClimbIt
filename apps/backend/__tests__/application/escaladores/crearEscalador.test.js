const CrearEscaladorUseCase = require('../../../src/application/escaladores/crearEscalador');

describe('crearEscaladorUseCase', () => {
  it('debería crear y guardar un escalador correctamente', async () => {
    const mockRepository = {
      crear: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = new CrearEscaladorUseCase(mockRepository);

    const datos = { nombre: 'Juan', edad: 30, experiencia: 'Intermedio' };
    const resultado = await crearEscalador.execute(datos);

    expect(resultado).toMatchObject({
      nombre: 'Juan',
      edad: 30,
      experiencia: 'Intermedio',
      id: 1,
    });
  });

  it('no debería crear y ni guardar un escalador por datos invalidos', async () => {
    const mockRepository = {
      crear: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = new CrearEscaladorUseCase(mockRepository);

    const datos = { nombre: 'Juan', edad: 30, experiencia: 'intermedio' };
    await expect(() => crearEscalador.execute(datos)).rejects.toThrow(
      `Error al crear el escalador`
    );
  });
});
