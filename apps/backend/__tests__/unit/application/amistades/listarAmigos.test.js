import { jest } from '@jest/globals';
import ListarAmigos from '../../../../src/application/amistades/listarAmigos.js';
import { NotFoundError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('ListarAmigos', () => {
  let mockEscaladorRepository;
  let mockAmistadRepository;
  let useCase;

  beforeEach(() => {
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
      encontrarPorIds: jest.fn(),
    };

    mockAmistadRepository = {
      listarIdsAmigosDeEscalador: jest.fn(),
    };

    useCase = new ListarAmigos(mockEscaladorRepository, mockAmistadRepository);
  });

  it('retorna lista vacia si no tiene amigos', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({
      id: 7,
      apodo: 'ivan',
    });
    mockAmistadRepository.listarIdsAmigosDeEscalador.mockResolvedValue([]);

    const resultado = await useCase.execute({ apodoEscalador: 'ivan' });

    expect(resultado).toEqual([]);
    expect(mockEscaladorRepository.encontrarPorIds).not.toHaveBeenCalled();
  });

  it('retorna perfiles basicos de amigos', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue({
      id: 9,
      apodo: 'ivan',
    });
    mockAmistadRepository.listarIdsAmigosDeEscalador.mockResolvedValue([1, 2]);
    mockEscaladorRepository.encontrarPorIds.mockResolvedValue([
      {
        id: 1,
        apodo: 'ana',
        descripcion: 'Escaladora deportiva',
        idFotoPerfil: 10,
      },
      {
        id: 2,
        apodo: 'marco',
        descripcion: 'Boulderer',
        idFotoPerfil: 11,
      },
    ]);

    const resultado = await useCase.execute({ apodoEscalador: 'ivan' });

    expect(resultado).toEqual([
      {
        id: 1,
        apodo: 'ana',
        descripcion: 'Escaladora deportiva',
        idFotoPerfil: 10,
      },
      {
        id: 2,
        apodo: 'marco',
        descripcion: 'Boulderer',
        idFotoPerfil: 11,
      },
    ]);
  });

  it('lanza NotFound si el escalador no existe', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValue(null);

    await expect(
      useCase.execute({ apodoEscalador: 'desconocido' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
