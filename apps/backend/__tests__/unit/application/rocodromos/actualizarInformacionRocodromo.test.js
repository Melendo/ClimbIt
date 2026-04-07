import { describe, it, expect, jest } from '@jest/globals';
import ActualizarInformacionRocodromo from '../../../../src/application/rocodromos/actualizarInformacionRocodromo.js';
import { NotFoundError } from '../../../../src/domain/sharedObjects/AppError.js';

describe('ActualizarInformacionRocodromo', () => {
  it('deberia actualizar la informacion del rocodromo', async () => {
    const rocodromoActual = {
      id: 1,
      nombre: 'Roco Test',
      ubicacion: 'Ubicacion Test',
      logoUrl: null,
      descripcion: null,
      horarios: null,
      dificultadBloque: 1,
      dificultadVia: 2,
      activo: true,
    };

    const rocodromoActualizado = {
      ...rocodromoActual,
      nombre: 'Roco Actualizado',
      ubicacion: 'Nueva Ubicacion',
      descripcion: 'Descripcion',
      horarios: 'L-V 10-22',
    };

    const rocodromoRepository = {
      encontrarPorId: jest.fn().mockResolvedValue(rocodromoActual),
      actualizarInformacion: jest.fn().mockResolvedValue(rocodromoActualizado),
    };

    const escalaDificultadModel = {
      findByPk: jest.fn(),
    };

    const useCase = new ActualizarInformacionRocodromo(
      rocodromoRepository,
      escalaDificultadModel
    );

    const resultado = await useCase.execute({
      idRocodromo: 1,
      nombre: 'Roco Actualizado',
      ubicacion: 'Nueva Ubicacion',
      descripcion: 'Descripcion',
      horarios: 'L-V 10-22',
    });

    expect(rocodromoRepository.encontrarPorId).toHaveBeenCalledWith(1);
    expect(escalaDificultadModel.findByPk).not.toHaveBeenCalled();
    expect(rocodromoRepository.actualizarInformacion).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Roco Actualizado',
        ubicacion: 'Nueva Ubicacion',
        descripcion: 'Descripcion',
        horarios: 'L-V 10-22',
      })
    );
    expect(resultado).toEqual(rocodromoActualizado);
  });

  it('deberia lanzar error si el rocodromo no existe', async () => {
    const rocodromoRepository = {
      encontrarPorId: jest.fn().mockResolvedValue(null),
      actualizarInformacion: jest.fn(),
    };

    const escalaDificultadModel = {
      findByPk: jest.fn(),
    };

    const useCase = new ActualizarInformacionRocodromo(
      rocodromoRepository,
      escalaDificultadModel
    );

    await expect(useCase.execute({ idRocodromo: 999 })).rejects.toThrow(
      NotFoundError
    );
  });
});
