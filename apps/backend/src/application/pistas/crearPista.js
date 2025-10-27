import Pista from '../../domain/pistas/Pista.js';

class CrearPista {
  constructor(pistaRepository) {
    this.pistaRepository = pistaRepository;
  }

  async execute(data) {
    try {
      const nuevaPista = new Pista(null, data.nombre, data.dificultad);
      console.log('Datos de la nueva pista:', nuevaPista);
      const pistaCreada = await this.pistaRepository.crear(nuevaPista);

      return pistaCreada;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      throw new Error(`Error al crear la pista`);
    }
  }
}

export default CrearPista;
