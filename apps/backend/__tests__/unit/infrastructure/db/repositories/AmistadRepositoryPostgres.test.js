import { jest } from '@jest/globals';
import AmistadRepositoryPostgres from '../../../../../src/infrastructure/repositories/amistadRepositoryPostgres.js';
import Amistad from '../../../../../src/domain/amistades/Amistad.js';

describe('AmistadRepositoryPostgres', () => {
  let repository;
  let mockAmistadModel;

  beforeEach(() => {
    mockAmistadModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn(),
    };

    repository = new AmistadRepositoryPostgres(mockAmistadModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('_toDomain mapea correctamente a entidad Amistad', () => {
    const domain = repository._toDomain({
      id: 7,
      idEscalador1: 2,
      idEscalador2: 5,
      fechaInicio: new Date('2026-04-25T00:00:00.000Z'),
    });

    expect(domain).toBeInstanceOf(Amistad);
    expect(domain.id).toBe(7);
    expect(domain.idEscalador1).toBe(2);
    expect(domain.idEscalador2).toBe(5);
  });

  it('crear persiste y retorna entidad de dominio', async () => {
    const amistad = new Amistad(null, 1, 2, new Date('2026-04-25T00:00:00.000Z'));
    mockAmistadModel.create.mockResolvedValue({
      id: 10,
      idEscalador1: 1,
      idEscalador2: 2,
      fechaInicio: amistad.fechaInicio,
    });

    const result = await repository.crear(amistad);

    expect(mockAmistadModel.create).toHaveBeenCalledWith(
      {
        idEscalador1: 1,
        idEscalador2: 2,
        fechaInicio: amistad.fechaInicio,
      },
      { transaction: null }
    );
    expect(result).toBeInstanceOf(Amistad);
    expect(result.id).toBe(10);
  });

  it('existeAmistadEntreEscaladores ordena IDs antes de consultar', async () => {
    mockAmistadModel.findOne.mockResolvedValue({ id: 1 });

    const exists = await repository.existeAmistadEntreEscaladores(9, 3);

    expect(mockAmistadModel.findOne).toHaveBeenCalledWith({
      where: {
        idEscalador1: 3,
        idEscalador2: 9,
      },
    });
    expect(exists).toBe(true);
  });

  it('eliminarPorEscaladores retorna true cuando elimina filas', async () => {
    mockAmistadModel.destroy.mockResolvedValue(1);

    const deleted = await repository.eliminarPorEscaladores(9, 3);

    expect(mockAmistadModel.destroy).toHaveBeenCalledWith({
      where: {
        idEscalador1: 3,
        idEscalador2: 9,
      },
      transaction: null,
    });
    expect(deleted).toBe(true);
  });

  it('listarIdsAmigosDeEscalador retorna IDs del otro lado de la amistad', async () => {
    mockAmistadModel.findAll.mockResolvedValue([
      { idEscalador1: 1, idEscalador2: 2 },
      { idEscalador1: 3, idEscalador2: 1 },
    ]);

    const ids = await repository.listarIdsAmigosDeEscalador(1);

    expect(ids).toEqual([2, 3]);
  });
});
