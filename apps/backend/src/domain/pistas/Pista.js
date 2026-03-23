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
    if (typeof nombre !== 'string' || nombre.trim() === '' || nombre === null) {
      this.nombre = this.tipo + "-" + this.dificultad;
    }
    if (typeof dificultad !== 'string' || dificultad.trim() === '') {
      throw new Error(`dificultad inválida: Debe ser una cadena no vacía.`);
    }
    if (!(this.fechaCreacion instanceof Date) || Number.isNaN(this.fechaCreacion.getTime())) {
      throw new Error('fechaCreacion inválida: Debe ser una fecha válida.');
    }
    const now = new Date();
    if (this.fechaCreacion > now) {
      throw new Error('fechaCreacion inválida: Debe ser anterior o igual a la fecha actual.');
    }
    if (this.fechaRetirada !== null) {
      if (!(this.fechaRetirada instanceof Date) || Number.isNaN(this.fechaRetirada.getTime())) {
        throw new Error('fechaRetirada inválida: Debe ser una fecha válida.');
      }
      if (this.fechaRetirada <= now) {
        throw new Error('fechaRetirada inválida: Debe ser posterior a la fecha actual.');
      }
    }
  }
}

export default Pista;
