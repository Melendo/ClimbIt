import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

function resolveMaxDificultad(dificultades, escala = []) {
  const values = Array.isArray(dificultades)
    ? dificultades
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
    : [];

  if (values.length === 0) {
    return null;
  }

  const escalaValues = Array.isArray(escala)
    ? escala
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
    : [];

  if (escalaValues.length > 0) {
    const order = new Map(escalaValues.map((value, index) => [value, index]));
    let max = null;
    let maxIndex = -1;

    values.forEach((value) => {
      const index = order.get(value);
      if (Number.isInteger(index) && index > maxIndex) {
        maxIndex = index;
        max = value;
      }
    });

    if (max) {
      return max;
    }
  }

  return values[values.length - 1];
}

class ObtenerDificultadMaximaRocodromoEscalador {
  constructor(escaladorRepository, rocodromoRepository, pistaRepository) {
    this.escaladorRepository = escaladorRepository;
    this.rocodromoRepository = rocodromoRepository;
    this.pistaRepository = pistaRepository;
  }

  async execute({ apodo, idRocodromo }) {
    try {
      const escalador = await this.escaladorRepository.encontrarPorApodo(apodo);

      if (!escalador) {
        throw new NotFoundError('Escalador no encontrado', 'ESCALADOR_NOT_FOUND');
      }

      const rocodromo = await this.rocodromoRepository.encontrarPorId(idRocodromo);

      if (!rocodromo) {
        throw new NotFoundError('Rocodromo no encontrado', 'ROCODROMO_NOT_FOUND');
      }

      const [dificultadesPorTipo, escalas] = await Promise.all([
        this.pistaRepository.obtenerDificultadesEscaladasPorTipoEnRocodromo(
          escalador.id,
          rocodromo.id
        ),
        this.rocodromoRepository.obtenerEscalasDificultad(rocodromo.id),
      ]);

      return {
        maxDificultadBloque: resolveMaxDificultad(
          dificultadesPorTipo?.boulder,
          escalas?.escalaDificultadBloque?.dificultades
        ),
        maxDificultadVia: resolveMaxDificultad(
          dificultadesPorTipo?.via,
          escalas?.escalaDificultadVia?.dificultades
        ),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new InternalServerError(
        'Error al obtener dificultad maxima por tipo del escalador por rocodromo',
        'ESCALADOR_STATS_MAX_DIFICULTAD_ROCODROMO_FETCH_FAILED',
        error
      );
    }
  }
}

export default ObtenerDificultadMaximaRocodromoEscalador;
