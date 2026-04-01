import {
  AppError,
  InternalServerError,
} from '../../domain/sharedObjects/AppError.js';

class ObtenerRocodromos {
    constructor(rocodromoRepository) {
        this.rocodromoRepository = rocodromoRepository;
    }

    async execute() {
        try {
            return await this.rocodromoRepository.obtenerRocodromos();
        } catch (error) {
            if (error instanceof AppError) {
              throw error;
            }

            throw new InternalServerError(
              'Error al obtener los rocódromos',
              'ROCODROMO_LIST_FAILED',
              error
            );
        }
    }
}

export default ObtenerRocodromos;