import { describe, it, expect, jest } from '@jest/globals';
import ObtenerResumenEstadisticasRocodromoEscalador from '../../../../src/application/escaladores/obtenerResumenEstadisticasRocodromoEscalador.js';
import {
  InternalServerError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerResumenEstadisticasRocodromoEscalador', () => {
  it('deberia obtener resumen para escalador y rocodromo existentes', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue({ id: 4, apodo: 'Ivan' }),
    };
    const mockRocodromoRepository = {
      encontrarPorId: jest.fn().mockResolvedValue({ id: 9 }),
    };
    const mockPistaRepository = {
      obtenerResumenEstadisticasEscaladorPorRocodromo: jest
        .fn()
        .mockResolvedValue({ totalRutas: 5, totalFlash: 2 }),
      obtenerTotalPistasActivasPorRocodromo: jest.fn().mockResolvedValue(12),
    };

    const useCase = new ObtenerResumenEstadisticasRocodromoEscalador(
      mockEscaladorRepository,
      mockRocodromoRepository,
      mockPistaRepository
    );

    const resultado = await useCase.execute({ apodo: 'Ivan', idRocodromo: 9 });

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'Ivan'
    );
    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(9);
    expect(
      mockPistaRepository.obtenerResumenEstadisticasEscaladorPorRocodromo
    ).toHaveBeenCalledWith(4, 9);
    expect(
      mockPistaRepository.obtenerTotalPistasActivasPorRocodromo
    ).toHaveBeenCalledWith(9);
    expect(resultado).toEqual({
      totalRutas: 5,
      totalFlash: 2,
      totalRutasActivasRocodromo: 12,
    });
  });

  it('deberia lanzar NotFoundError si no existe escalador', async () => {
    const useCase = new ObtenerResumenEstadisticasRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue(null) },
      { encontrarPorId: jest.fn() },
      {
        obtenerResumenEstadisticasEscaladorPorRocodromo: jest.fn(),
        obtenerTotalPistasActivasPorRocodromo: jest.fn(),
      }
    );

    await expect(
      useCase.execute({ apodo: 'NoExiste', idRocodromo: 9 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar NotFoundError si no existe rocodromo', async () => {
    const useCase = new ObtenerResumenEstadisticasRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue({ id: 1 }) },
      { encontrarPorId: jest.fn().mockResolvedValue(null) },
      {
        obtenerResumenEstadisticasEscaladorPorRocodromo: jest.fn(),
        obtenerTotalPistasActivasPorRocodromo: jest.fn(),
      }
    );

    await expect(
      useCase.execute({ apodo: 'Ivan', idRocodromo: 999 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar InternalServerError cuando falla una dependencia', async () => {
    const useCase = new ObtenerResumenEstadisticasRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockRejectedValue(new Error('db fail')) },
      { encontrarPorId: jest.fn() },
      {
        obtenerResumenEstadisticasEscaladorPorRocodromo: jest.fn(),
        obtenerTotalPistasActivasPorRocodromo: jest.fn(),
      }
    );

    await expect(
      useCase.execute({ apodo: 'Ivan', idRocodromo: 9 })
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
