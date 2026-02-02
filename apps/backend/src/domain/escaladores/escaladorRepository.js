// Esta es una clase abstracta que sirve como interfaz en JS
class EscaladorRepository {
  async crear(escalador) {
    throw new Error('Método "crear" no implementado');
  }

  async encontrarPorCorreo(correo) {
    throw new Error('Método "encontrarPorCorreo" no implementado');
  }
}
export default EscaladorRepository;
