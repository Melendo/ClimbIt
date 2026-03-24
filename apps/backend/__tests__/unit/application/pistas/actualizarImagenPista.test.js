import { describe, it, expect, jest } from '@jest/globals';
import ActualizarImagenPista from '../../../../src/application/pistas/actualizarImagenPista.js';

describe('ActualizarImagenPista', () => {
  it('debería actualizar la imagen de una pista correctamente', async () => {
    const pistaActualizada = {
      id: 1,
      idZona: 2,
      nombre: 'Pista 1',
      imagenUrl: '/uploads/imagenes_pistas/pista-1.jpg',
    };

    const mockPistaRepository = {
      actualizarImagenUrl: jest.fn().mockResolvedValue(pistaActualizada),
    };

    const useCase = new ActualizarImagenPista(mockPistaRepository);

    const resultado = await useCase.execute(1, '/uploads/imagenes_pistas/pista-1.jpg');

    expect(mockPistaRepository.actualizarImagenUrl).toHaveBeenCalledWith(
      1,
      '/uploads/imagenes_pistas/pista-1.jpg'
    );
    expect(resultado).toEqual(pistaActualizada);
  });

  it('debería lanzar un error si la pista no existe', async () => {
    const mockPistaRepository = {
      actualizarImagenUrl: jest.fn().mockResolvedValue(null),
    };

    const useCase = new ActualizarImagenPista(mockPistaRepository);

    await expect(
      useCase.execute(999, '/uploads/imagenes_pistas/pista-999.jpg')
    ).rejects.toThrow('Pista con ID 999 no encontrada');
  });
});