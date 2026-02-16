// Esta es una clase abstracta que sirve como interfaz en JS
class ZonaRepository {
  async crearZona(zona) {
    throw new Error('Método "crearZona" no implementado');
  }

  async obtenerPistasDeZona(idZona) {
    throw new Error('Método "obtenerPistasDeZona" no implementado');
  }
}

export default ZonaRepository;
