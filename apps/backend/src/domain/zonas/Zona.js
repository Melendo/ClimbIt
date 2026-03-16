class Zona {
  /**
   * @param {number|null} id
   * @param {number} idRoco
   * @param {string} nombre
   * @param {string|null} mapa
   * @param {boolean} activo
   */
  constructor(id, idRoco, nombre, mapa = null, activo = true) {
    this.id = id;
    this.idRoco = idRoco;
    this.nombre = nombre;
    this.mapa = mapa;
    this.activo = activo;

    // Validaciones
    if (!Number.isInteger(this.idRoco)) {
      throw new Error(`idRoco inválido: Debe ser un número entero.`);
    }
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error(`nombre inválido: Debe ser una cadena no vacía.`);
    }
  }
}

export default Zona;
