import { jest } from '@jest/globals';
import EnviarSolicitudAmistad from '../../../../src/application/amistades/enviarSolicitudAmistad.js';
import {
  ConflictError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('EnviarSolicitudAmistad', () => {
  let mockEscaladorRepository;
  let mockSolicitudAmistadRepository;
  let mockAmistadRepository;
  let useCase;

  beforeEach(() => {
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };

    mockSolicitudAmistadRepository = {
      existePendienteEntreEscaladores: jest.fn(),
      crear: jest.fn(),
    };

    mockAmistadRepository = {
      existeAmistadEntreEscaladores: jest.fn(),
    };

    useCase = new EnviarSolicitudAmistad(
      mockEscaladorRepository,
      mockSolicitudAmistadRepository,
      mockAmistadRepository
    );
  });

  it('crea solicitud si no hay amistad ni pendientes', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce({ id: 2, apodo: 'ana' });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(
      false
    );
    mockSolicitudAmistadRepository.existePendienteEntreEscaladores.mockResolvedValue(
      false
    );
    mockSolicitudAmistadRepository.crear.mockResolvedValue({
      id: 10,
      idRemitente: 1,
      idDestinatario: 2,
      estado: 'pendiente',
    });

    const resultado = await useCase.execute({
      apodoRemitente: 'ivan',
      apodoDestinatario: 'ana',
    });

    expect(resultado.mensaje).toBe(
      'Solicitud de amistad enviada correctamente'
    );
    expect(resultado.solicitud).toEqual({
      id: 10,
      idRemitente: 1,
      idDestinatario: 2,
      estado: 'pendiente',
    });
  });

  it('lanza NotFound si destinatario no existe', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ apodoRemitente: 'ivan', apodoDestinatario: 'ana' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza Conflict si ya hay amistad', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce({ id: 2, apodo: 'ana' });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(true);

    await expect(
      useCase.execute({ apodoRemitente: 'ivan', apodoDestinatario: 'ana' })
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
