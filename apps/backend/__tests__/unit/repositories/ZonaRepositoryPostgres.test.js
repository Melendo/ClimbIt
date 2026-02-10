import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import ZonaRepositoryPostgres from '../../../src/infrastructure/repositories/zonaRepositoryPostgres.js';
import Zona from '../../../src/domain/zonas/Zona.js';

describe('ZonaRepositoryPostgres', () => {
  let repository;
  let mockZonaModel;

  beforeEach(() => {
    // Mock del modelo de Sequelize
    mockZonaModel = {
      findByPk: jest.fn(),
    };

    // Instanciamos el repositorio con el modelo mockeado
    repository = new ZonaRepositoryPostgres(mockZonaModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('_toDomain', () => {
    it('debería mapear correctamente un modelo de Sequelize a una entidad Zona', () => {
      const modeloSequelize = {
        id: 1,
        idRoco: 2,
        tipo: 'Zona Principal',
      };

      const resultado = repository._toDomain(modeloSequelize);

      expect(resultado).toBeInstanceOf(Zona);
      expect(resultado.id).toBe(1);
      expect(resultado.idRoco).toBe(2);
      expect(resultado.tipo).toBe('Zona Principal');
    });

    it('debería retornar null si el modelo es null', () => {
      const resultado = repository._toDomain(null);
      expect(resultado).toBeNull();
    });
    
    it('debería lanzar error si falla la creación del dominio', () => {
      // Simulamos un modelo inválido que hará fallar el constructor de Zona
       const modeloInvalido = {
        id: 1,
        idRoco: 1, 
        tipo: '', // Esto debería fallar en el constructor de Zona
      };
      
      expect(() => repository._toDomain(modeloInvalido)).toThrow();
    });
  });

  describe('obtenerPistasDeZona', () => {
    it('debería retornar la lista de pistas asociadas si la zona existe', async () => {
      // Arrange
      const idZona = 1;
      const mockZonaData = {
        id: 1,
        idRoco: 10,
        tipo: 'Zona Test',
        pistas: [
          { id: 101, idZona: 1, nombre: 'Pista A', dificultad: '5a', escaladores: [] },
          { id: 102, idZona: 1, nombre: 'Pista B', dificultad: '6b', escaladores: [] },
        ],
      };

      mockZonaModel.findByPk.mockResolvedValue(mockZonaData);

      // Act
      const resultado = await repository.obtenerPistasDeZona(idZona);

      // Assert
      expect(mockZonaModel.findByPk).toHaveBeenCalledWith(idZona, {
        include: [
          {
            association: 'pistas',
            include: [],
          },
        ],
      });
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({
        id: 101,
        idZona: 1,
        nombre: 'Pista A',
        dificultad: '5a',
        estado: null,
      });
    });

    it('debería retornar null si la zona no existe', async () => {
      // Arrange
      mockZonaModel.findByPk.mockResolvedValue(null);

      // Act
      const resultado = await repository.obtenerPistasDeZona(999);

      // Assert
      expect(resultado).toBeNull();
    });

    it('debería lanzar un error si falla la consulta a base de datos', async () => {
      // Arrange
      const errorMsg = 'DB Error';
      mockZonaModel.findByPk.mockRejectedValue(new Error(errorMsg));

      // Act & Assert
      await expect(repository.obtenerPistasDeZona(1)).rejects.toThrow(
        `Error al obtener las pistas de la zona: ${errorMsg}`
      );
    });
  });
});
