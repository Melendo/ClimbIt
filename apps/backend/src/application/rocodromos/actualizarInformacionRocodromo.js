import Rocodromo from '../../domain/rocodromos/Rocodromo.js';
import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarInformacionRocodromo {
  constructor(rocodromoRepository, escalaDificultadModel) {
    this.rocodromoRepository = rocodromoRepository;
    this.escalaDificultadModel = escalaDificultadModel;
  }

  async execute({
    idRocodromo,
    nombre,
    ubicacion,
    descripcion,
    horarios,
    dificultadBloque,
    dificultadVia,
  }) {
    try {
      const existente =
        await this.rocodromoRepository.encontrarPorId(idRocodromo);

      if (!existente) {
        throw new NotFoundError(
          `Rocodromo con ID ${idRocodromo} no encontrado`,
          'ROCODROMO_NOT_FOUND'
        );
      }

      if (dificultadBloque !== undefined && dificultadBloque !== null) {
        const escalaBloque =
          await this.escalaDificultadModel.findByPk(dificultadBloque);

        if (!escalaBloque) {
          throw new NotFoundError(
            `La escala de dificultad de bloque con ID ${dificultadBloque} no existe`,
            'ESCALA_DIFICULTAD_BLOQUE_NOT_FOUND'
          );
        }
      }

      if (dificultadVia !== undefined && dificultadVia !== null) {
        const escalaVia =
          await this.escalaDificultadModel.findByPk(dificultadVia);

        if (!escalaVia) {
          throw new NotFoundError(
            `La escala de dificultad de via con ID ${dificultadVia} no existe`,
            'ESCALA_DIFICULTAD_VIA_NOT_FOUND'
          );
        }
      }

      const resolveValue = (value, fallback) =>
        value !== undefined ? value : fallback;

      const rocodromoActualizado = new Rocodromo(
        existente.id,
        resolveValue(nombre, existente.nombre),
        ubicacion,
        existente.logoUrl,
        descripcion,
        horarios,
        resolveValue(dificultadBloque, existente.dificultadBloque),
        resolveValue(dificultadVia, existente.dificultadVia),
        existente.activo
      );

      return await this.rocodromoRepository.actualizarInformacion(
        rocodromoActualizado
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar la informacion del rocodromo',
        'ROCODROMO_UPDATE_FAILED',
        error
      );
    }
  }
}

export default ActualizarInformacionRocodromo;
