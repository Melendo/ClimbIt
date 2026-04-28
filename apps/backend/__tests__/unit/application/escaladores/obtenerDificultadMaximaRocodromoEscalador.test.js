import { describe, it, expect, jest } from '@jest/globals';
import ObtenerDificultadMaximaRocodromoEscalador from '../../../../src/application/escaladores/obtenerDificultadMaximaRocodromoEscalador.js';
import {
  InternalServerError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ObtenerDificultadMaximaRocodromoEscalador', () => {
  it('deberia obtener maximas por tipo para escalador y rocodromo existentes', async () => {
    const mockEscaladorRepository = {
      encontrarPorApodo: jest.fn().mockResolvedValue({ id: 4, apodo: 'Ivan' }),
    };
    const mockRocodromoRepository = {
      encontrarPorId: jest.fn().mockResolvedValue({ id: 9 }),
      obtenerEscalasDificultad: jest.fn().mockResolvedValue({
        escalaDificultadBloque: { dificultades: ['V2', 'V4', 'V6'] },
        escalaDificultadVia: { dificultades: ['6a', '6b', '7a'] },
      }),
    };
    const mockPistaRepository = {
      obtenerDificultadesEscaladasPorTipoEnRocodromo: jest
        .fn()
        .mockResolvedValue({
          boulder: ['V2', 'V6'],
          via: ['6b'],
        }),
    };

    const useCase = new ObtenerDificultadMaximaRocodromoEscalador(
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
      mockPistaRepository.obtenerDificultadesEscaladasPorTipoEnRocodromo
    ).toHaveBeenCalledWith(4, 9);
    expect(
      mockRocodromoRepository.obtenerEscalasDificultad
    ).toHaveBeenCalledWith(9);
    expect(resultado).toEqual({
      maxDificultadBloque: 'V6',
      maxDificultadVia: '6b',
    });
  });

  it('deberia retornar null en ambos tipos cuando no hay datos', async () => {
    const useCase = new ObtenerDificultadMaximaRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue({ id: 1 }) },
      {
        encontrarPorId: jest.fn().mockResolvedValue({ id: 9 }),
        obtenerEscalasDificultad: jest.fn().mockResolvedValue(null),
      },
      {
        obtenerDificultadesEscaladasPorTipoEnRocodromo: jest
          .fn()
          .mockResolvedValue({ boulder: [], via: [] }),
      }
    );

    await expect(
      useCase.execute({ apodo: 'Ivan', idRocodromo: 9 })
    ).resolves.toEqual({
      maxDificultadBloque: null,
      maxDificultadVia: null,
    });
  });

  it('deberia lanzar NotFoundError si no existe escalador', async () => {
    const useCase = new ObtenerDificultadMaximaRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue(null) },
      {
        encontrarPorId: jest.fn(),
        obtenerEscalasDificultad: jest.fn(),
      },
      { obtenerDificultadesEscaladasPorTipoEnRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'NoExiste', idRocodromo: 9 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar NotFoundError si no existe rocodromo', async () => {
    const useCase = new ObtenerDificultadMaximaRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockResolvedValue({ id: 1 }) },
      {
        encontrarPorId: jest.fn().mockResolvedValue(null),
        obtenerEscalasDificultad: jest.fn(),
      },
      { obtenerDificultadesEscaladasPorTipoEnRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'Ivan', idRocodromo: 999 })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deberia lanzar InternalServerError cuando falla una dependencia', async () => {
    const useCase = new ObtenerDificultadMaximaRocodromoEscalador(
      { encontrarPorApodo: jest.fn().mockRejectedValue(new Error('db fail')) },
      {
        encontrarPorId: jest.fn(),
        obtenerEscalasDificultad: jest.fn(),
      },
      { obtenerDificultadesEscaladasPorTipoEnRocodromo: jest.fn() }
    );

    await expect(
      useCase.execute({ apodo: 'Ivan', idRocodromo: 9 })
    ).rejects.toBeInstanceOf(InternalServerError);
  });
});
