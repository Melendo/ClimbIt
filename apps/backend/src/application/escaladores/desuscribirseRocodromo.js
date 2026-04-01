import {
  AppError,
  InternalServerError,
  NotFoundError,
} from '../../domain/sharedObjects/AppError.js';

class DesuscribirseRocodromo {
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

            // Verificar si está suscrito
            const estaSuscrito = await this.escaladorRepository.estaSuscrito(escaladorApodo, idRocodromo);
            if (!estaSuscrito) {
                throw new NotFoundError(
                  `El escalador ${escaladorApodo} no está suscrito al rocódromo con ID ${idRocodromo}`,
                  'ESCALADOR_NOT_SUBSCRIBED'
                );
            }
            
            await this.escaladorRepository.desuscribirse(escaladorApodo, idRocodromo);
            return { mensaje: `Escalador ${escaladorApodo} desuscrito del rocódromo ${rocodromoEncontrado.nombre} exitosamente.` };
        } catch (error) {
            if (error instanceof AppError) {
              throw error;
            }

            throw new InternalServerError(
              'Error al desuscribirse del rocódromo',
              'ROCODROMO_UNSUBSCRIPTION_FAILED',
              error
            );
        }
    }
}

export default DesuscribirseRocodromo;