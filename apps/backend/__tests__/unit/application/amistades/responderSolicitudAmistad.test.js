import { jest } from '@jest/globals';
import ResponderSolicitudAmistad from '../../../../src/application/amistades/responderSolicitudAmistad.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('ResponderSolicitudAmistad', () => {
  let mockEscaladorRepository;
  let mockSolicitudAmistadRepository;
  let mockAmistadRepository;
  let mockSequelize;
  let useCase;

  beforeEach(() => {
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };

    mockSolicitudAmistadRepository = {
      encontrarPorId: jest.fn(),
      actualizarEstado: jest.fn(),
    };

    mockAmistadRepository = {
      existeAmistadEntreEscaladores: jest.fn(),
      crear: jest.fn(),
    };

    mockSequelize = {
      transaction: jest.fn(async (callback) => callback({ id: 'trx-1' })),
    };

    useCase = new ResponderSolicitudAmistad(
      mockEscaladorRepository,
      mockSolicitudAmistadRepository,
      mockAmistadRepository,
      mockSequelize
    );
  });

  it('acepta solicitud y crea amistad en transaccion', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({
      id: 7,
      apodo: 'destino',
    });
    mockSolicitudAmistadRepository.encontrarPorId.mockResolvedValue({
      id: 11,
      idRemitente: 9,
      idDestinatario: 7,
      estado: 'pendiente',
    });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(false);
    mockSolicitudAmistadRepository.actualizarEstado.mockResolvedValue({ id: 11, estado: 'aceptada' });
    mockAmistadRepository.crear.mockResolvedValue({
      id: 22,
      idEscalador1: 7,
      idEscalador2: 9,
      fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
    });

    const resultado = await useCase.execute({
      apodoDestinatario: 'destino',
      idSolicitud: 11,
      respuesta: 'aceptada',
    });

    expect(mockSequelize.transaction).toHaveBeenCalledTimes(1);
    expect(mockSolicitudAmistadRepository.actualizarEstado).toHaveBeenCalledWith(
      11,
      'aceptada',
      { id: 'trx-1' }
    );
    expect(mockAmistadRepository.crear).toHaveBeenCalledTimes(1);
    expect(resultado.solicitud).toEqual({ id: 11, estado: 'aceptada' });
    expect(resultado.amistad).toBeTruthy();
  });

  it('rechaza solicitud sin crear amistad', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({
      id: 5,
      apodo: 'destino',
    });
    mockSolicitudAmistadRepository.encontrarPorId.mockResolvedValue({
      id: 33,
      idRemitente: 2,
      idDestinatario: 5,
      estado: 'pendiente',
    });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(false);
    mockSolicitudAmistadRepository.actualizarEstado.mockResolvedValue({ id: 33, estado: 'rechazada' });

    const resultado = await useCase.execute({
      apodoDestinatario: 'destino',
      idSolicitud: 33,
      respuesta: 'rechazada',
    });

    expect(mockSolicitudAmistadRepository.actualizarEstado).toHaveBeenCalledWith(
      33,
      'rechazada',
      { id: 'trx-1' }
    );
    expect(mockAmistadRepository.crear).not.toHaveBeenCalled();
    expect(resultado.solicitud).toEqual({ id: 33, estado: 'rechazada' });
    expect(resultado.amistad).toBeNull();
  });

  it('falla si la respuesta no es valida', async () => {
    await expect(
      useCase.execute({
        apodoDestinatario: 'destino',
        idSolicitud: 9,
        respuesta: 'otro',
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('falla si la solicitud no existe', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({ id: 5, apodo: 'destino' });
    mockSolicitudAmistadRepository.encontrarPorId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        apodoDestinatario: 'destino',
        idSolicitud: 999,
        respuesta: 'aceptada',
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('falla si la solicitud ya fue respondida', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({ id: 7, apodo: 'destino' });
    mockSolicitudAmistadRepository.encontrarPorId.mockResolvedValue({
      id: 1,
      idRemitente: 2,
      idDestinatario: 7,
      estado: 'aceptada',
    });

    await expect(
      useCase.execute({
        apodoDestinatario: 'destino',
        idSolicitud: 1,
        respuesta: 'aceptada',
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('falla si ya existe amistad', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({ id: 7, apodo: 'destino' });
    mockSolicitudAmistadRepository.encontrarPorId.mockResolvedValue({
      id: 55,
      idRemitente: 3,
      idDestinatario: 7,
      estado: 'pendiente',
    });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(true);

    await expect(
      useCase.execute({
        apodoDestinatario: 'destino',
        idSolicitud: 55,
        respuesta: 'aceptada',
      })
    ).rejects.toBeInstanceOf(ConflictError);

    expect(mockSequelize.transaction).not.toHaveBeenCalled();
  });
});
