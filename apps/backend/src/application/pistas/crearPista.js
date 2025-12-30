import Pista from '../../domain/pistas/Pista.js';

class CrearPista {
  constructor(pistaRepository) {
    this.pistaRepository = pistaRepository;
  }

  async execute(data) {
    try {
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
