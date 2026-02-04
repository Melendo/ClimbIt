import { jest } from '@jest/globals';
import CrearEscaladorUseCase from '../../../../src/application/escaladores/crearEscalador.js';

describe('crearEscaladorUseCase', () => {
  it('debería crear y guardar un escalador correctamente y devolver un token', async () => {
    // jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_123456'); // Eliminamos dependencia directa de bcrypt

    const mockPasswordService = {
      hash: jest.fn().mockResolvedValue('hashed_123456'),
    };

    const mockTokenService = {
      crear: jest.fn().mockReturnValue('token_jwt_simulado'),
    };

    const mockRepository = {
      crear: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = new CrearEscaladorUseCase(
      mockRepository,
      mockPasswordService,
      mockTokenService
    );

    const datos = {
      correo: 'juan@example.com',
      contrasena: '123456',
      apodo: 'JuanClimb',
    };
    const resultado = await crearEscalador.execute(datos);

    expect(mockPasswordService.hash).toHaveBeenCalledWith('123456'); // Verificamos que se llamó al hash
    expect(mockRepository.crear).toHaveBeenCalled();
    expect(mockTokenService.crear).toHaveBeenCalledWith({
      correo: 'juan@example.com',
      apodo: 'JuanClimb',
    });
    expect(resultado).toEqual({ token: 'token_jwt_simulado' });
  });

  it('no debería crear y ni guardar un escalador por datos invalidos', async () => {
    const mockPasswordService = {
        hash: jest.fn().mockResolvedValue('hashed_123'),
    };

    const mockTokenService = {
      crear: jest.fn(),
    };
    
    const mockRepository = {
      crear: jest.fn(async (escalador) => ({
        ...escalador,
        id: 1,
      })),
    };

    const crearEscalador = new CrearEscaladorUseCase(
        mockRepository,
        mockPasswordService,
        mockTokenService
    );

    const datos = { correo: '', contrasena: '123', apodo: 'Juan' };
    await expect(() => crearEscalador.execute(datos)).rejects.toThrow(
      `Error al crear el escalador`
    );
  });
});
