import { describe, it, expect, jest } from '@jest/globals';
import ObtenerActividadMensualEscalador from '../../../../src/application/escaladores/obtenerActividadMensualEscalador.js';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerActividadMensualEscalador', () => {
  it('deberia obtener actividad mensual para un escalador existente', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue({ id: 9 }),
    };
    const mockPistaRepository = {
      obtenerActividadMensualEscalador: jest.fn().mockResolvedValue({
        year: 2026,
        month: 4,
        actividadMensual: [{ dia: 10, rutas: 2 }],
      }),
    };

    const useCase = new ObtenerActividadMensualEscalador(
      mockEscaladorRepository,
      mockPistaRepository
    );

    const resultado = await useCase.execute({
      apodo: 'Tester',
      year: 2026,
      month: 4,
    });

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'Tester'
    );
    expect(
      mockPistaRepository.obtenerActividadMensualEscalador
    ).toHaveBeenCalledWith(9, 2026, 4);
    expect(resultado).toEqual({
      year: 2026,
      month: 4,
      actividadMensual: [{ dia: 10, rutas: 2 }],
    });
  });

  it('deberia lanzar NotFoundError si no existe el escalador', async () => {
    const useCase = new ObtenerActividadMensualEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue(null) },
      { obtenerActividadMensualEscalador: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'NoExiste', year: 2026, month: 4 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar BadRequestError con month fuera de rango', async () => {
    const useCase = new ObtenerActividadMensualEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue({ id: 1 }) },
      { obtenerActividadMensualEscalador: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'Tester', year: 2026, month: 13 })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('deberia lanzar InternalServerError ante fallo inesperado', async () => {
    const useCase = new ObtenerActividadMensualEscalador(
      { encontrarPorApodo: jest.fn().mockRejectedValue(new Error('db fail')) },
      { obtenerActividadMensualEscalador: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'Tester', year: 2026, month: 4 })
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
