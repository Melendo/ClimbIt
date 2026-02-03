import { jest } from '@jest/globals';
import AutenticarEscaladorUseCase from '../../../../src/application/escaladores/autenticarEscalador.js';

describe('AutenticarEscaladorUseCase', () => {
  let mockRepository;
  let mockPasswordService;
  let mockTokenService;
  let autenticarEscalador;

  beforeEach(() => {
    mockRepository = {
      encontrarPorCorreo: jest.fn(),
    };
    mockPasswordService = {
      compare: jest.fn(),
    };
    mockTokenService = {
      crear: jest.fn(),
    };
    autenticarEscalador = new AutenticarEscaladorUseCase(
      mockRepository,
      mockPasswordService,
      mockTokenService
    );
  });

  it('debería autenticar correctamente y devolver un token', async () => {
    const datosEntrada = {
      correo: 'test@example.com',
      contrasena: 'password123',
    };

    const escaladorEncontrado = {
      id: 1,
      correo: 'test@example.com',
      contrasena: 'hashed_password',
      apodo: 'TestClimb',
    };

    mockRepository.encontrarPorCorreo.mockResolvedValue(escaladorEncontrado);
    mockPasswordService.compare.mockResolvedValue(true);
    mockTokenService.crear.mockReturnValue('fake_jwt_token');

    const resultado = await autenticarEscalador.execute(datosEntrada);

    expect(mockRepository.encontrarPorCorreo).toHaveBeenCalledWith(datosEntrada.correo);
    expect(mockPasswordService.compare).toHaveBeenCalledWith(
        datosEntrada.contrasena,
        escaladorEncontrado.contrasena
    );
    expect(mockTokenService.crear).toHaveBeenCalledWith({ correo: escaladorEncontrado.correo, apodo: escaladorEncontrado.apodo });
    expect(resultado).toEqual({ token: 'fake_jwt_token' });
  });

  it('debería lanzar un error si el escalador no existe', async () => {
    mockRepository.encontrarPorCorreo.mockResolvedValue(null);

    await expect(
      autenticarEscalador.execute({ correo: 'noexiste@example.com', contrasena: '123' })
    ).rejects.toThrow('Escalador no registrado');
  });

  it('debería lanzar un error si la contraseña es incorrecta', async () => {
    const escaladorEncontrado = {
      correo: 'test@example.com',
      contrasena: 'hashed_password',
    };

    mockRepository.encontrarPorCorreo.mockResolvedValue(escaladorEncontrado);
    mockPasswordService.compare.mockResolvedValue(false);

    await expect(
      autenticarEscalador.execute({ correo: 'test@example.com', contrasena: 'wrong' })
    ).rejects.toThrow('Contraseña incorrecta');
  });
});
