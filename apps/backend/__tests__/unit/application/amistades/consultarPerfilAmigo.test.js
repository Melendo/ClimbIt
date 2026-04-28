import { jest } from '@jest/globals';
import ConsultarPerfilAmigo from '../../../../src/application/amistades/consultarPerfilAmigo.js';
import {
  AuthorizationError,
  NotFoundError,
} from '../../../../src/domain/sharedObjects/AppError.js';

describe('ConsultarPerfilAmigo', () => {
  let mockEscaladorRepository;
  let mockAmistadRepository;
  let useCase;

  beforeEach(() => {
    mockEscaladorRepository = {
      encontrarPorApodo: jest.fn(),
    };

    mockAmistadRepository = {
      existeAmistadEntreEscaladores: jest.fn(),
    };

    useCase = new ConsultarPerfilAmigo(
      mockEscaladorRepository,
      mockAmistadRepository
    );
  });

  it('retorna el perfil cuando existe amistad', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce({
        id: 2,
        correo: 'ana@mail.com',
        apodo: 'ana',
        descripcion: 'Escaladora',
        idFotoPerfil: 5,
      });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(true);

    const resultado = await useCase.execute({
      apodoSolicitante: 'ivan',
      apodoPerfil: 'ana',
    });

    expect(resultado).toEqual({
      id: 2,
      correo: 'ana@mail.com',
      apodo: 'ana',
      descripcion: 'Escaladora',
      idFotoPerfil: 5,
    });
  });

  it('lanza NotFound si solicitante no existe', async () => {
    mockEscaladorRepository.encontrarPorApodo.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ apodoSolicitante: 'x', apodoPerfil: 'ana' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFound si perfil no existe', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ apodoSolicitante: 'ivan', apodoPerfil: 'ana' })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza AuthorizationError si no existe amistad', async () => {
    mockEscaladorRepository.encontrarPorApodo
      .mockResolvedValueOnce({ id: 1, apodo: 'ivan' })
      .mockResolvedValueOnce({ id: 2, apodo: 'ana' });
    mockAmistadRepository.existeAmistadEntreEscaladores.mockResolvedValue(
      false
    );

    await expect(
      useCase.execute({ apodoSolicitante: 'ivan', apodoPerfil: 'ana' })
    ).rejects.toBeInstanceOf(AuthorizationError);
  });
});
