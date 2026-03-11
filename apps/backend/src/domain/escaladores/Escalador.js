class Escalador {
  /**
   * @param {number|null} id
   * @param {string} correo
   * @param {string} contrasena
   * @param {string} apodo
   * @param {string|null} descripcion
   * @param {string|null} fotoUrl
   * @param {boolean} activo
   */
  constructor(id, correo, contrasena, apodo, descripcion = null, fotoUrl = null, activo = true) {
    this.id = id;
    this.correo = correo;
    this.contrasena = contrasena;
    this.apodo = apodo;
    this.descripcion = descripcion;
    this.fotoUrl = fotoUrl;
    this.activo = activo;

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
