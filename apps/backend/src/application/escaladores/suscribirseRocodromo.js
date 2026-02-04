class SuscribirseRocodromo {
    constructor(escaladorRepository, rocodromoRepository) {
        this.escaladorRepository = escaladorRepository;
        this.rocodromoRepository = rocodromoRepository;
    }
    async execute({ escaladorApodo, idRocodromo }) {
        try {
            console.log(`Iniciando suscripción del escalador ${escaladorApodo} al rocódromo ID ${idRocodromo}`);
            const rocodromoEncontrado = await this.rocodromoRepository.encontrarPorId(idRocodromo);
            if (!rocodromoEncontrado) {
                throw new Error(`Rocódromo con ID ${idRocodromo} no encontrado`);
            }
            await this.escaladorRepository.suscribirse(escaladorApodo, rocodromoEncontrado);
            return { mensaje: `Escalador ${escaladorApodo} suscrito al rocódromo ${rocodromoEncontrado.nombre} exitosamente.` };
        } catch (error) {
            throw new Error(`Error al suscribirse al rocódromo: ${error.message}`);
        }
    }
}
export default SuscribirseRocodromo;