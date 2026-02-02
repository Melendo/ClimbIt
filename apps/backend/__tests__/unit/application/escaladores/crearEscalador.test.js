import { jest } from '@jest/globals';
import CrearEscaladorUseCase from '../../../../src/application/escaladores/crearEscalador.js';

describe('crearEscaladorUseCase', () => {
  it('debería crear y guardar un escalador correctamente', async () => {
    // jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_123456'); // Eliminamos dependencia directa de bcrypt

    const mockPasswordService = {
      hash: jest.fn().mockResolvedValue('hashed_123456'),
    };

    const mockRepository = {
      crear: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = new CrearEscaladorUseCase(
      mockRepository,
      mockPasswordService
    );

    const datos = {
      correo: 'juan@example.com',
      contrasena: '123456',
      apodo: 'JuanClimb',
    };
    const resultado = await crearEscalador.execute(datos);

    expect(mockPasswordService.hash).toHaveBeenCalledWith('123456'); // Verificamos que se llamó al hash
    expect(resultado).toMatchObject({
      correo: 'juan@example.com',
      contrasena: 'hashed_123456',
      apodo: 'JuanClimb',
      id: 1,
    });
  });

  it('no debería crear y ni guardar un escalador por datos invalidos', async () => {
    const mockPasswordService = {
        hash: jest.fn().mockResolvedValue('hashed_123'),
    };
    
    const mockRepository = {
      crear: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = new CrearEscaladorUseCase(
        mockRepository,
        mockPasswordService
    );

    const datos = { correo: '', contrasena: '123', apodo: 'Juan' };
    await expect(() => crearEscalador.execute(datos)).rejects.toThrow(
      `Error al crear el escalador`
    );
  });
});
