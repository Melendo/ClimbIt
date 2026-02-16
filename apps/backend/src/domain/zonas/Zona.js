class Zona {
  /**
   * @param {number|null} id - El ID único de la zona (null si es nueva)
   * @param {number} idRoco - El ID del roco al que pertenece la zona
   * @param {string} tipo - El tipo de la zona
   */
  constructor(id, idRoco, tipo) {
    this.id = id;
    this.idRoco = idRoco;
    this.tipo = tipo;

    // Validaciones
    if (!Number.isInteger(this.idRoco)) {
      throw new Error(`idRoco inválido: Debe ser un número entero.`);
    }
    if (typeof tipo !== 'string' || tipo.trim() === '') {
      throw new Error(`tipo inválido: Debe ser una cadena no vacía.`);
    }
  }
}

export default Zona;
