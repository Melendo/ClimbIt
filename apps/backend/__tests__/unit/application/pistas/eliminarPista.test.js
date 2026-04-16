import { jest } from '@jest/globals';
import EliminarPista from '../../../../src/application/pistas/eliminarPista.js';

describe('EliminarPistaUseCase', () => {
  let mockPistaRepository;
  let eliminarPista;

  beforeEach(() => {
    mockPistaRepository = {
      obtenerPorId: jest.fn(),
      desactivar: jest.fn(),
    };
    eliminarPista = new EliminarPista(mockPistaRepository);
  });

  it('deberia inactivar la pista cuando existe y esta activa', async () => {
    mockPistaRepository.obtenerPorId.mockResolvedValue({
      id: 1,
      activo: true,
    });
    mockPistaRepository.desactivar.mockResolvedValue();

    const resultado = await eliminarPista.execute({ idPista: 1 });

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(1);
    expect(mockPistaRepository.desactivar).toHaveBeenCalledWith(1);
    expect(resultado).toEqual({
      mensaje: 'Pista con ID 1 inactivada exitosamente.',
    });
  });

  it('deberia devolver mensaje si la pista ya esta inactiva', async () => {
    mockPistaRepository.obtenerPorId.mockResolvedValue({
      id: 1,
      activo: false,
    });

    const resultado = await eliminarPista.execute({ idPista: 1 });

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(1);
    expect(mockPistaRepository.desactivar).not.toHaveBeenCalled();
    expect(resultado).toEqual({
      mensaje: 'Pista con ID 1 ya esta inactiva.',
    });
  });

  it('deberia lanzar error si la pista no existe', async () => {
    mockPistaRepository.obtenerPorId.mockResolvedValue(null);

    await expect(eliminarPista.execute({ idPista: 999 })).rejects.toThrow(
      'Pista con ID 999 no encontrada'
    );

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(999);
    expect(mockPistaRepository.desactivar).not.toHaveBeenCalled();
  });

  it('deberia lanzar error si falla la desactivacion', async () => {
    mockPistaRepository.obtenerPorId.mockResolvedValue({
      id: 1,
      activo: true,
    });
    mockPistaRepository.desactivar.mockRejectedValue(
      new Error('Fallo en persistencia')
    );

    await expect(eliminarPista.execute({ idPista: 1 })).rejects.toThrow(
      'Error al eliminar la pista'
    );

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(1);
    expect(mockPistaRepository.desactivar).toHaveBeenCalledWith(1);
  });
});
