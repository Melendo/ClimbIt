import {
  AppError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class SuscribirseRocodromo {
    constructor(escaladorRepository, rocodromoRepository) {
        this.escaladorRepository = escaladorRepository;
        this.rocodromoRepository = rocodromoRepository;
    }
    async execute({ escaladorApodo, idRocodromo }) {
        try {
            const rocodromoEncontrado = await this.rocodromoRepository.encontrarPorId(idRocodromo);
            if (!rocodromoEncontrado) {
                throw new NotFoundError(
                  `Rocódromo con ID ${idRocodromo} no encontrado`,
                  'ROCODROMO_NOT_FOUND'
                );
            }

            // Verificar si ya está suscrito
            const yaSuscrito = await this.escaladorRepository.estaSuscrito(escaladorApodo, idRocodromo);
            if (yaSuscrito) {
                throw new ConflictError(
                  `El escalador ${escaladorApodo} ya está suscrito al rocódromo ${rocodromoEncontrado.nombre}`,
                  'ESCALADOR_ALREADY_SUBSCRIBED'
                );
            }
            
            await this.escaladorRepository.suscribirse(escaladorApodo, rocodromoEncontrado);
            return { mensaje: `Escalador ${escaladorApodo} suscrito al rocódromo ${rocodromoEncontrado.nombre} exitosamente.` };
        } catch (error) {
            if (error instanceof AppError) {
              throw error;
            }

            throw new InternalServerError(
              'Error al suscribirse al rocódromo',
              'ROCODROMO_SUBSCRIPTION_FAILED',
              error
            );
        }
    }
}
export default SuscribirseRocodromo;