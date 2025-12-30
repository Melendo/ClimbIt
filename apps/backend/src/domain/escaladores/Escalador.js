class Escalador {
  /**
   * @param {number|null} id - El ID único del escalador (null si es nuevo)
   * @param {string} correo - El correo del escalador
   * @param {string} contrasena - La contraseña del escalador
   * @param {string} apodo - El apodo del escalador
   */
  constructor(id, correo, contrasena, apodo) {
    this.id = id;
    this.correo = correo;
    this.contrasena = contrasena;
    this.apodo = apodo;

    if (typeof this.correo !== 'string' || this.correo.trim() === '') {
      throw new Error(`correo inválido: Debe ser una cadena no vacía.`);
    }
    const correoNormalizado = this.correo.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoNormalizado)) {
      throw new Error(`correo inválido: Debe tener un formato de correo electrónico válido.`);
    }
    if (typeof this.contrasena !== 'string' || this.contrasena.trim() === '') {
      throw new Error(`contraseña inválida: Debe ser una cadena no vacía.`);
    }
    if (typeof this.apodo !== 'string' || this.apodo.trim() === '') {
      throw new Error(`apodo inválido: Debe ser una cadena no vacía.`);
    }
  }
}

export default Escalador;
