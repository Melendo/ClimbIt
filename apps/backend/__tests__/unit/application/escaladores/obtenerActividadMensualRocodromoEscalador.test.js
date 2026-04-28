import { describe, it, expect, jest } from '@jest/globals';
import ObtenerActividadMensualRocodromoEscalador from '../../../../src/application/escaladores/obtenerActividadMensualRocodromoEscalador.js';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerActividadMensualRocodromoEscalador', () => {
  it('deberia obtener actividad mensual para escalador y rocodromo existentes', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue({ id: 9 }),
    };
    const mockRocodromoRepository = {
      encontrarPorId: jest.fn().mockResolvedValue({ id: 5 }),
    };
    const mockPistaRepository = {
      obtenerActividadMensualEscaladorPorRocodromo: jest
        .fn()
        .mockResolvedValue({
          year: 2026,
          month: 4,
          actividadMensual: [{ dia: 10, rutas: 2 }],
        }),
    };

    const useCase = new ObtenerActividadMensualRocodromoEscalador(
      mockEscaladorRepository,
      mockRocodromoRepository,
      mockPistaRepository
    );

    const resultado = await useCase.execute({
      apodo: 'Tester',
      idRocodromo: 5,
      year: 2026,
      month: 4,
    });

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'Tester'
    );
    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(5);
    expect(
      mockPistaRepository.obtenerActividadMensualEscaladorPorRocodromo
    ).toHaveBeenCalledWith(9, 5, 2026, 4);
    expect(resultado).toEqual({
      year: 2026,
      month: 4,
      actividadMensual: [{ dia: 10, rutas: 2 }],
    });
  });

  it('deberia lanzar NotFoundError si no existe escalador', async () => {
    const useCase = new ObtenerActividadMensualRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue(null) },
      { encontrarPorId: jest.fn() },
      { obtenerActividadMensualEscaladorPorRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({
        apodo: 'NoExiste',
        idRocodromo: 5,
        year: 2026,
        month: 4,
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar NotFoundError si no existe rocodromo', async () => {
    const useCase = new ObtenerActividadMensualRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue({ id: 1 }) },
      { encontrarPorId: jest.fn().mockResolvedValue(null) },
      { obtenerActividadMensualEscaladorPorRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({
        apodo: 'Tester',
        idRocodromo: 999,
        year: 2026,
        month: 4,
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar BadRequestError con month fuera de rango', async () => {
    const useCase = new ObtenerActividadMensualRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue({ id: 1 }) },
      { encontrarPorId: jest.fn().mockResolvedValue({ id: 5 }) },
      { obtenerActividadMensualEscaladorPorRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({
        apodo: 'Tester',
        idRocodromo: 5,
        year: 2026,
        month: 13,
      })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('deberia lanzar InternalServerError ante fallo inesperado', async () => {
    const useCase = new ObtenerActividadMensualRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockRejectedValue(new Error('db fail')) },
      { encontrarPorId: jest.fn() },
      { obtenerActividadMensualEscaladorPorRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'Tester', idRocodromo: 5, year: 2026, month: 4 })
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
