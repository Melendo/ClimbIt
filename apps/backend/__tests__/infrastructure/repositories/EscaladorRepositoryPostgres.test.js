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
        nombre: 'Pedro',
        edad: 28,
        experiencia: 'Avanzado',
      };

      // Act
      const resultado = repository._toDomain(modeloSequelize);

      // Assert
      expect(resultado).toBeInstanceOf(Escalador);
      expect(resultado.id).toBe(1);
      expect(resultado.nombre).toBe('Pedro');
      expect(resultado.edad).toBe(28);
      expect(resultado.experiencia).toBe('Avanzado');
    });

    it('debería retornar null si el modelo es null', () => {
      const resultado = repository._toDomain(null);
      expect(resultado).toBeNull();
    });

    it('debería manejar errores al mapear un modelo inválido', () => {
      const modeloInvalido = {
        id: 1,
        nombre: '', // Nombre inválido
        edad: 28,
        experiencia: 'Avanzado',
      };

      expect(() => repository._toDomain(modeloInvalido)).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });
  });
  describe('crear', () => {
    it('debería guardar un escalador usando Sequelize', async () => {
      // Arrange
      const datosEntrada = {
        nombre: 'Juan',
        edad: 30,
        experiencia: 'Intermedio',
      };

      const modeloRetornado = {
        id: 1,
        nombre: 'Juan',
        edad: 30,
        experiencia: 'Intermedio',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEscaladorModel.create.mockResolvedValue(modeloRetornado);

      // Act
      const resultado = await repository.crear(datosEntrada);

      // Assert
      expect(mockEscaladorModel.create).toHaveBeenCalledWith({
        nombre: 'Juan',
        edad: 30,
        experiencia: 'Intermedio',
      });

      expect(resultado).toBeInstanceOf(Escalador);
      expect(resultado.id).toBe(1);
      expect(resultado.nombre).toBe('Juan');
      expect(resultado.edad).toBe(30);
      expect(resultado.experiencia).toBe('Intermedio');
    });

    it('debería manejar errores al crear un escalador', async () => {
      // Arrange
      const datosEntrada = {
        nombre: 'Juan',
        edad: 30,
        experiencia: 'Intermedio',
      };

      const errorEsperado = new Error('Error al crear en la base de datos');
      mockEscaladorModel.create.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(repository.crear(datosEntrada)).rejects.toThrow(
        'Error al crear en la base de datos'
      );
    });
  });
});
