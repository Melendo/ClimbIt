// Esta es una clase abstracta que sirve como interfaz en JS
class EscaladorRepository {
  async crear(escalador) {
    throw new Error('Método "crear" no implementado');
  }
}

module.exports = EscaladorRepository;
