class Escalador {
  /**
   * @param {number|null} id - El ID único del escalador (null si es nuevo)
   * @param {string} nombre - El nombre del escalador
   * @param {number} edad - La edad del escalador
   * @param {string} experiencia - El nivel de experiencia del escalador
   */
  constructor(id, nombre, edad, experiencia) {
    this.id = id;
    this.nombre = nombre;
    this.edad = edad;
    this.experiencia = experiencia;
  }
}

module.exports = Escalador;
