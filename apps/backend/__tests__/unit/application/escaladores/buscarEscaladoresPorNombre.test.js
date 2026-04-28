import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import BuscarEscaladoresPorNombre from '../../../../src/application/escaladores/buscarEscaladoresPorNombre.js';
import { ValidationError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('BuscarEscaladoresPorNombre Use Case', () => {
  let useCase;
  let mockEscaladorRepository;

  beforeEach(() => {
    mockEscaladorRepository = {
      buscarPorApodoSimilitud: jest.fn(),
    };
    useCase = new BuscarEscaladoresPorNombre(mockEscaladorRepository);
  });

  it('debe lanzar ValidationError si la cadena está vacía', async () => {
    await expect(useCase.execute('')).rejects.toThrow(ValidationError);
    await expect(useCase.execute('   ')).rejects.toThrow(ValidationError);
    await expect(useCase.execute(null)).rejects.toThrow(ValidationError);
  });

  it('debe devolver la lista de escaladores excluyendo información sensible', async () => {
    const mockEscaladores = [
      {
        id: 1,
        apodo: 'alex_honnold',
        correo: 'alex@test.com',
        contrasena: '123',
        idFotoPerfil: 5,
      },
      {
        id: 2,
        apodo: 'alex_megos',
        correo: 'megos@test.com',
        contrasena: '123',
        idFotoPerfil: null,
      },
    ];

    mockEscaladorRepository.buscarPorApodoSimilitud.mockResolvedValue(
      mockEscaladores
    );

    const resultado = await useCase.execute('alex', 'exclude_apodo');

    expect(
      mockEscaladorRepository.buscarPorApodoSimilitud
    ).toHaveBeenCalledWith('alex', 10, 'exclude_apodo');
    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toEqual({
      id: 1,
      apodo: 'alex_honnold',
      idFotoPerfil: 5,
    });
    expect(resultado[1]).toEqual({
      id: 2,
      apodo: 'alex_megos',
      idFotoPerfil: null,
    });
    expect(resultado[0].correo).toBeUndefined();
    expect(resultado[0].contrasena).toBeUndefined();
  });

  it('debería excluir el apodo proporcionado', async () => {
    const excludeApodo = 'excludeThis';
    const fakeEscaladores = [
      {
        id: 1,
        correo: 'a@b.com',
        contrasena: '123',
        apodo: 'Alex',
        activo: true,
      },
    ];
    mockEscaladorRepository.buscarPorApodoSimilitud.mockResolvedValue(
      fakeEscaladores
    );

    const result = await useCase.execute('al', excludeApodo);

    expect(
      mockEscaladorRepository.buscarPorApodoSimilitud
    ).toHaveBeenCalledWith('al', 10, excludeApodo);
    expect(result).toHaveLength(1);
  });
});
