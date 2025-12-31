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
        idZona: 2,
        nombre: 'El Muro',
        dificultad: '6a',
      };

      // Act
      const resultado = repository._toDomain(modeloSequelize);

      // Assert
      expect(resultado).toBeInstanceOf(Pista);
      expect(resultado.id).toBe(1);
      expect(resultado.idZona).toBe(2);
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
        // Faltan campos
      };
      expect(() => repository._toDomain(modeloInvalido)).toThrow();
    });
  });

  describe('crear', () => {
    it('debería crear una pista y devolver la entidad de dominio', async () => {
      // Arrange
      const pista = new Pista(null, 2, 'El Muro', '6a');
      const modeloCreado = {
        id: 1,
        idZona: 2,
        nombre: 'El Muro',
        dificultad: '6a',
      };

      mockPistaModel.create.mockResolvedValue(modeloCreado);

      // Act
      const resultado = await repository.crear(pista);

      // Assert
      expect(mockPistaModel.create).toHaveBeenCalledWith({
        idZona: 2,
        nombre: 'El Muro',
        dificultad: '6a',
      });
      expect(resultado).toBeInstanceOf(Pista);
      expect(resultado.id).toBe(1);
    });
  });
});
