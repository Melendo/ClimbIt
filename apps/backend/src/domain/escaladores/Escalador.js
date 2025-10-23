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
    this.edad = edad;

    if (!Escalador.EXPERIENCIAS.includes(experiencia)) {
      throw new Error(
        `experiencia inválida: "${experiencia}". Debe ser uno de: ${Escalador.EXPERIENCIAS.join(', ')}`
      );
    }
    if (edad <= 0 || !Number.isInteger(edad)) {
      throw new Error(`edad inválida: "${edad}". Debe ser un entero positivo.`);
    }
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error(
        `nombre inválido: "${nombre}". Debe ser una cadena no vacía.`
      );
    }

    this.experiencia = experiencia;
  }
}

// Definir la propiedad estática fuera de la clase para compatibilidad con parsers antiguos.
Escalador.EXPERIENCIAS = Object.freeze([
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Experto',
]);

module.exports = Escalador;
