import { describe, jest } from '@jest/globals';
import PistaRepositoryPostgres from '../../../src/infrastructure/repositories/pistaRepositoryPostgres.js';
import Pista from '../../../src/domain/pistas/Pista.js';

describe('PistaRepositoryPostgres', () => {
  let repository;
  let mockPistaModel;

  beforeEach(() => {
    // Mock del modelo de Sequelize
    mockPistaModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    // Instanciamos el repositorio con el modelo mockeado
    repository = new PistaRepositoryPostgres(mockPistaModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('_toDomain', () => {
    it('debería mapear correctamente un modelo de Sequelize a una entidad Pista', () => {
      // Arrange
      const modeloSequelize = {
        id: 1,
        nombre: 'El Muro',
        dificultad: '6a',
      };

      // Act
      const resultado = repository._toDomain(modeloSequelize);

      // Assert
      expect(resultado).toBeInstanceOf(Pista);
      expect(resultado.id).toBe(1);
      expect(resultado.nombre).toBe('El Muro');
      expect(resultado.dificultad).toBe('6a');
    });

    it('debería retornar null si el modelo es null', () => {
      const resultado = repository._toDomain(null);
      expect(resultado).toBeNull();
    });

    it('debería manejar errores al mapear un modelo inválido', () => {
      const modeloInvalido = {
        id: 1,
        nombre: '', // Nombre inválido
        dificultad: '6a',
      };

      expect(() => repository._toDomain(modeloInvalido)).toThrow(
        'nombre inválido: Debe ser una cadena no vacía.'
      );
    });
  });

  describe('crear', () => {
    it('debería guardar una pista usando Sequelize', async () => {
      // Arrange
      const datosEntrada = {
        nombre: 'El Muro',
        dificultad: '6a',
      };

      const modeloRetornado = {
        id: 1,
        nombre: 'El Muro',
        dificultad: '6a',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPistaModel.create.mockResolvedValue(modeloRetornado);

      // Act
      const resultado = await repository.crear(datosEntrada);

      // Assert
      expect(mockPistaModel.create).toHaveBeenCalledWith({
        nombre: 'El Muro',
        dificultad: '6a',
      });

      expect(resultado).toBeInstanceOf(Pista);
      expect(resultado.id).toBe(1);
      expect(resultado.nombre).toBe('El Muro');
      expect(resultado.dificultad).toBe('6a');
    });

    it('debería manejar errores al crear una pista', async () => {
      // Arrange
      const datosEntrada = {
        nombre: 'El Muro',
        dificultad: '6a',
      };

      const errorEsperado = new Error('Error al crear en la base de datos');
      mockPistaModel.create.mockRejectedValue(errorEsperado);

      // Act & Assert
      await expect(repository.crear(datosEntrada)).rejects.toThrow(
        'Error al crear en la base de datos'
      );
    });
  });

  describe('obtenerPorId', () => {
    it('debería obtener una pista por su ID usando Sequelize', async () => {
      // Arrange
      const pistaId = 1;

      const modeloRetornado = {
        id: 1,
        nombre: 'El Muro',
        dificultad: '6a',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPistaModel.findByPk = jest.fn().mockResolvedValue(modeloRetornado);

      // Act
      const resultado = await repository.obtenerPorId(pistaId);

      // Assert
      expect(mockPistaModel.findByPk).toHaveBeenCalledWith(pistaId);

      expect(resultado).toBeInstanceOf(Pista);
      expect(resultado.id).toBe(1);
      expect(resultado.nombre).toBe('El Muro');
      expect(resultado.dificultad).toBe('6a');
    });

    it('debería retornar null si no se encuentra la pista', async () => {
      const pistaId = 999;

      mockPistaModel.findByPk = jest.fn().mockResolvedValue(null);

      const resultado = await repository.obtenerPorId(pistaId);

      expect(mockPistaModel.findByPk).toHaveBeenCalledWith(pistaId);
      expect(resultado).toBeNull();
    });

    it('debería manejar errores al obtener una pista por su ID', async () => {
      const pistaId = 1;

      const errorEsperado = new Error('Error al obtener de la base de datos');
      mockPistaModel.findByPk = jest.fn().mockRejectedValue(errorEsperado);

      await expect(repository.obtenerPorId(pistaId)).rejects.toThrow(
        'Error al obtener de la base de datos'
      );
    });
  });
});
