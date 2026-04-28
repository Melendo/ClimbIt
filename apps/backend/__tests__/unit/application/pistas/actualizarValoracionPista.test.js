import { jest } from '@jest/globals';
import ActualizarValoracionUseCase from '../../../../src/application/pistas/actualizarValoracion.js';
import {
  NotFoundError,
  InternalServerError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ActualizarValoracionPistaUseCase', () => {
  let mockPistaRepository;
  let mockEscaladorRepository;
  let actualizarValoracionUseCase;

  beforeEach(() => {
    mockPistaRepository = {
      obtenerPorId: jest.fn(),
      actualizarValoracion: jest.fn(),
    };
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };
    actualizarValoracionUseCase = new ActualizarValoracionUseCase(
      mockPistaRepository,
      mockEscaladorRepository
    );
  });

  it('debería actualizar la valoración de una pista correctamente', async () => {
    const datosEntrada = {
      idPista: 1,
      escaladorApodo: 'TestClimber',
      nuevaValoracion: 8,
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };

    const escaladorEncontrado = {
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    };

    const resultadoActualizacion = {
      EscalaPista: {
        idPista: 1,
        idEscalador: 1,
        estado: 'completado',
        valoracion: 8,
      },
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(
      escaladorEncontrado
    );
    mockPistaRepository.actualizarValoracion.mockResolvedValue(
      resultadoActualizacion
    );

    const resultado = await actualizarValoracionUseCase.execute(datosEntrada);

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(
      datosEntrada.idPista
    );
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      datosEntrada.escaladorApodo
    );
    expect(mockPistaRepository.actualizarValoracion).toHaveBeenCalledWith(
      pistaEncontrada.id,
      escaladorEncontrado.id,
      datosEntrada.nuevaValoracion
    );
    expect(resultado).toEqual(resultadoActualizacion);
  });

  it('debería lanzar error si la pista no existe', async () => {
    const datosEntrada = {
      idPista: 999,
      escaladorApodo: 'TestClimber',
      nuevaValoracion: 8,
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(null);

    await expect(
      actualizarValoracionUseCase.execute(datosEntrada)
    ).rejects.toThrow(NotFoundError);

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(999);
    expect(mockEscaladorRepository.encontrarPorApodo).not.toHaveBeenCalled();
    expect(mockPistaRepository.actualizarValoracion).not.toHaveBeenCalled();
  });

  it('debería lanzar error si el escalador no existe', async () => {
    const datosEntrada = {
      idPista: 1,
      escaladorApodo: 'UltimoApodo',
      nuevaValoracion: 8,
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(null);

    await expect(
      actualizarValoracionUseCase.execute(datosEntrada)
    ).rejects.toThrow(NotFoundError);

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(1);
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'UltimoApodo'
    );
    expect(mockPistaRepository.actualizarValoracion).not.toHaveBeenCalled();
  });

  it('debería lanzar error si falla al actualizar la valoración en el repositorio', async () => {
    const datosEntrada = {
      idPista: 1,
      escaladorApodo: 'TestClimber',
      nuevaValoracion: 8,
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };

    const escaladorEncontrado = {
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(
      escaladorEncontrado
    );
    mockPistaRepository.actualizarValoracion.mockRejectedValue(
      new Error('Error al actualizar en BD')
    );

    await expect(
      actualizarValoracionUseCase.execute(datosEntrada)
    ).rejects.toThrow(InternalServerError);

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(1);
    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'TestClimber'
    );
    expect(mockPistaRepository.actualizarValoracion).toHaveBeenCalledWith(
      1,
      1,
      8
    );
  });

  it('debería aceptar valoraciones válidas entre 1 y 10', async () => {
    const escaladorEncontrado = {
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(
      escaladorEncontrado
    );
    mockPistaRepository.actualizarValoracion.mockResolvedValue({
      EscalaPista: {
        idPista: 1,
        idEscalador: 1,
        estado: 'completado',
        valoracion: 5,
      },
    });

    const valoraciones = [1, 5, 10];

    for (const valoracion of valoraciones) {
      await actualizarValoracionUseCase.execute({
        idPista: 1,
        escaladorApodo: 'TestClimber',
        nuevaValoracion: valoracion,
      });

      expect(mockPistaRepository.actualizarValoracion).toHaveBeenCalledWith(
        1,
        1,
        valoracion
      );
    }

    expect(mockPistaRepository.actualizarValoracion).toHaveBeenCalledTimes(3);
  });

  it('debería propagar AppError cuando el repositorio lo lanza', async () => {
    const datosEntrada = {
      idPista: 1,
      escaladorApodo: 'TestClimber',
      nuevaValoracion: 8,
    };

    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };

    const escaladorEncontrado = {
      id: 1,
      correo: 'test@test.com',
      apodo: 'TestClimber',
    };

    const appError = new NotFoundError(
      'Relación no encontrada',
      'PISTA_ESCALADOR_RELATION_NOT_FOUND'
    );

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(
      escaladorEncontrado
    );
    mockPistaRepository.actualizarValoracion.mockRejectedValue(appError);

    await expect(
      actualizarValoracionUseCase.execute(datosEntrada)
    ).rejects.toThrow(appError);
  });
});
