import { jest } from '@jest/globals';
import ObtenerValoracionTotalUseCase from '../../../../src/application/pistas/obtenerValoracionTotal.js';
import {
  NotFoundError,
  InternalServerError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerValoracionTotalPistaUseCase', () => {
  let mockPistaRepository;
  let obtenerValoracionTotalUseCase;

  beforeEach(() => {
    mockPistaRepository = {
      obtenerPorId: jest.fn(),
      obtenerValoracionTotal: jest.fn(),
    };
    obtenerValoracionTotalUseCase = new ObtenerValoracionTotalUseCase(
      mockPistaRepository
    );
  });

  it('debería obtener la valoración total correctamente', async () => {
    const idPista = 1;
    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };
    const resultado = {
      idPista: 1,
      valoracionTotal: 8.5,
      numValoraciones: 4,
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockPistaRepository.obtenerValoracionTotal.mockResolvedValue(resultado);

    const response = await obtenerValoracionTotalUseCase.execute({ idPista });

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(idPista);
    expect(mockPistaRepository.obtenerValoracionTotal).toHaveBeenCalledWith(
      idPista
    );
    expect(response).toEqual(resultado);
    expect(response.valoracionTotal).toBe(8.5);
    expect(response.numValoraciones).toBe(4);
  });

  it('debería retornar 0 valoraciones si no hay ninguna', async () => {
    const idPista = 1;
    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };
    const resultado = {
      idPista: 1,
      valoracionTotal: 0,
      numValoraciones: 0,
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockPistaRepository.obtenerValoracionTotal.mockResolvedValue(resultado);

    const response = await obtenerValoracionTotalUseCase.execute({ idPista });

    expect(response.valoracionTotal).toBe(0);
    expect(response.numValoraciones).toBe(0);
  });

  it('debería lanzar error si la pista no existe', async () => {
    const idPista = 999;

    mockPistaRepository.obtenerPorId.mockResolvedValue(null);

    await expect(
      obtenerValoracionTotalUseCase.execute({ idPista })
    ).rejects.toThrow(NotFoundError);

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(idPista);
    expect(mockPistaRepository.obtenerValoracionTotal).not.toHaveBeenCalled();
  });

  it('debería lanzar error si falla al obtener la valoración del repositorio', async () => {
    const idPista = 1;
    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
      dificultad: '6a',
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockPistaRepository.obtenerValoracionTotal.mockRejectedValue(
      new Error('Error en BD')
    );

    await expect(
      obtenerValoracionTotalUseCase.execute({ idPista })
    ).rejects.toThrow(InternalServerError);

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(idPista);
    expect(mockPistaRepository.obtenerValoracionTotal).toHaveBeenCalledWith(
      idPista
    );
  });

  it('debería calcular correctamente el promedio de valoraciones', async () => {
    const idPista = 1;
    const pistaEncontrada = {
      id: 1,
      idZona: 1,
      nombre: 'Pista Test',
    };
    const resultado = {
      idPista: 1,
      valoracionTotal: 7.25, // (8 + 9 + 6 + 6) / 4 = 7.25
      numValoraciones: 4,
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockPistaRepository.obtenerValoracionTotal.mockResolvedValue(resultado);

    const response = await obtenerValoracionTotalUseCase.execute({ idPista });

    expect(response.valoracionTotal).toBe(7.25);
    expect(response.numValoraciones).toBe(4);
  });

  it('debería retornar valoración total con una sola valoración', async () => {
    const idPista = 1;
    const pistaEncontrada = { id: 1, idZona: 1, nombre: 'Pista Test' };
    const resultado = {
      idPista: 1,
      valoracionTotal: 9,
      numValoraciones: 1,
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaEncontrada);
    mockPistaRepository.obtenerValoracionTotal.mockResolvedValue(resultado);

    const response = await obtenerValoracionTotalUseCase.execute({ idPista });

    expect(response.valoracionTotal).toBe(9);
    expect(response.numValoraciones).toBe(1);
  });

  it('debería propagar AppError cuando el repositorio lo lanza', async () => {
    const idPista = 1;
    const appError = new NotFoundError('Pista no existe', 'PISTA_NOT_FOUND');

    mockPistaRepository.obtenerPorId.mockRejectedValue(appError);

    await expect(
      obtenerValoracionTotalUseCase.execute({ idPista })
    ).rejects.toThrow(appError);
  });
});
