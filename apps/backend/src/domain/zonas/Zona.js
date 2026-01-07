class Zona {
  /**
   * @param {number|null} id - El ID único de la zona (null si es nueva)
   * @param {number} idRoco - El ID del roco al que pertenece la zona
   * @param {string} nombre - El nombre de la zona
   */
  constructor(id, idRoco, nombre) {
    this.id = id;
    this.idRoco = idRoco;
    this.nombre = nombre;

    if (!Number.isInteger(idRoco)) {
      throw new Error(`idRoco inválido: Debe ser un número entero.`);
    }
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error(`nombre inválido: Debe ser una cadena no vacía.`);
    }
  }
}

export default Zona;
