import { jest } from '@jest/globals';
import PistaRepositoryPostgres from '../../../src/infrastructure/repositories/pistaRepositoryPostgres.js';
import Pista from '../../../src/domain/pistas/Pista.js';

describe('PistaRepositoryPostgres', () => {
  let repository;
  let mockPistaModel;

  beforeEach(() => {
    // Mock del modelo de Sequelize
    mockPistaModel = {
      create: jest.fn(),
    };

    // Instanciamos el repositorio con el modelo mockeado
    repository = new PistaRepositoryPostgres(mockPistaModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
});
