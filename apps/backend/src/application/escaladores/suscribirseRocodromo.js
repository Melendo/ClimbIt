class SuscribirseRocodromo {
    constructor(escaladorRepository, rocodromoRepository) {
        this.escaladorRepository = escaladorRepository;
        this.rocodromoRepository = rocodromoRepository;
    }
    async execute({ escaladorApodo, idRocodromo }) {
        try {
            const rocodromoEncontrado = await this.rocodromoRepository.encontrarPorId(idRocodromo);
            if (!rocodromoEncontrado) {
                throw new Error(`Rocódromo con ID ${idRocodromo} no encontrado`);
            }

            // Verificar si ya está suscrito
            const yaSuscrito = await this.escaladorRepository.estaSuscrito(escaladorApodo, idRocodromo);
            if (yaSuscrito) {
                throw new Error(`El escalador ${escaladorApodo} ya está suscrito al rocódromo ${rocodromoEncontrado.nombre}`);
            }
            
            await this.escaladorRepository.suscribirse(escaladorApodo, rocodromoEncontrado);
            return { mensaje: `Escalador ${escaladorApodo} suscrito al rocódromo ${rocodromoEncontrado.nombre} exitosamente.` };
        } catch (error) {
            throw new Error(`Error al suscribirse al rocódromo: ${error.message}`);
        }
    }
}
export default SuscribirseRocodromo;