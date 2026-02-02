class ObtenerRocodromos{
    constructor(rocodromoRepository) {
        this.rocodromoRepository = rocodromoRepository;
    }

    async execute() {
        try {
            return await this.rocodromoRepository.obtenerRocodromos();
        } catch (error) {
            throw new Error(`Error al obtener los rocodromos: ${error.message}`);
        }
    }
}

export default ObtenerRocodromos;