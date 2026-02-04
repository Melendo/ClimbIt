// Esta es una clase abstracta que sirve como interfaz en JS
class EscaladorRepository {
  async crear(escalador) {
    throw new Error('Método "crear" no implementado');
  }

  async encontrarPorCorreo(correo) {
    throw new Error('Método "encontrarPorCorreo" no implementado');
  }

  async suscribirse(escaladorApodo, rocodromo) {
    throw new Error('Método "suscribirse" no implementado');
  }

  async desuscribirse(escaladorApodo, idRocodromo) {
    throw new Error('Método "desuscribirse" no implementado');
  }

  async estaSuscrito(escaladorApodo, idRocodromo) {
    throw new Error('Método "estaSuscrito" no implementado');
  }

  async obtenerRocodromosSuscritos(escaladorId) {
    throw new Error('Método "obtenerRocodromosSuscritos" no implementado');
  }
}
export default EscaladorRepository;
