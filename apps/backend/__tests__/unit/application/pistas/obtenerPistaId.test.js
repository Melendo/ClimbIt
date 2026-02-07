import { jest } from '@jest/globals';
import ObtenerPistaPorId from '../../../../src/application/pistas/obtenerPistaPorId.js';

describe('obtenerPistaPorIdUseCase', () => {
  it('debería obtener una pista por su ID correctamente con estado', async () => {
    const mockPistaRepository = {
      obtenerPorId: jest.fn(async (id) => ({
        id,
        idZona: 1,
        nombre: 'Ex1',
        dificultad: '3a',
      })),
      obtenerEstado: jest.fn(async () => 'Flash'),
    };
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(async () => ({ id: 42, apodo: 'climber1' })),
    };

    const obtenerPista = new ObtenerPistaPorId(mockPistaRepository, mockEscaladorRepository);

    const resultado = await obtenerPista.execute(1, 'climber1');

    expect(resultado).toMatchObject({
      id: 1,
      idZona: 1,
      nombre: 'Ex1',
      dificultad: '3a',
      estado: 'Flash',
    });
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith('climber1');
    expect(mockPistaRepository.obtenerEstado).toHaveBeenCalledWith(1, 42);
  });

  it('debería devolver estado null si no se proporciona escaladorApodo', async () => {
    const mockPistaRepository = {
      obtenerPorId: jest.fn(async (id) => ({
        id,
        idZona: 1,
        nombre: 'Ex1',
        dificultad: '3a',
      })),
      obtenerEstado: jest.fn(),
    };
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };

    const obtenerPista = new ObtenerPistaPorId(mockPistaRepository, mockEscaladorRepository);

    const resultado = await obtenerPista.execute(1);

    expect(resultado).toMatchObject({
      id: 1,
      nombre: 'Ex1',
      estado: null,
    });
    expect(mockEscaladorRepository.encontrarPorApodo).not.toHaveBeenCalled();
    expect(mockPistaRepository.obtenerEstado).not.toHaveBeenCalled();
  });

  it('debería devolver estado null si el escalador no se encuentra', async () => {
    const mockPistaRepository = {
      obtenerPorId: jest.fn(async (id) => ({
        id,
        idZona: 1,
        nombre: 'Ex1',
        dificultad: '3a',
      })),
      obtenerEstado: jest.fn(),
    };
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(async () => null),
    };

    const obtenerPista = new ObtenerPistaPorId(mockPistaRepository, mockEscaladorRepository);

    const resultado = await obtenerPista.execute(1, 'noexiste');

    expect(resultado.estado).toBeNull();
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith('noexiste');
    expect(mockPistaRepository.obtenerEstado).not.toHaveBeenCalled();
  });

  it('no debería obtener una pista por su ID si no existe', async () => {
    const mockPistaRepository = {
      obtenerPorId: jest.fn(async (id) => null),
    };
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };

    const obtenerPista = new ObtenerPistaPorId(mockPistaRepository, mockEscaladorRepository);

    const resultado = await obtenerPista.execute(999, 'climber1');
    expect(resultado).toBeNull();
    expect(mockEscaladorRepository.encontrarPorApodo).not.toHaveBeenCalled();
  });
});
