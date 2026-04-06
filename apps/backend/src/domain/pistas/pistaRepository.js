// Esta es una clase abstracta que sirve como interfaz en JS
class PistaRepository {
  async crear(pista) {
    throw new Error('Método "crear" no implementado');
  }

  async obtenerPorId(id) {
    throw new Error('Método "obtenerPorId" no implementado');
  }

  async cambiarEstado(id, nuevoEstado) {
    throw new Error('Método "cambiarEstado" no implementado');
  }

  async actualizarImagenUrl(id, imagenUrl) {
    throw new Error('Método "actualizarImagenUrl" no implementado');
  }

  async desactivar(id) {
    throw new Error('Método "desactivar" no implementado');
  }

  async obtenerEstado(idPista, idEscalador) {
    throw new Error('Método "obtenerEstado" no implementado');
  }
}

export default PistaRepository;
