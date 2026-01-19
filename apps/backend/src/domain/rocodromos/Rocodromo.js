class Rocodromo {
  /**
   * @param {number|null} id - El ID único del rocodromo (null si es nuevo)
   * @param {string} nombre - El nombre del rocodromo
   * @param {string} ubicacion - La ubicación del rocodromo
   */
  constructor(id, nombre, ubicacion) {
    this.id = id;
    this.nombre = nombre;
    this.ubicacion = ubicacion;

    if (typeof id !== 'number' || id == null) {
      throw new Error(`id inválido: Debe ser un número o null.`);
    }
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error(`nombre inválido: Debe ser una cadena no vacía.`);
    }
    if (typeof ubicacion !== 'string' || ubicacion.trim() === '') {
      throw new Error(`ubicacion inválida: Debe ser una cadena no vacía.`);
    }
  }
}

export default Rocodromo;
