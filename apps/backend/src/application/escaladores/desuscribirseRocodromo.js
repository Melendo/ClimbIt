class DesuscribirseRocodromo {
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

            // Verificar si está suscrito
            const estaSuscrito = await this.escaladorRepository.estaSuscrito(escaladorApodo, idRocodromo);
            if (!estaSuscrito) {
                throw new Error(`El escalador ${escaladorApodo} no está suscrito al rocódromo con ID ${idRocodromo}`);
            }
            
            await this.escaladorRepository.desuscribirse(escaladorApodo, idRocodromo);
            return { mensaje: `Escalador ${escaladorApodo} desuscrito del rocódromo ${rocodromoEncontrado.nombre} exitosamente.` };
        } catch (error) {
            throw new Error(`Error al desuscribirse del rocódromo: ${error.message}`);
        }
    }
}

export default DesuscribirseRocodromo;