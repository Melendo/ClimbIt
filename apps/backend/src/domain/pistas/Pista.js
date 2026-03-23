class Pista {
  /**
   * @param {number|null} id
   * @param {number} idZona
   * @param {string} nombre
   * @param {string} dificultad
   * @param {string|null} tipo
   * @param {string|null} colorPresas
   * @param {string|null} imagenUrl
  * @param {number|null} posX
  * @param {number|null} posY
   * @param {Date|null} fechaCreacion
   * @param {Date|null} fechaRetirada
   * @param {boolean} activo
   */
  constructor(id, idZona, nombre, dificultad, tipo = null, colorPresas = null, imagenUrl = null, posX = null, posY = null, fechaCreacion = new Date(), fechaRetirada = null, activo = true) {
    this.id = id;
    this.idZona = idZona;
    this.nombre = nombre;
    this.dificultad = dificultad;
    this.tipo = tipo;
    this.colorPresas = colorPresas;
    this.imagenUrl = imagenUrl;
    this.posX = posX;
    this.posY = posY;
    this.fechaCreacion = fechaCreacion;
    this.fechaRetirada = fechaRetirada;
    this.activo = activo;

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
