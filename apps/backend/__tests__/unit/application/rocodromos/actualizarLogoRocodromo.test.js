import { describe, it, expect, jest } from '@jest/globals';
import ActualizarLogoRocodromo from '../../../../src/application/rocodromos/actualizarLogoRocodromo.js';

describe('ActualizarLogoRocodromo', () => {
  it('debería actualizar el logo de un rocodromo correctamente', async () => {
    const rocodromoActualizado = {
      id: 1,
      nombre: 'Rocodromo Test',
      logoUrl: '/uploads/logos_rocodromos/logo-1.jpg',
    };

    const mockRocodromoRepository = {
      actualizarLogoRocodromo: jest.fn().mockResolvedValue(rocodromoActualizado),
    };

    const useCase = new ActualizarLogoRocodromo(mockRocodromoRepository);

    const resultado = await useCase.execute(1, '/uploads/logos_rocodromos/logo-1.jpg');

    expect(mockRocodromoRepository.actualizarLogoRocodromo).toHaveBeenCalledWith(
      1,
      '/uploads/logos_rocodromos/logo-1.jpg'
    );
    expect(resultado).toEqual(rocodromoActualizado);
  });

  it('debera lanzar un error si el rocodromo no existe', async () => {
    const mockRocodromoRepository = {
      actualizarLogoRocodromo: jest.fn().mockResolvedValue(null),
    };

    const useCase = new ActualizarLogoRocodromo(mockRocodromoRepository);

    await expect(
      useCase.execute(999, '/uploads/logos_rocodromos/logo-999.jpg')
    ).rejects.toThrow('Rocódromo con ID 999 no encontrado');
  });
});