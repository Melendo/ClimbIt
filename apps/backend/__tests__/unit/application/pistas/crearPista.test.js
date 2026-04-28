import { jest } from '@jest/globals';
import CrearPistaUseCase from '../../../../src/application/pistas/crearPista.js';

describe('crearPistaUseCase', () => {
  it('debería crear y guardar una pista correctamente', async () => {
    const mockRepository = {
      obtenerPorPosicion: jest.fn(async () => null),
      crear: jest.fn(async (pista) => ({
        ...pista,
        id: 1,
      })),
    };

    const mockZonaModel = {
      findByPk: jest.fn(async (id) => ({ id, idRoco: 1, tipo: 'Boulder' })),
    };

    const mockRocodromoRepository = {
      obtenerEscalasDificultad: jest.fn(async () => ({
        escalaDificultadBloque: { dificultades: ['3a', '3b'] },
        escalaDificultadVia: { dificultades: ['5a', '6a'] },
      })),
    };

    const crearPista = new CrearPistaUseCase(
      mockRepository,
      mockZonaModel,
      mockRocodromoRepository
    );

    const datos = {
      idZona: 1,
      nombre: 'Ex1',
      dificultad: '3a',
      tipo: 'boulder',
    };
    const resultado = await crearPista.execute(datos);

    expect(mockZonaModel.findByPk).toHaveBeenCalledWith(1);
    expect(
      mockRocodromoRepository.obtenerEscalasDificultad
    ).toHaveBeenCalledWith(1);
    expect(mockRepository.obtenerPorPosicion).toHaveBeenCalledWith(
      undefined,
      undefined,
      1
    );
    expect(resultado).toMatchObject({
      idZona: 1,
      nombre: 'Ex1',
      dificultad: '3a',
      tipo: 'boulder',
      id: 1,
    });
  });

  it('no debería crear una pista si la zona no existe', async () => {
    const mockRepository = {
      obtenerPorPosicion: jest.fn(async () => null),
      crear: jest.fn(async (pista) => ({
        ...pista,
        id: 1,
      })),
    };

    const mockZonaModel = {
      findByPk: jest.fn(async () => null),
    };

    const mockRocodromoRepository = {
      obtenerEscalasDificultad: jest.fn(),
    };

    const crearPista = new CrearPistaUseCase(
      mockRepository,
      mockZonaModel,
      mockRocodromoRepository
    );

    const datos = {
      idZona: 999,
      nombre: 'Ex1',
      dificultad: '3a',
      tipo: 'boulder',
    };
    await expect(() => crearPista.execute(datos)).rejects.toThrow(
      `La zona con ID 999 no existe`
    );
  });

  it('no debería crear y ni guardar una pista por datos invalidos', async () => {
    const mockRepository = {
      obtenerPorPosicion: jest.fn(async () => null),
      crear: jest.fn(async (pista) => ({
        ...pista,
        id: 1,
      })),
    };

    const mockZonaModel = {
      findByPk: jest.fn(async (id) => ({ id, idRoco: 1, tipo: 'Boulder' })),
    };

    const mockRocodromoRepository = {
      obtenerEscalasDificultad: jest.fn(async () => ({
        escalaDificultadBloque: { dificultades: ['3a', '3b'] },
        escalaDificultadVia: { dificultades: ['5a', '6a'] },
      })),
    };

    const crearPista = new CrearPistaUseCase(
      mockRepository,
      mockZonaModel,
      mockRocodromoRepository
    );

    const datos = {};
    await expect(() => crearPista.execute(datos)).rejects.toThrow(
      `Error al crear la pista`
    );
  });

  it('no debería crear una pista si ya existe una pista activa en la misma posicion', async () => {
    const mockRepository = {
      obtenerPorPosicion: jest.fn(async () => ({ id: 15, posX: 10, posY: 20 })),
      crear: jest.fn(async (pista) => ({ ...pista, id: 16 })),
    };

    const mockZonaModel = {
      findByPk: jest.fn(async (id) => ({ id, idRoco: 1 })),
    };

    const mockRocodromoRepository = {
      obtenerEscalasDificultad: jest.fn(async () => ({
        escalaDificultadBloque: { dificultades: ['V1', 'V2'] },
        escalaDificultadVia: { dificultades: ['6a', '6b'] },
      })),
    };

    const crearPista = new CrearPistaUseCase(
      mockRepository,
      mockZonaModel,
      mockRocodromoRepository
    );

    const datos = {
      idZona: 1,
      nombre: 'Duplicada',
      dificultad: '6a',
      tipo: 'via',
      posX: 10,
      posY: 20,
    };

    await expect(() => crearPista.execute(datos)).rejects.toThrow(
      'Ya existe una pista activa en la posición (10, 20)'
    );
    expect(mockRepository.obtenerPorPosicion).toHaveBeenCalledWith(10, 20, 1);
    expect(mockRepository.crear).not.toHaveBeenCalled();
  });

  it('debería crear una pista si no hay pistas activas en la posición (aunque existan inactivas)', async () => {
    const mockRepository = {
      // El repositorio filtra por activo=true, por eso devolver null implica que no hay activas en XY.
      obtenerPorPosicion: jest.fn(async () => null),
      crear: jest.fn(async (pista) => ({ ...pista, id: 21 })),
    };

    const mockZonaModel = {
      findByPk: jest.fn(async (id) => ({ id, idRoco: 1 })),
    };

    const mockRocodromoRepository = {
      obtenerEscalasDificultad: jest.fn(async () => ({
        escalaDificultadBloque: { dificultades: ['V1', 'V2'] },
        escalaDificultadVia: { dificultades: ['6a', '6b'] },
      })),
    };

    const crearPista = new CrearPistaUseCase(
      mockRepository,
      mockZonaModel,
      mockRocodromoRepository
    );

    const datos = {
      idZona: 1,
      nombre: 'Nueva en XY',
      dificultad: '6a',
      tipo: 'via',
      posX: 44,
      posY: 55,
    };

    const resultado = await crearPista.execute(datos);

    expect(mockRepository.obtenerPorPosicion).toHaveBeenCalledWith(44, 55, 1);
    expect(mockRepository.crear).toHaveBeenCalledTimes(1);
    expect(resultado.id).toBe(21);
  });
});
