import { jest } from '@jest/globals';
import AutenticarEscaladorUseCase from '../../../../src/application/escaladores/autenticarEscalador.js';

describe('AutenticarEscaladorUseCase', () => {
  let mockRepository;
  let mockPasswordService;
  let mockTokenService;
  let autenticarEscalador;

  beforeEach(() => {
    mockRepository = {
      encontrarPorCorreoInsensitive: jest.fn(),
      obtenerIdsRocodromosGestionados: jest.fn(),
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
      isAdmin: false,
    };

    mockRepository.encontrarPorCorreoInsensitive.mockResolvedValue(
      escaladorEncontrado
    );
    mockRepository.obtenerIdsRocodromosGestionados.mockResolvedValue([]);
    mockPasswordService.compare.mockResolvedValue(true);
    mockTokenService.crear.mockReturnValue('fake_jwt_token');

    const resultado = await autenticarEscalador.execute(datosEntrada);

    expect(mockRepository.encontrarPorCorreoInsensitive).toHaveBeenCalledWith(
      datosEntrada.correo
    );
    expect(mockPasswordService.compare).toHaveBeenCalledWith(
      datosEntrada.contrasena,
      escaladorEncontrado.contrasena
    );
    expect(mockTokenService.crear).toHaveBeenCalledWith({
      correo: escaladorEncontrado.correo,
      apodo: escaladorEncontrado.apodo,
      rol: 'Escalador',
    });
    expect(resultado).toEqual({ token: 'fake_jwt_token' });
  });

  it('debería asignar rol Gestor con un solo rocódromo gestionado', async () => {
    const datosEntrada = {
      correo: 'gestor1@example.com',
      contrasena: 'password123',
    };

    const escaladorEncontrado = {
      id: 10,
      correo: 'gestor1@example.com',
      contrasena: 'hashed_password',
      apodo: 'GestorUno',
      isAdmin: false,
    };

    mockRepository.encontrarPorCorreoInsensitive.mockResolvedValue(
      escaladorEncontrado
    );
    mockRepository.obtenerIdsRocodromosGestionados.mockResolvedValue([7]);
    mockPasswordService.compare.mockResolvedValue(true);
    mockTokenService.crear.mockReturnValue('fake_jwt_token');

    const resultado = await autenticarEscalador.execute(datosEntrada);

    expect(mockTokenService.crear).toHaveBeenCalledWith({
      correo: escaladorEncontrado.correo,
      apodo: escaladorEncontrado.apodo,
      rol: 'Gestor',
      rocodromosGestionados: [7],
    });
    expect(resultado).toEqual({ token: 'fake_jwt_token' });
  });

  it('debería asignar rol Gestor con varios rocódromos gestionados', async () => {
    const datosEntrada = {
      correo: 'gestor2@example.com',
      contrasena: 'password123',
    };

    const escaladorEncontrado = {
      id: 11,
      correo: 'gestor2@example.com',
      contrasena: 'hashed_password',
      apodo: 'GestorMulti',
      isAdmin: false,
    };

    mockRepository.encontrarPorCorreoInsensitive.mockResolvedValue(
      escaladorEncontrado
    );
    mockRepository.obtenerIdsRocodromosGestionados.mockResolvedValue([3, 5, 9]);
    mockPasswordService.compare.mockResolvedValue(true);
    mockTokenService.crear.mockReturnValue('fake_jwt_token');

    const resultado = await autenticarEscalador.execute(datosEntrada);

    expect(mockTokenService.crear).toHaveBeenCalledWith({
      correo: escaladorEncontrado.correo,
      apodo: escaladorEncontrado.apodo,
      rol: 'Gestor',
      rocodromosGestionados: [3, 5, 9],
    });
    expect(resultado).toEqual({ token: 'fake_jwt_token' });
  });

  it('debería lanzar un error si el escalador no existe', async () => {
    mockRepository.encontrarPorCorreoInsensitive.mockResolvedValue(null);

    await expect(
      autenticarEscalador.execute({
        correo: 'noexiste@example.com',
        contrasena: '123',
      })
    ).rejects.toThrow('Escalador no registrado');
  });

  it('debería lanzar un error si la contraseña es incorrecta', async () => {
    const escaladorEncontrado = {
      correo: 'test@example.com',
      contrasena: 'hashed_password',
      isAdmin: false,
    };

    mockRepository.encontrarPorCorreoInsensitive.mockResolvedValue(
      escaladorEncontrado
    );
    mockPasswordService.compare.mockResolvedValue(false);

    await expect(
      autenticarEscalador.execute({
        correo: 'test@example.com',
        contrasena: 'wrong',
      })
    ).rejects.toThrow('Contraseña incorrecta');
  });

  it('debería asignar rol Admin cuando el escalador es admin', async () => {
    const datosEntrada = {
      correo: 'admin@example.com',
      contrasena: 'password123',
    };

    const escaladorEncontrado = {
      id: 99,
      correo: 'admin@example.com',
      contrasena: 'hashed_password',
      apodo: 'AdminTotal',
      isAdmin: true,
    };

    mockRepository.encontrarPorCorreoInsensitive.mockResolvedValue(
      escaladorEncontrado
    );
    mockPasswordService.compare.mockResolvedValue(true);
    mockTokenService.crear.mockReturnValue('fake_jwt_token');

    const resultado = await autenticarEscalador.execute(datosEntrada);

    expect(
      mockRepository.obtenerIdsRocodromosGestionados
    ).not.toHaveBeenCalled();
    expect(mockTokenService.crear).toHaveBeenCalledWith({
      correo: escaladorEncontrado.correo,
      apodo: escaladorEncontrado.apodo,
      rol: 'Admin',
    });
    expect(resultado).toEqual({ token: 'fake_jwt_token' });
  });
});
