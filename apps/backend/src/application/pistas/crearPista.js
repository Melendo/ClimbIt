import Pista from '../../domain/pistas/Pista.js';
import {
  AppError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../../domain/sharedObjects/AppError.js';

class CrearPista {
  constructor(pistaRepository, zonaModel, rocodromoRepository) {
    this.pistaRepository = pistaRepository;
    this.zonaModel = zonaModel;
    this.rocodromoRepository = rocodromoRepository;
  }

  async execute(data) {
    try {
      // Validate that the zone exists before creating the pista
      if (data.idZona) {
        const zonaExistente = await this.zonaModel.findByPk(data.idZona);
        if (!zonaExistente) {
          throw new NotFoundError(
            `La zona con ID ${data.idZona} no existe`,
            'ZONA_NOT_FOUND'
          );
        }

        if (
          data.dificultad !== undefined &&
          data.dificultad !== null &&
          data.dificultad !== ''
        ) {
          const escalas =
            await this.rocodromoRepository.obtenerEscalasDificultad(
              zonaExistente.idRoco
            );

          if (!escalas) {
            throw new NotFoundError(
              `Rocodromo con ID ${zonaExistente.idRoco} no encontrado`,
              'ROCODROMO_NOT_FOUND'
            );
          }

          const escalaPorTipo =
            data.tipo === 'boulder'
              ? escalas.escalaDificultadBloque
              : escalas.escalaDificultadVia;

          if (!escalaPorTipo || !Array.isArray(escalaPorTipo.dificultades)) {
            throw new ValidationError(
              `El rocódromo no tiene una escala de dificultad configurada para ${data.tipo}`,
              'PISTA_DIFICULTAD_ESCALA_NO_CONFIGURADA'
            );
          }

          const dificultadNormalizada =
            typeof data.dificultad === 'string'
              ? data.dificultad.trim()
              : String(data.dificultad);

          if (!escalaPorTipo.dificultades.includes(dificultadNormalizada)) {
            throw new ValidationError(
              `La dificultad debe ser una de: ${escalaPorTipo.dificultades.join(', ')}`,
              'PISTA_DIFICULTAD_INVALIDA'
            );
          }
        }
      }

      const pistaActivaExistente =
        await this.pistaRepository.obtenerPorPosicion(
          data.posX,
          data.posY,
          data.idZona
        );
      if (pistaActivaExistente) {
        throw new ValidationError(
          `Ya existe una pista activa en la posición (${data.posX}, ${data.posY})`,
          'PISTA_POSICION_OCUPADA'
        );
      }
      const nuevaPista = new Pista(
        null,
        data.idZona,
        data.nombre,
        data.dificultad,
        data.tipo,
        data.colorPresas,
        data.imagenUrl,
        data.posX,
        data.posY,
        data.fechaCreacion,
        data.fechaRetirada
      );
      const pistaCreada = await this.pistaRepository.crear(nuevaPista);

      return pistaCreada;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al crear la pista',
        'PISTA_CREATE_FAILED',
        error
      );
    }
  }
}

export default CrearPista;
