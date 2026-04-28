class Rocodromo {
  /**
   * @param {number|null} id
   * @param {string} nombre
   * @param {string} ubicacion
   * @param {string|null} logoUrl
   * @param {string|null} descripcion
   * @param {string|null} horarios
   * @param {number|null} dificultadBloque
   * @param {number|null} dificultadVia
   * @param {boolean} activo
   */
  constructor(
    id,
    nombre,
    ubicacion,
    logoUrl = null,
    descripcion = null,
    horarios = null,
    dificultadBloque = null,
    dificultadVia = null,
    activo = true
  ) {
    this.id = id;
    this.nombre = nombre;
    this.ubicacion = ubicacion;
    this.logoUrl = logoUrl;
    this.descripcion = descripcion;
    this.horarios = horarios;
    this.dificultadBloque = dificultadBloque;
    this.dificultadVia = dificultadVia;
    this.activo = activo;

    if (id !== null && typeof id !== 'number') {
      throw new Error(`id inválido: Debe ser un número o null.`);
    }
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error(`nombre inválido: Debe ser una cadena no vacía.`);
    }
    if (typeof ubicacion !== 'string' || ubicacion.trim() === '') {
      throw new Error(`ubicacion inválida: Debe ser una cadena no vacía.`);
    }
    if (dificultadBloque !== null && !Number.isInteger(dificultadBloque)) {
      throw new Error(
        'dificultadBloque inválida: Debe ser un número entero o null.'
      );
    }
    if (dificultadVia !== null && !Number.isInteger(dificultadVia)) {
      throw new Error(
        'dificultadVia inválida: Debe ser un número entero o null.'
      );
    }
  }
}

export default Rocodromo;
