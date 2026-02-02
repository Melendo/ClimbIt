import { jest } from '@jest/globals';
import EscaladorRepositoryPostgres from '../../../src/infrastructure/repositories/escaladorRepositoryPostgres.js';
import Escalador from '../../../src/domain/escaladores/Escalador.js';

describe('EscaladorRepositoryPostgres', () => {
  let repository;
  let mockEscaladorModel;

  beforeEach(() => {
    // Mock del modelo de Sequelize
    mockEscaladorModel = {
      create: jest.fn(),
      findOne: jest.fn(),
    };

    // Instanciamos el repositorio con el modelo mockeado
    repository = new EscaladorRepositoryPostgres(mockEscaladorModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('_toDomain', () => {
    it('debería mapear correctamente un modelo de Sequelize a una entidad Escalador', () => {
      // Arrange
      const modeloSequelize = {
        id: 1,
        correo: 'test@test.com',
        contrasena: '123456',
        apodo: 'Tester',
      };

      // Act
      const resultado = repository._toDomain(modeloSequelize);

      // Assert
      expect(resultado).toBeInstanceOf(Escalador);
      expect(resultado.id).toBe(1);
      expect(resultado.correo).toBe('test@test.com');
      expect(resultado.contrasena).toBe('123456');
      expect(resultado.apodo).toBe('Tester');
    });

    it('debería retornar null si el modelo es null', () => {
      const resultado = repository._toDomain(null);
      expect(resultado).toBeNull();
    });

    it('debería manejar errores al mapear un modelo inválido', () => {
      const modeloInvalido = {
        id: 1,
        // Faltan campos requeridos
      };
      expect(() => repository._toDomain(modeloInvalido)).toThrow();
    });
  });

  describe('crear', () => {
    it('debería crear un escalador y devolver la entidad de dominio', async () => {
      // Arrange
      const escalador = new Escalador(
        null,
        'test@test.com',
        'hashedpassword',
        'Tester'
      );
      const modeloCreado = {
        id: 1,
        correo: 'test@test.com',
        contrasena: 'hashedpassword',
        apodo: 'Tester',
      };

      mockEscaladorModel.create.mockResolvedValue(modeloCreado);

      // Act
      const resultado = await repository.crear(escalador);

      // Assert
      expect(mockEscaladorModel.create).toHaveBeenCalledWith({
        correo: 'test@test.com',
        contrasena: 'hashedpassword',
        apodo: 'Tester',
      });
      expect(resultado).toBeInstanceOf(Escalador);
      expect(resultado.id).toBe(1);
    });
  });
  describe('obtener por correo', () => {
    it('debería encontrar un escalador y devolver la entidad de dominio', async () => {
      // Arrange
      const escalador = new Escalador(
        null,
        'test@test.com',
        'hashedpassword',
        'Tester'
      );
      const modeloEncontrado = {
        id: 1,
        correo: 'test@test.com',
        contrasena: 'hashedpassword',
        apodo: 'Tester',
      };

      mockEscaladorModel.findOne.mockResolvedValue(modeloEncontrado);

      // Act
      const resultado = await repository.encontrarPorCorreo(escalador.correo);

      // Assert
      expect(mockEscaladorModel.findOne).toHaveBeenCalledWith({
        where: { correo: 'test@test.com' },
      });
      expect(resultado).toBeInstanceOf(Escalador);
      expect(resultado.id).toBe(1);
    });
  });
});
