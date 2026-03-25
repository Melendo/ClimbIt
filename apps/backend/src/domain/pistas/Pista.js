class Pista {
  /**
   * @param {number|null} id
   * @param {number} idZona
   * @param {string|null} nombre
   * @param {string|null} dificultad
  * @param {string} tipo
   * @param {string|null} colorPresas
   * @param {string|null} imagenUrl
   * @param {number|null} posX
   * @param {number|null} posY
   * @param {Date|null} fechaCreacion
   * @param {Date|null} fechaRetirada
   * @param {boolean} activo
   */
  constructor(
    id,
    idZona,
    nombre = null,
    dificultad = null,
    tipo,
    colorPresas = null,
    imagenUrl = null,
    posX = null,
    posY = null,
    fechaCreacion = new Date(),
    fechaRetirada = null,
    activo = true
  ) {
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
      this.nombre = (this.dificultad ? this.tipo + '-' + this.dificultad : this.tipo);
    }
    if (typeof this.tipo !== 'string' || this.tipo.trim() === '') {
      throw new Error('tipo inválido: Debe ser una cadena no vacía.');
    }
    if (!['boulder', 'via'].includes(this.tipo)) {
      throw new Error('tipo inválido: Debe ser "boulder" o "via".');
    }

    if (this.fechaCreacion === '' || this.fechaCreacion === null) {
      this.fechaCreacion = new Date();
    }
    if (this.fechaCreacion) {
      if (
        !(this.fechaCreacion instanceof Date) ||
        Number.isNaN(this.fechaCreacion.getTime())
      ) {
        throw new Error('fechaCreacion inválida: Debe ser una fecha válida.');
      }
      const now = new Date();
      if (this.fechaCreacion > now) {
        throw new Error(
          'fechaCreacion inválida: Debe ser anterior o igual a la fecha actual.'
        );
      }
    }
    if (this.fechaRetirada === '') {
      this.fechaRetirada = null;
    }
    if (this.fechaRetirada) {
      if (
        !(this.fechaRetirada instanceof Date) ||
        Number.isNaN(this.fechaRetirada.getTime())
      ) {
        throw new Error('fechaRetirada inválida: Debe ser una fecha válida.');
      }
      const now = new Date();
      if (this.fechaRetirada <= now) {
        throw new Error(
          'fechaRetirada inválida: Debe ser posterior a la fecha actual.'
        );
      }
    }
  }
}

export default Pista;
