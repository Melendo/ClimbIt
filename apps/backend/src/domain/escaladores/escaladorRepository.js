// Esta es una clase abstracta que sirve como interfaz en JS
class EscaladorRepository {
  async crear(escalador) {
    throw new Error('Método "crear" no implementado');
  }

  async encontrarPorCorreo(correo) {
    throw new Error('Método "encontrarPorCorreo" no implementado');
  }

  async encontrarPorCorreoInsensitive(correo) {
    throw new Error('Método "encontrarPorCorreoInsensitive" no implementado');
  }

  async encontrarPorApodo(apodo) {
    throw new Error('Método "encontrarPorApodo" no implementado');
  }

  async encontrarPorApodoInsensitive(apodo) {
    throw new Error('Método "encontrarPorApodoInsensitive" no implementado');
  }

  async buscarPorApodoSimilitud(cadena, limite, excludeId) {
    throw new Error('Método "buscarPorApodoSimilitud" no implementado');
  }

  async encontrarPorId(id) {
    throw new Error('Método "encontrarPorId" no implementado');
  }

  async encontrarPorIds(ids) {
    throw new Error('Método "encontrarPorIds" no implementado');
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

  async obtenerIdsRocodromosGestionados(escaladorId) {
    throw new Error('Método "obtenerIdsRocodromosGestionados" no implementado');
  }

  async actualizarFotoPerfilId(escaladorApodo, idFotoPerfil) {
    throw new Error('Método "actualizarFotoPerfilId" no implementado');
  }

  async actualizarDescripcion(apodo, descripcion) {
    throw new Error('Método "actualizarDescripcion" no implementado');
  }

  async actualizarApodo(apodoActual, nuevoApodo) {
    throw new Error('Método "actualizarApodo" no implementado');
  }
}
export default EscaladorRepository;
