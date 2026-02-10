import Rocodromo from '../../domain/rocodromos/Rocodromo.js';

class CrearRocodromo {
  constructor(rocodromoRepository) {
    this.rocodromoRepository = rocodromoRepository;
  }

  async execute(rocodromoData) {
    try {
      const nuevoRocodromo = new Rocodromo(
        null,
        rocodromoData.nombre,
        rocodromoData.ubicacion
      );
      const creado =
        await this.rocodromoRepository.crearRocodromo(nuevoRocodromo);
      return creado;
    } catch (error) {
      throw new Error(`Error al crear el rocodromo: ${error.message}`);
    }
  }
}

export default CrearRocodromo;
