import Rocodromo from '../../domain/rocodromos/Rocodromo.js';
import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class CrearRocodromo {
  constructor(rocodromoRepository) {
    this.rocodromoRepository = rocodromoRepository;
  }

  async execute(rocodromoData) {
    try {
      const nuevoRocodromo = new Rocodromo(
        null,
        rocodromoData.nombre,
        rocodromoData.ubicacion,
        rocodromoData.logoUrl,
        rocodromoData.descripcion,
        rocodromoData.horarios,
        rocodromoData.dificultadBloque,
        rocodromoData.dificultadVia
      );
      const creado =
        await this.rocodromoRepository.crearRocodromo(nuevoRocodromo);
      return creado;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al crear el rocódromo',
        'ROCODROMO_CREATE_FAILED',
        error
      );
    }
  }
}

export default CrearRocodromo;
