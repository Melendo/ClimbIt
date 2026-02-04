import { jest } from '@jest/globals';
import CambiarEstadoPistaUseCase from '../../../../src/application/pistas/cambiarEstadoPista.js';

describe('CambiarEstadoPistaUseCase', () => {
  let mockPistaRepository;
  let mockEscaladorRepository;
  let cambiarEstadoPista;

  beforeEach(() => {
    mockPistaRepository = {
      obtenerPorId: jest.fn(),
      cambiarEstado: jest.fn(),
    };
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };
    cambiarEstadoPista = new CambiarEstadoPistaUseCase(
      mockPistaRepository,
      mockEscaladorRepository
    );
  });

  it('debería cambiar el estado de la pista correctamente', async () => {
    const datosEntrada = {
      idPista: 1,
      nuevoEstado: 'completado',
      escaladorApodo: 'TestClimber',
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista 1',
      dificultad: '6a',
    };

    const escaladorEncontrado = {
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(escaladorEncontrado);
    mockPistaRepository.cambiarEstado.mockResolvedValue();

    const resultado = await cambiarEstadoPista.execute(datosEntrada);

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(datosEntrada.idPista);
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(datosEntrada.escaladorApodo);
    expect(mockPistaRepository.cambiarEstado).toHaveBeenCalledWith(
      datosEntrada.idPista,
      escaladorEncontrado.id,
      datosEntrada.nuevoEstado
    );
    expect(resultado).toEqual({
      mensaje: `Estado de la pista con ID ${datosEntrada.idPista} cambiado a ${datosEntrada.nuevoEstado} exitosamente.`
    });
  });

  it('debería lanzar un error si la pista no existe', async () => {
    const datosEntrada = {
      idPista: 999,
      nuevoEstado: 'completado',
      escaladorApodo: 'TestClimber',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(null);

    await expect(
      cambiarEstadoPista.execute(datosEntrada)
    ).rejects.toThrow('Error al cambiar el estado de la pista: Pista con ID 999 no encontrada');

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(datosEntrada.idPista);
    expect(mockEscaladorRepository.encontrarPorApodo).not.toHaveBeenCalled();
    expect(mockPistaRepository.cambiarEstado).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si el escalador no existe', async () => {
    const datosEntrada = {
      idPista: 1,
      nuevoEstado: 'completado',
      escaladorApodo: 'NoExiste',
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista 1',
      dificultad: '6a',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(null);

    await expect(
      cambiarEstadoPista.execute(datosEntrada)
    ).rejects.toThrow('Error al cambiar el estado de la pista: Escalador con apodo NoExiste no encontrado');

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(datosEntrada.idPista);
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(datosEntrada.escaladorApodo);
    expect(mockPistaRepository.cambiarEstado).not.toHaveBeenCalled();
  });

  it('debería lanzar un error si falla el cambio de estado en el repositorio', async () => {
    const datosEntrada = {
      idPista: 1,
      nuevoEstado: 'completado',
      escaladorApodo: 'TestClimber',
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista 1',
      dificultad: '6a',
    };

    const escaladorEncontrado = {
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(escaladorEncontrado);
    mockPistaRepository.cambiarEstado.mockRejectedValue(
      new Error('Error al actualizar el estado')
    );

    await expect(
      cambiarEstadoPista.execute(datosEntrada)
    ).rejects.toThrow('Error al cambiar el estado de la pista: Error al actualizar el estado');

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(datosEntrada.idPista);
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(datosEntrada.escaladorApodo);
    expect(mockPistaRepository.cambiarEstado).toHaveBeenCalledWith(
      datosEntrada.idPista,
      escaladorEncontrado.id,
      datosEntrada.nuevoEstado
    );
  });
});
