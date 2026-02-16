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

  describe('cambiarEstado', () => {
    it('debería cambiar el estado de un escalador en una pista exitosamente', async () => {
      // Arrange
      const idPista = 1;
      const idEscalador = 1;
      const nuevoEstado = 'completado';

      const mockPistaInstance = {
        id: idPista,
        escaladores: [], // No existe la relación
        addEscaladores: jest.fn().mockResolvedValue(true),
      };

      mockPistaModel.findByPk.mockResolvedValue(mockPistaInstance);

      // Act
      await repository.cambiarEstado(idPista, idEscalador, nuevoEstado);

      // Assert
      expect(mockPistaModel.findByPk).toHaveBeenCalledWith(idPista, {
        include: [{
          association: 'escaladores',
          where: { id: idEscalador },
          required: false,
        }],
      });
      expect(mockPistaInstance.addEscaladores).toHaveBeenCalledWith(idEscalador, { 
        through: { estado: nuevoEstado } 
      });
    });

    it('debería actualizar el estado si la relación ya existe', async () => {
      // Arrange
      const idPista = 1;
      const idEscalador = 1;
      const nuevoEstado = 'completado';
      const estadoAnterior = 'flash';

      const mockEscalaPistaData = {
        estado: estadoAnterior,
        update: jest.fn().mockResolvedValue(true),
      };

      const mockEscaladorData = {
        id: idEscalador,
        EscalaPista: mockEscalaPistaData,
      };

      const mockPistaInstance = {
        id: idPista,
        escaladores: [mockEscaladorData], // Ya existe la relación
      };

      mockPistaModel.findByPk.mockResolvedValue(mockPistaInstance);

      // Act
      await repository.cambiarEstado(idPista, idEscalador, nuevoEstado);

      // Assert
      expect(mockPistaModel.findByPk).toHaveBeenCalledWith(idPista, {
        include: [{
          association: 'escaladores',
          where: { id: idEscalador },
          required: false,
        }],
      });
      expect(mockEscalaPistaData.update).toHaveBeenCalledWith({ estado: nuevoEstado });
    });

    it('debería lanzar un error si la pista no existe', async () => {
      // Arrange
      const idPista = 999;
      const idEscalador = 1;
      const nuevoEstado = 'completado';

      mockPistaModel.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(
        repository.cambiarEstado(idPista, idEscalador, nuevoEstado)
      ).rejects.toThrow('Pista con ID 999 no encontrada');

      expect(mockPistaModel.findByPk).toHaveBeenCalledWith(idPista, {
        include: [{
          association: 'escaladores',
          where: { id: idEscalador },
          required: false,
        }],
      });
    });

    it('debería lanzar un error si falla la asociación', async () => {
      // Arrange
      const idPista = 1;
      const idEscalador = 1;
      const nuevoEstado = 'completado';

      const mockPistaInstance = {
        id: idPista,
        escaladores: [],
        addEscaladores: jest.fn().mockRejectedValue(new Error('Error de base de datos')),
      };

      mockPistaModel.findByPk.mockResolvedValue(mockPistaInstance);

      // Act & Assert
      await expect(
        repository.cambiarEstado(idPista, idEscalador, nuevoEstado)
      ).rejects.toThrow('Error de base de datos');
    });
  });

  describe('obtenerEstado', () => {
    it('debería retornar el estado del escalador en la pista', async () => {
      // Arrange
      const mockPistaInstance = {
        id: 1,
        escaladores: [{
          id: 5,
          EscalaPista: { estado: 'Flash' },
        }],
      };

      mockPistaModel.findByPk.mockResolvedValue(mockPistaInstance);

      // Act
      const resultado = await repository.obtenerEstado(1, 5);

      // Assert
      expect(resultado).toBe('Flash');
      expect(mockPistaModel.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          association: 'escaladores',
          where: { id: 5 },
          required: false,
        }],
      });
    });

    it('debería retornar null si la pista no existe', async () => {
      mockPistaModel.findByPk.mockResolvedValue(null);

      const resultado = await repository.obtenerEstado(999, 1);
      expect(resultado).toBeNull();
    });

    it('debería retornar null si el escalador no tiene estado en la pista', async () => {
      const mockPistaInstance = {
        id: 1,
        escaladores: [],
      };

      mockPistaModel.findByPk.mockResolvedValue(mockPistaInstance);

      const resultado = await repository.obtenerEstado(1, 5);
      expect(resultado).toBeNull();
    });
  });
});
