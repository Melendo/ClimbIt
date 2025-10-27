class Escalador {
  /**
   * @param {number|null} id - El ID único del escalador (null si es nuevo)
   * @param {string} nombre - El nombre del escalador
   * @param {number} edad - La edad del escalador
   * @param {string} experiencia - El nivel de experiencia del escalador
   */
  constructor(id, nombre, edad, experiencia = 'Principiante') {
    this.id = id;
    this.nombre = nombre;
    this.edad = Number(edad);
    this.experiencia = experiencia;

    if (!Escalador.EXPERIENCIAS.includes(this.experiencia)) {
      throw new Error(
        `experiencia inválida: "${this.experiencia}". Debe ser uno de: ${Escalador.EXPERIENCIAS.join(', ')}`
      );
    }
    if (this.edad <= 0 || !Number.isInteger(this.edad)) {
      throw new Error(
        `edad inválida: "${this.edad}". Debe ser un entero positivo.`
      );
    }
    if (typeof this.nombre !== 'string' || this.nombre.trim() === '') {
      throw new Error(
        `nombre inválido: "${this.nombre}". Debe ser una cadena no vacía.`
      );
    }
  }
}

// Definir la propiedad estática fuera de la clase para compatibilidad con parsers antiguos.
Escalador.EXPERIENCIAS = Object.freeze([
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Experto',
]);

export default Escalador;
