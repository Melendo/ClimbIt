import { describe, it, expect, jest } from '@jest/globals';
import ObtenerTiposEstadisticasRocodromoEscalador from '../../../../src/application/escaladores/obtenerTiposEstadisticasRocodromoEscalador.js';
import {
  InternalServerError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerTiposEstadisticasRocodromoEscalador', () => {
  it('deberia obtener tipos para escalador y rocodromo existentes', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue({ id: 4, apodo: 'Ivan' }),
    };
    const mockRocodromoRepository = {
      encontrarPorId: jest.fn().mockResolvedValue({ id: 9 }),
    };
    const mockPistaRepository = {
      obtenerTiposEstadisticasEscaladorPorRocodromo: jest
        .fn()
        .mockResolvedValue({ totalBloques: 3, totalVias: 1 }),
    };

    const useCase = new ObtenerTiposEstadisticasRocodromoEscalador(
      mockEscaladorRepository,
      mockRocodromoRepository,
      mockPistaRepository
    );

    const resultado = await useCase.execute({ apodo: 'Ivan', idRocodromo: 9 });

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith('Ivan');
    expect(mockRocodromoRepository.encontrarPorId).toHaveBeenCalledWith(9);
    expect(
      mockPistaRepository.obtenerTiposEstadisticasEscaladorPorRocodromo
    ).toHaveBeenCalledWith(4, 9);
    expect(resultado).toEqual({ totalBloques: 3, totalVias: 1 });
  });

  it('deberia lanzar NotFoundError si no existe escalador', async () => {
    const useCase = new ObtenerTiposEstadisticasRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue(null) },
      { encontrarPorId: jest.fn() },
      { obtenerTiposEstadisticasEscaladorPorRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'NoExiste', idRocodromo: 9 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar NotFoundError si no existe rocodromo', async () => {
    const useCase = new ObtenerTiposEstadisticasRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue({ id: 1 }) },
      { encontrarPorId: jest.fn().mockResolvedValue(null) },
      { obtenerTiposEstadisticasEscaladorPorRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'Ivan', idRocodromo: 999 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar InternalServerError cuando falla una dependencia', async () => {
    const useCase = new ObtenerTiposEstadisticasRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockRejectedValue(new Error('db fail')) },
      { encontrarPorId: jest.fn() },
      { obtenerTiposEstadisticasEscaladorPorRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'Ivan', idRocodromo: 9 })
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
