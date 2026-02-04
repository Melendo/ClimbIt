import { jest } from '@jest/globals';
import SuscribirseRocodromoUseCase from '../../../../src/application/escaladores/suscribirseRocodromo.js';

describe('SuscribirseRocodromoUseCase', () => {
  let mockEscaladorRepository;
  let mockRocodromoRepository;
  let suscribirseRocodromo;

  beforeEach(() => {
    mockEscaladorRepository = {
      suscribirse: jest.fn(),
    };
    mockRocodromoRepository = {
      encontrarPorId: jest.fn(),
    };
    suscribirseRocodromo = new SuscribirseRocodromoUseCase(
      mockEscaladorRepository,
      mockRocodromoRepository
    );
  });

  it('debería suscribir correctamente un escalador a un rocódromo', async () => {
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
    mockEscaladorRepository.suscribirse.mockResolvedValue();

    const resultado = await suscribirseRocodromo.execute(datosEntrada);

    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(datosEntrada.idRocodromo);
    expect(mockEscaladorRepository.suscribirse).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo,
      rocodromoEncontrado
    );
    expect(resultado).toEqual({
      mensaje: `Escalador ${datosEntrada.escaladorApodo} suscrito al rocódromo ${rocodromoEncontrado.nombre} exitosamente.`
    });
  });

  it('debería lanzar un error si el rocódromo no existe', async () => {
    const datosEntrada = {
      escaladorApodo: 'TestClimber',
      idRocodromo: 999,
    };

    mockRocodromoRepository.encontrarPorId.mockResolvedValue(null);

    await expect(
      suscribirseRocodromo.execute(datosEntrada)
    ).rejects.toThrow('Error al suscribirse al rocódromo: Rocódromo con ID 999 no encontrado');

    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(datosEntrada.idRocodromo);
    expect(mockEscaladorRepository.suscribirse).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si falla la suscripción en el repositorio', async () => {
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
    mockEscaladorRepository.suscribirse.mockRejectedValue(
      new Error('Error al guardar la suscripción')
    );

    await expect(
      suscribirseRocodromo.execute(datosEntrada)
    ).rejects.toThrow('Error al suscribirse al rocódromo: Error al guardar la suscripción');

    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(datosEntrada.idRocodromo);
    expect(mockEscaladorRepository.suscribirse).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo,
      rocodromoEncontrado
    );
  });
});
