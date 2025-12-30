import { jest } from '@jest/globals';
import CrearEscaladorUseCase from '../../../src/application/escaladores/crearEscalador.js';

describe('crearEscaladorUseCase', () => {
  it('debería crear y guardar un escalador correctamente', async () => {
    const mockRepository = {
      crear: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = new CrearEscaladorUseCase(mockRepository);

    const datos = {
      correo: 'juan@example.com',
      contrasena: '123456',
      apodo: 'JuanClimb',
    };
    const resultado = await crearEscalador.execute(datos);

    expect(resultado).toMatchObject({
      correo: 'juan@example.com',
      contrasena: '123456',
      apodo: 'JuanClimb',
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

    const datos = { correo: '', contrasena: '123', apodo: 'Juan' };
    await expect(() => crearEscalador.execute(datos)).rejects.toThrow(
      `Error al crear el escalador`
    );
  });
});
