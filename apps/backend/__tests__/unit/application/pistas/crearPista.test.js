import { jest } from '@jest/globals';
import CrearPistaUseCase from '../../../../src/application/pistas/crearPista.js';

describe('crearPistaUseCase', () => {
  it('debería crear y guardar una pista correctamente', async () => {
    const mockRepository = {
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

    const datos = { idZona: 1, nombre: 'Ex1', dificultad: '3a', tipo: 'boulder' };
    const resultado = await crearPista.execute(datos);

    expect(mockZonaModel.findByPk).toHaveBeenCalledWith(1);
    expect(mockRocodromoRepository.obtenerEscalasDificultad).toHaveBeenCalledWith(1);
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

    const datos = { idZona: 999, nombre: 'Ex1', dificultad: '3a', tipo: 'boulder' };
    await expect(() => crearPista.execute(datos)).rejects.toThrow(
      `La zona con ID 999 no existe`
    );
  });
  
  it('no debería crear y ni guardar una pista por datos invalidos', async () => {
    const mockRepository = {
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
});
