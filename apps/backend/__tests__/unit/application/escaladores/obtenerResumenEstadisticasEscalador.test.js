import { describe, it, expect, jest } from '@jest/globals';
import ObtenerResumenEstadisticasEscalador from '../../../../src/application/escaladores/obtenerResumenEstadisticasEscalador.js';
import {
  InternalServerError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerResumenEstadisticasEscalador', () => {
  it('deberia obtener el resumen de estadisticas de un escalador existente', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue({ id: 4, apodo: 'Ivan' }),
    };
    const mockPistaRepository = {
      obtenerResumenEstadisticasEscalador: jest.fn().mockResolvedValue({
        totalRutas: 12,
        totalFlash: 5,
        totalCompletado: 7,
        totalProyecto: 2,
        porcentajeFlash: 41.67,
      }),
    };

    const useCase = new ObtenerResumenEstadisticasEscalador(
      mockEscaladorRepository,
      mockPistaRepository
    );

    const resultado = await useCase.execute({ apodo: 'Ivan' });

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'Ivan'
    );
    expect(
      mockPistaRepository.obtenerResumenEstadisticasEscalador
    ).toHaveBeenCalledWith(4);
    expect(resultado).toEqual({
      totalRutas: 12,
      totalFlash: 5,
      totalCompletado: 7,
      totalProyecto: 2,
      porcentajeFlash: 41.67,
    });
  });

  it('deberia lanzar NotFoundError si el escalador no existe', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue(null),
    };
    const mockPistaRepository = {
      obtenerResumenEstadisticasEscalador: jest.fn(),
    };

    const useCase = new ObtenerResumenEstadisticasEscalador(
      mockEscaladorRepository,
      mockPistaRepository
    );

    await expect(useCase.execute({ apodo: 'NoExiste' })).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it('deberia lanzar InternalServerError cuando falla una dependencia', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockRejectedValue(new Error('db fail')),
    };
    const mockPistaRepository = {
      obtenerResumenEstadisticasEscalador: jest.fn(),
    };

    const useCase = new ObtenerResumenEstadisticasEscalador(
      mockEscaladorRepository,
      mockPistaRepository
    );

    await expect(useCase.execute({ apodo: 'Ivan' })).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});
