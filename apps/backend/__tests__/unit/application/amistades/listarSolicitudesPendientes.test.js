import { jest } from '@jest/globals';
import ListarSolicitudesPendientes from '../../../../src/application/amistades/listarSolicitudesPendientes.js';
import { NotFoundError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('ListarSolicitudesPendientes', () => {
  let mockEscaladorRepository;
  let mockSolicitudAmistadRepository;
  let useCase;

  beforeEach(() => {
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };

    mockSolicitudAmistadRepository = {
      obtenerPendientesPorDestinatario: jest.fn(),
    };

    useCase = new ListarSolicitudesPendientes(
      mockEscaladorRepository,
      mockSolicitudAmistadRepository
    );
  });

  it('lanza NotFoundError si el escalador destinatario no existe', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(null);

    await expect(
      useCase.execute({ apodoEscalador: 'desconocido' })
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'desconocido'
    );
  });

  it('retorna la lista de solicitudes formateada', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({
      id: 5,
      apodo: 'destinatario',
    });

    mockSolicitudAmistadRepository.obtenerPendientesPorDestinatario.mockResolvedValue(
      [
        {
          id: 1,
          remitente: {
            id: 10,
            apodo: 'remitente1',
            descripcion: 'Desc 1',
            idFotoPerfil: null,
          },
          createdAt: '2026-04-26T00:00:00Z',
        },
        {
          id: 2,
          remitente: {
            id: 11,
            apodo: 'remitente2',
            descripcion: 'Desc 2',
            idFotoPerfil: 3,
          },
          createdAt: '2026-04-26T01:00:00Z',
        },
      ]
    );

    const resultado = await useCase.execute({ apodoEscalador: 'destinatario' });

    expect(resultado).toEqual([
      {
        idSolicitud: 1,
        idRemitente: 10,
        apodo: 'remitente1',
        descripcion: 'Desc 1',
        idFotoPerfil: null,
        createdAt: '2026-04-26T00:00:00Z',
      },
      {
        idSolicitud: 2,
        idRemitente: 11,
        apodo: 'remitente2',
        descripcion: 'Desc 2',
        idFotoPerfil: 3,
        createdAt: '2026-04-26T01:00:00Z',
      },
    ]);

    expect(mockEscaladorRepository.encontrarPorApodo).toHaveBeenCalledWith(
      'destinatario'
    );
    expect(
      mockSolicitudAmistadRepository.obtenerPendientesPorDestinatario
    ).toHaveBeenCalledWith(5);
  });

  it('retorna lista vacia si no hay solicitudes pendientes', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({
      id: 5,
      apodo: 'destinatario',
    });
    mockSolicitudAmistadRepository.obtenerPendientesPorDestinatario.mockResolvedValue(
      []
    );

    const resultado = await useCase.execute({ apodoEscalador: 'destinatario' });

    expect(resultado).toEqual([]);
  });
});
