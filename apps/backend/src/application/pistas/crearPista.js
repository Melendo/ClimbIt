import Pista from '../../domain/pistas/Pista.js';

class CrearPista {
  constructor(pistaRepository, zonaModel) {
    this.pistaRepository = pistaRepository;
    this.zonaModel = zonaModel;
  }

  async execute(data) {
    try {
      // Validate that the zone exists before creating the pista
      if (data.idZona) {
        const zonaExistente = await this.zonaModel.findByPk(data.idZona);
        if (!zonaExistente) {
          throw new Error(`La zona con ID ${data.idZona} no existe`);
        }
      }
      
      const nuevaPista = new Pista(
        null,
        data.idZona,
        data.nombre,
        data.dificultad
      );
      const pistaCreada = await this.pistaRepository.crear(nuevaPista);

      return pistaCreada;
       
    } catch (error) {
      throw new Error(`Error al crear la pista: ${error.message}`);
    }
  }
}

export default CrearPista;
