import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import RocodromoRepositoryPostgres from '../../../src/infrastructure/repositories/rocodromoRepositoryPostgres.js';
import Rocodromo from '../../../src/domain/rocodromos/Rocodromo.js';

describe('RocodromoRepositoryPostgres', () => {
  let repository;
  let mockRocodromoModel;

  beforeEach(() => {
    // Mock del modelo de Sequelize
    mockRocodromoModel = {
      findByPk: jest.fn(),
    };

    // Instanciamos el repositorio con el modelo mockeado
    repository = new RocodromoRepositoryPostgres(mockRocodromoModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('_toDomain', () => {
    it('debería mapear correctamente un modelo de Sequelize a una entidad Rocodromo', () => {
      const modeloSequelize = {
        id: 1,
        nombre: 'Roco Test',
        ubicacion: 'Ciudad Test',
      };

      const resultado = repository._toDomain(modeloSequelize);

      expect(resultado).toBeInstanceOf(Rocodromo);
      expect(resultado.id).toBe(1);
      expect(resultado.nombre).toBe('Roco Test');
      expect(resultado.ubicacion).toBe('Ciudad Test');
    });

    it('debería retornar null si el modelo es null', () => {
      const resultado = repository._toDomain(null);
      expect(resultado).toBeNull();
    });
    
    it('debería lanzar error si falla la creación del dominio', () => {
       const modeloInvalido = {
        id: 'no-number', // Esto debería fallar en el constructor de Rocodromo
        nombre: 'Roco Fail',
        ubicacion: 'Nowhere',
      };
      
      expect(() => repository._toDomain(modeloInvalido)).toThrow();
    });
  });

  describe('obtenerZonasDeRocodromo', () => {
    it('debería retornar la lista de zonas asociadas si el rocódromo existe', async () => {
      // Arrange
      const idRocodromo = 1;
      const mockRocodromoData = {
        id: 1,
        nombre: 'Roco Test',
        ubicacion: 'Ciudad Test',
        zonas: [
          { id: 101, idRoco: 1, tipo: 'Boulder' },
          { id: 102, idRoco: 1, tipo: 'Cuerda' },
        ],
      };

      mockRocodromoModel.findByPk.mockResolvedValue(mockRocodromoData);

      // Act
      const resultado = await repository.obtenerZonasDeRocodromo(idRocodromo);

      // Assert
      expect(mockRocodromoModel.findByPk).toHaveBeenCalledWith(idRocodromo, {
        include: 'zonas',
      });
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        id: 101,
        idRoco: 1,
        tipo: 'Boulder',
      });
      expect(resultado[1]).toEqual({
        id: 102,
        idRoco: 1,
        tipo: 'Cuerda',
      });
    });

    it('debería retornar null si el rocódromo no existe', async () => {
      // Arrange
      mockRocodromoModel.findByPk.mockResolvedValue(null);

      // Act
      const resultado = await repository.obtenerZonasDeRocodromo(999);

      // Assert
      expect(resultado).toBeNull();
    });

    it('debería lanzar un error si falla la consulta a base de datos', async () => {
      // Arrange
      mockRocodromoModel.findByPk.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(repository.obtenerZonasDeRocodromo(1)).rejects.toThrow(
        'Error al obtener las zonas del rocódromo: DB Error'
      );
    });
  });
});
