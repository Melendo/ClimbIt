import { jest } from '@jest/globals';
import ActualizarPista from '../../../../src/application/pistas/actualizarPista.js';

describe('ActualizarPistaUseCase', () => {
  let mockPistaRepository;
  let mockZonaModel;
  let actualizarPista;

  beforeEach(() => {
    mockPistaRepository = {
      obtenerPorId: jest.fn(),
      actualizar: jest.fn(),
    };
    mockZonaModel = {
      findByPk: jest.fn(),
    };
    actualizarPista = new ActualizarPista(mockPistaRepository, mockZonaModel);
  });

  it('deberia actualizar la pista con los nuevos datos', async () => {
    const pistaActual = {
      id: 1,
      idZona: 2,
      nombre: 'Pista Original',
      dificultad: '6a',
      tipo: 'via',
      colorPresas: 'Rojo',
      imagenUrl: null,
      posX: 1,
      posY: 2,
      fechaCreacion: new Date('2024-01-01T00:00:00.000Z'),
      fechaRetirada: null,
      activo: true,
    };

    mockPistaRepository.obtenerPorId.mockResolvedValue(pistaActual);
    mockPistaRepository.actualizar.mockResolvedValue({
      ...pistaActual,
      nombre: 'Pista Actualizada',
      dificultad: '6b',
    });

    const resultado = await actualizarPista.execute({
      idPista: 1,
      nombre: 'Pista Actualizada',
      dificultad: '6b',
    });

    expect(mockPistaRepository.obtenerPorId).toHaveBeenCalledWith(1);
    expect(mockPistaRepository.actualizar).toHaveBeenCalled();

    const pistaActualizada = mockPistaRepository.actualizar.mock.calls[0][0];
    expect(pistaActualizada.id).toBe(1);
    expect(pistaActualizada.idZona).toBe(2);
    expect(pistaActualizada.nombre).toBe('Pista Actualizada');
    expect(pistaActualizada.dificultad).toBe('6b');
    expect(pistaActualizada.tipo).toBe('via');

    expect(resultado).toMatchObject({
      id: 1,
      nombre: 'Pista Actualizada',
      dificultad: '6b',
    });
  });

  it('deberia validar que la zona exista cuando se envia idZona', async () => {
    mockPistaRepository.obtenerPorId.mockResolvedValue({
      id: 1,
      idZona: 2,
      nombre: 'Pista Original',
      dificultad: '6a',
      tipo: 'via',
      colorPresas: 'Rojo',
      imagenUrl: null,
      posX: null,
      posY: null,
      fechaCreacion: new Date('2024-01-01T00:00:00.000Z'),
      fechaRetirada: null,
      activo: true,
    });
    mockZonaModel.findByPk.mockResolvedValue(null);

    await expect(
      actualizarPista.execute({ idPista: 1, idZona: 999 })
    ).rejects.toThrow('La zona con ID 999 no existe');

    expect(mockZonaModel.findByPk).toHaveBeenCalledWith(999);
    expect(mockPistaRepository.actualizar).not.toHaveBeenCalled();
  });

  it('deberia lanzar error si la pista no existe', async () => {
    mockPistaRepository.obtenerPorId.mockResolvedValue(null);

    await expect(
      actualizarPista.execute({ idPista: 999, nombre: 'Nueva' })
    ).rejects.toThrow('Pista con ID 999 no encontrada');

    expect(mockPistaRepository.actualizar).not.toHaveBeenCalled();
  });

  it('deberia lanzar error si falla la actualizacion', async () => {
    mockPistaRepository.obtenerPorId.mockResolvedValue({
      id: 1,
      idZona: 2,
      nombre: 'Pista Original',
      dificultad: '6a',
      tipo: 'via',
      colorPresas: null,
      imagenUrl: null,
      posX: null,
      posY: null,
      fechaCreacion: new Date('2024-01-01T00:00:00.000Z'),
      fechaRetirada: null,
      activo: true,
    });
    mockPistaRepository.actualizar.mockRejectedValue(
      new Error('Fallo en persistencia')
    );

    await expect(
      actualizarPista.execute({ idPista: 1, nombre: 'Nueva' })
    ).rejects.toThrow('Error al actualizar la pista');
  });
});
