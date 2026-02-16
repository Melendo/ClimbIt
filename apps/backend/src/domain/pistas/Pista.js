class Pista {
  /**
   * @param {number|null} id - El ID único de la pista (null si es nueva)
   * @param {number} idZona - El ID de la zona a la que pertenece la pista
   * @param {string} nombre - El nombre de la pista
   * @param {string} dificultad - La dificultad de la pista
   */
  constructor(id, idZona, nombre, dificultad) {
    this.id = id;
    this.idZona = idZona;
    this.nombre = nombre;
    this.dificultad = dificultad;

    // Validaciones
    if (!Number.isInteger(this.idZona)) {
      throw new Error(`idZona inválido: Debe ser un número entero.`);
    }
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error(`nombre inválido: Debe ser una cadena no vacía.`);
    }
    if (typeof dificultad !== 'string' || dificultad.trim() === '') {
      throw new Error(`dificultad inválida: Debe ser una cadena no vacía.`);
    }
  }
}

export default Pista;
