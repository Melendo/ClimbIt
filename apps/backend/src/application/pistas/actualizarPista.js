import Pista from '../../domain/pistas/Pista.js';
import {
  AppError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../../domain/sharedObjects/AppError.js';

class ActualizarPista {
  constructor(pistaRepository, zonaModel, rocodromoRepository) {
    this.pistaRepository = pistaRepository;
    this.zonaModel = zonaModel;
    this.rocodromoRepository = rocodromoRepository;
  }

  async execute({
    idPista,
    idZona,
    nombre,
    tipo,
    dificultad,
    colorPresas,
    posX,
    posY,
    fechaCreacion,
    fechaRetirada,
  }) {
    try {
      const pistaActual = await this.pistaRepository.obtenerPorId(idPista);
      if (!pistaActual) {
        throw new NotFoundError(
          `Pista con ID ${idPista} no encontrada`,
          'PISTA_NOT_FOUND'
        );
      }

      let zonaExistente = null;
      if (idZona !== undefined && idZona !== null) {
        zonaExistente = await this.zonaModel.findByPk(idZona);
        if (!zonaExistente) {
          throw new NotFoundError(
            `La zona con ID ${idZona} no existe`,
            'ZONA_NOT_FOUND'
          );
        }
      }

      const resolveValue = (value, fallback) =>
        value !== undefined ? value : fallback;

      if (dificultad !== undefined && dificultad !== null && dificultad !== '') {
        const zonaIdForValidation = resolveValue(idZona, pistaActual.idZona);
        if (!zonaExistente || zonaExistente.id !== zonaIdForValidation) {
          zonaExistente = await this.zonaModel.findByPk(zonaIdForValidation);
        }

        if (!zonaExistente) {
          throw new NotFoundError(
            `La zona con ID ${zonaIdForValidation} no existe`,
            'ZONA_NOT_FOUND'
          );
        }

        const escalas = await this.rocodromoRepository.obtenerEscalasDificultad(
          zonaExistente.idRoco
        );

        if (!escalas) {
          throw new NotFoundError(
            `Rocodromo con ID ${zonaExistente.idRoco} no encontrado`,
            'ROCODROMO_NOT_FOUND'
          );
        }

        const tipoParaValidar = resolveValue(tipo, pistaActual.tipo);
        const escalaPorTipo =
          tipoParaValidar === 'boulder'
            ? escalas.escalaDificultadBloque
            : escalas.escalaDificultadVia;

        if (!escalaPorTipo || !Array.isArray(escalaPorTipo.dificultades)) {
          throw new ValidationError(
            `El rocódromo no tiene una escala de dificultad configurada para ${tipoParaValidar}`,
            'PISTA_DIFICULTAD_ESCALA_NO_CONFIGURADA'
          );
        }

        const dificultadNormalizada =
          typeof dificultad === 'string' ? dificultad.trim() : String(dificultad);

        if (!escalaPorTipo.dificultades.includes(dificultadNormalizada)) {
          throw new ValidationError(
            `La dificultad debe ser una de: ${escalaPorTipo.dificultades.join(', ')}`,
            'PISTA_DIFICULTAD_INVALIDA'
          );
        }
      }

      const pistaActualizada = new Pista(
        pistaActual.id,
        resolveValue(idZona, pistaActual.idZona),
        resolveValue(nombre, pistaActual.nombre),
        dificultad,
        resolveValue(tipo, pistaActual.tipo),
        colorPresas, 
        pistaActual.imagenUrl,
        resolveValue(posX, pistaActual.posX),
        resolveValue(posY, pistaActual.posY),
        resolveValue(fechaCreacion, pistaActual.fechaCreacion),
        fechaRetirada, pistaActual.fechaRetirada,
        pistaActual.activo
      );

      return await this.pistaRepository.actualizar(pistaActualizada);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al actualizar la pista',
        'PISTA_UPDATE_FAILED',
        error
      );
    }
  }
}

export default ActualizarPista;
