// Esta es una clase abstracta que sirve como interfaz en JS
class PistaRepository {
  async crear(pista) {
    throw new Error('Método "crear" no implementado');
  }

  async obtenerPorId(id) {
    throw new Error('Método "obtenerPorId" no implementado');
  }

  async obtenerPorPosicion(id) {
    throw new Error('Método "obtenerPorPosicion" no implementado');
  }

  async cambiarEstado(id, nuevoEstado) {
    throw new Error('Método "cambiarEstado" no implementado');
  }

  async actualizarValoracion(id, idEscalador, nuevaValoracion) {
    throw new Error('Método "actualizarValoracion" no implementado');
  }

  async obtenerValoracionTotal(idPista) {
    throw new Error('Método "obtenerValoracionTotal" no implementado');
  }
  
  async actualizarImagenUrl(id, imagenUrl) {
    throw new Error('Método "actualizarImagenUrl" no implementado');
  }

  async actualizar(pista) {
    throw new Error('Método "actualizar" no implementado');
  }

  async desactivar(id) {
    throw new Error('Método "desactivar" no implementado');
  }

  async obtenerEstado(idPista, idEscalador) {
    throw new Error('Método "obtenerEstado" no implementado');
  }

  async obtenerResumenEstadisticasEscalador(idEscalador) {
    throw new Error('Método "obtenerResumenEstadisticasEscalador" no implementado');
  }

  async obtenerTiposEstadisticasEscalador(idEscalador) {
    throw new Error('Método "obtenerTiposEstadisticasEscalador" no implementado');
  }

  async obtenerActividadMensualEscalador(idEscalador, year, month) {
    throw new Error('Método "obtenerActividadMensualEscalador" no implementado');
  }

  async obtenerTotalPistasActivasPorRocodromo(idRocodromo) {
    throw new Error('Método "obtenerTotalPistasActivasPorRocodromo" no implementado');
  }

  async obtenerDificultadesEscaladasPorTipoEnRocodromo(idEscalador, idRocodromo) {
    throw new Error(
      'Método "obtenerDificultadesEscaladasPorTipoEnRocodromo" no implementado'
    );
  }
}

export default PistaRepository;
