import { jest } from '@jest/globals';
import EliminarAmigo from '../../../../src/application/amistades/eliminarAmigo.js';
import { ConflictError, NotFoundError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('EliminarAmigo', () => {
  let mockEscaladorRepository;
  let mockAmistadRepository;
  let mockSolicitudAmistadRepository;
  let mockSequelize;
  let useCase;

  beforeEach(() => {
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };

    mockAmistadRepository = {
      existeAmistadEntreEscaladores: jest.fn(),
      eliminarPorEscaladores: jest.fn(),
    };

    mockSolicitudAmistadRepository = {
      eliminarEntreEscaladores: jest.fn(),
    };

    mockSequelize = {
      transaction: jest.fn(async (callback) => callback({ id: 'trx-del' })),
    };

    useCase = new EliminarAmigo(
      mockEscaladorRepository,
      mockAmistadRepository,
      mockSolicitudAmistadRepository,
      mockSequelize
    );
  });

  it('elimina amistad y limpia solicitudes en transaccion', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce({ id: 2, apodo: 'ana' });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(true);

    const resultado = await useCase.execute({
      apodoSolicitante: 'ivan',
      apodoAmigo: 'ana',
    });

    expect(mockSequelize.transaction).toHaveBeenCalledTimes(1);
    expect(mockAmistadRepository.eliminarPorEscaladores).toHaveBeenCalledWith(
      1,
      2,
      { id: 'trx-del' }
    );
    expect(mockSolicitudAmistadRepository.eliminarEntreEscaladores).toHaveBeenCalledWith(
      1,
      2,
      { id: 'trx-del' }
    );
    expect(resultado).toEqual({ mensaje: 'Amigo eliminado correctamente' });
  });

  it('lanza error si intenta eliminarse a si mismo', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' });

    await expect(
      useCase.execute({
        apodoSolicitante: 'ivan',
        apodoAmigo: 'ivan',
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('lanza error si no existe amistad', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce({ id: 2, apodo: 'ana' });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(false);

    await expect(
      useCase.execute({
        apodoSolicitante: 'ivan',
        apodoAmigo: 'ana',
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
