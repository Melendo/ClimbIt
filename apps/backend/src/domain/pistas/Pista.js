class Pista {
  /**
   * @param {number|null} id - El ID único de la pista (null si es nueva)
   * @param {string} nombre - El nombre de la pista
   * @param {string} dificultad - La dificultad de la pista
   */
  constructor(id, nombre, dificultad) {
    this.id = id;
    this.nombre = nombre;
    this.dificultad = dificultad;

    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error(`nombre inválido: Debe ser una cadena no vacía.`);
    }
    if (typeof dificultad !== 'string' || dificultad.trim() === '') {
      throw new Error(`dificultad inválida: Debe ser una cadena no vacía.`);
    }
  }
}

export default Pista;
