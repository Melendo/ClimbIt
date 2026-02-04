import { jest } from '@jest/globals';
import DesuscribirseRocodromoUseCase from '../../../../src/application/escaladores/desuscribirseRocodromo.js';

describe('DesuscribirseRocodromoUseCase', () => {
  let mockEscaladorRepository;
  let mockRocodromoRepository;
  let desuscribirseRocodromo;

  beforeEach(() => {
    mockEscaladorRepository = {
      desuscribirse: jest.fn(),
      estaSuscrito: jest.fn(),
    };
    mockRocodromoRepository = {
      encontrarPorId: jest.fn(),
    };
    desuscribirseRocodromo = new DesuscribirseRocodromoUseCase(
      mockEscaladorRepository,
      mockRocodromoRepository
    );
  });

  it('debería desuscribir correctamente un escalador de un rocódromo', async () => {
    const datosEntrada = {
      escaladorApodo: 'TestClimber',
      idRocodromo: 1,
    };

    const rocodromoEncontrado = {
      id: 1,
      nombre: 'Boulder Central',
      ciudad: 'Madrid',
      direccion: 'Calle Test 123',
    };

    mockRocodromoRepository.encontrarPorId.mockResolvedValue(rocodromoEncontrado);
    mockEscaladorRepository.estaSuscrito.mockResolvedValue(true);
    mockEscaladorRepository.desuscribirse.mockResolvedValue();

    const resultado = await desuscribirseRocodromo.execute(datosEntrada);

    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(datosEntrada.idRocodromo);
    expect(mockEscaladorRepository.estaSuscrito).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo,
      datosEntrada.idRocodromo
    );
    expect(mockEscaladorRepository.desuscribirse).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo,
      datosEntrada.idRocodromo
    );
    expect(resultado).toEqual({
      mensaje: `Escalador ${datosEntrada.escaladorApodo} desuscrito del rocódromo ${rocodromoEncontrado.nombre} exitosamente.`
    });
  });

  it('debería lanzar un error si el rocódromo no existe', async () => {
    const datosEntrada = {
      escaladorApodo: 'TestClimber',
      idRocodromo: 999,
    };

    mockRocodromoRepository.encontrarPorId.mockResolvedValue(null);

    await expect(
      desuscribirseRocodromo.execute(datosEntrada)
    ).rejects.toThrow('Error al desuscribirse del rocódromo: Rocódromo con ID 999 no encontrado');

    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(datosEntrada.idRocodromo);
    expect(mockEscaladorRepository.estaSuscrito).not.toHaveBeenCalled();
    expect(mockEscaladorRepository.desuscribirse).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si el escalador no está suscrito al rocódromo', async () => {
    const datosEntrada = {
      escaladorApodo: 'TestClimber',
      idRocodromo: 1,
    };

    const rocodromoEncontrado = {
      id: 1,
      nombre: 'Boulder Central',
      ciudad: 'Madrid',
      direccion: 'Calle Test 123',
    };

    mockRocodromoRepository.encontrarPorId.mockResolvedValue(rocodromoEncontrado);
    mockEscaladorRepository.estaSuscrito.mockResolvedValue(false);

    await expect(
      desuscribirseRocodromo.execute(datosEntrada)
    ).rejects.toThrow('Error al desuscribirse del rocódromo: El escalador TestClimber no está suscrito al rocódromo con ID 1');

    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(datosEntrada.idRocodromo);
    expect(mockEscaladorRepository.estaSuscrito).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo,
      datosEntrada.idRocodromo
    );
    expect(mockEscaladorRepository.desuscribirse).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si falla la desuscripción en el repositorio', async () => {
    const datosEntrada = {
      escaladorApodo: 'TestClimber',
      idRocodromo: 1,
    };

    const rocodromoEncontrado = {
      id: 1,
      nombre: 'Boulder Central',
      ciudad: 'Madrid',
      direccion: 'Calle Test 123',
    };

    mockRocodromoRepository.encontrarPorId.mockResolvedValue(rocodromoEncontrado);
    mockEscaladorRepository.estaSuscrito.mockResolvedValue(true);
    mockEscaladorRepository.desuscribirse.mockRejectedValue(
      new Error('Error al eliminar la suscripción')
    );

    await expect(
      desuscribirseRocodromo.execute(datosEntrada)
    ).rejects.toThrow('Error al desuscribirse del rocódromo: Error al eliminar la suscripción');

    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(datosEntrada.idRocodromo);
    expect(mockEscaladorRepository.estaSuscrito).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo,
      datosEntrada.idRocodromo
    );
    expect(mockEscaladorRepository.desuscribirse).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo,
      datosEntrada.idRocodromo
    );
  });
});
