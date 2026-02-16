import Zona from '../../domain/zonas/Zona.js';

class CrearZona {
  constructor(zonaRepository, rocodromoModel) {
    this.zonaRepository = zonaRepository;
    this.rocodromoModel = rocodromoModel;
  }

  async execute(data) {
    try {
      // Validate that the rocodromo exists before creating the zona
      if (data.idRoco) {
        const rocodromoExistente = await this.rocodromoModel.findByPk(
          data.idRoco
        );
        if (!rocodromoExistente) {
          throw new Error(`El rocodromo con ID ${data.idRoco} no existe`);
        }
      }

      const nuevaZona = new Zona(null, data.idRoco, data.nombre);
      const zonaCreada = await this.zonaRepository.crearZona(nuevaZona);

      return zonaCreada;
    } catch (error) {
      throw new Error(`Error al crear la zona: ${error.message}`);
    }
  }
}

export default CrearZona;
