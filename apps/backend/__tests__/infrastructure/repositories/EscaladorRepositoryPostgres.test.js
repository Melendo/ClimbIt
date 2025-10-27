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
