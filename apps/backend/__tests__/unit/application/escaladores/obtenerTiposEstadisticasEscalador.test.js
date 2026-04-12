import { describe, it, expect, jest } from '@jest/globals';
import ObtenerTiposEstadisticasEscalador from '../../../../src/application/escaladores/obtenerTiposEstadisticasEscalador.js';
import { InternalServerError, NotFoundError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerTiposEstadisticasEscalador', () => {
  it('deberia obtener distribucion por tipo para un escalador existente', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue({ id: 3, apodo: 'Climber' }),
    };
    const mockPistaRepository = {
      obtenerTiposEstadisticasEscalador: jest.fn().mockResolvedValue({
        totalBloques: 8,
        totalVias: 4,
        porcentajeBloques: 66.67,
        porcentajeVias: 33.33,
        favoritaTexto: 'Bloque',
      }),
    };

    const useCase = new ObtenerTiposEstadisticasEscalador(
      mockEscaladorRepository,
      mockPistaRepository
    );

    const resultado = await useCase.execute({ apodo: 'Climber' });

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'Climber'
    );
    expect(mockPistaRepository.obtenerTiposEstadisticasEscalador).toHaveBeenCalledWith(3);
    expect(resultado).toEqual({
      totalBloques: 8,
      totalVias: 4,
      porcentajeBloques: 66.67,
      porcentajeVias: 33.33,
      favoritaTexto: 'Bloque',
    });
  });

  it('deberia lanzar NotFoundError si el escalador no existe', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue(null),
    };
    const mockPistaRepository = {
      obtenerTiposEstadisticasEscalador: jest.fn(),
    };

    const useCase = new ObtenerTiposEstadisticasEscalador(
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
      obtenerTiposEstadisticasEscalador: jest.fn(),
    };

    const useCase = new ObtenerTiposEstadisticasEscalador(
      mockEscaladorRepository,
      mockPistaRepository
    );

    await expect(useCase.execute({ apodo: 'Climber' })).rejects.toBeInstanceOf(
      InternalServerError
    );
  });
});