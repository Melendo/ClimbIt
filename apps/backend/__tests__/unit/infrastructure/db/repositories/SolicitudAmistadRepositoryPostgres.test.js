import { jest } from '@jest/globals';
import SolicitudAmistadRepositoryPostgres from '../../../../../src/infrastructure/repositories/solicitudAmistadRepositoryPostgres.js';
import SolicitudAmistad from '../../../../../src/domain/amistades/SolicitudAmistad.js';

describe('SolicitudAmistadRepositoryPostgres', () => {
  let repository;
  let mockSolicitudModel;

  beforeEach(() => {
    mockSolicitudModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      destroy: jest.fn(),
    };

    repository = new SolicitudAmistadRepositoryPostgres(mockSolicitudModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('_toDomain mapea correctamente a entidad SolicitudAmistad', () => {
    const domain = repository._toDomain({
      id: 5,
      idRemitente: 2,
      idDestinatario: 8,
      estado: 'pendiente',
      createdAt: new Date('2026-04-25T00:00:00.000Z'),
    });

    expect(domain).toBeInstanceOf(SolicitudAmistad);
    expect(domain.id).toBe(5);
    expect(domain.idRemitente).toBe(2);
    expect(domain.idDestinatario).toBe(8);
    expect(domain.estado).toBe('pendiente');
  });

  it('crear persiste y retorna entidad de dominio', async () => {
    const solicitud = new SolicitudAmistad(null, 1, 2, 'pendiente');
    mockSolicitudModel.create.mockResolvedValue({
      id: 20,
      idRemitente: 1,
      idDestinatario: 2,
      estado: 'pendiente',
      createdAt: new Date('2026-04-25T00:00:00.000Z'),
    });

    const result = await repository.crear(solicitud);

    expect(mockSolicitudModel.create).toHaveBeenCalledWith(
      {
        idRemitente: 1,
        idDestinatario: 2,
        estado: 'pendiente',
      },
      { transaction: null }
    );
    expect(result).toBeInstanceOf(SolicitudAmistad);
    expect(result.id).toBe(20);
  });

  it('existePendienteEntreEscaladores retorna true si encuentra solicitud', async () => {
    mockSolicitudModel.findOne.mockResolvedValue({ id: 1 });

    const exists = await repository.existePendienteEntreEscaladores(1, 2);

    expect(mockSolicitudModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ estado: 'pendiente' }),
      })
    );
    expect(exists).toBe(true);
  });

  it('actualizarEstado retorna null si no existe solicitud', async () => {
    mockSolicitudModel.findByPk.mockResolvedValue(null);

    const result = await repository.actualizarEstado(99, 'aceptada');

    expect(result).toBeNull();
  });

  it('eliminarPorId retorna true cuando elimina filas', async () => {
    mockSolicitudModel.destroy.mockResolvedValue(1);

    const deleted = await repository.eliminarPorId(9);

    expect(mockSolicitudModel.destroy).toHaveBeenCalledWith({
      where: { id: 9 },
      transaction: null,
    });
    expect(deleted).toBe(true);
  });

  it('eliminarEntreEscaladores delega destroy con filtro bidireccional', async () => {
    mockSolicitudModel.destroy.mockResolvedValue(2);

    const count = await repository.eliminarEntreEscaladores(1, 2);

    expect(mockSolicitudModel.destroy).toHaveBeenCalledWith(
      expect.objectContaining({ transaction: null })
    );
    expect(count).toBe(2);
  });
});
