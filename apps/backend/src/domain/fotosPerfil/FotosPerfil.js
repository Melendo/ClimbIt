class FotosPerfil {
  /**
   * @param {number|null} id
   * @param {string} urlFoto
   * @param {boolean} activo
   */
  constructor(id, urlFoto, activo = true) {
    this.id = id;
    this.urlFoto = urlFoto;
    this.activo = activo;

    if (id !== null && typeof id !== 'number') {
      throw new Error('id inválido: Debe ser un número o null.');
    }
    if (typeof urlFoto !== 'string' || urlFoto.trim() === '') {
      throw new Error('urlFoto inválida: Debe ser una cadena no vacía.');
    }
  }
}

export default FotosPerfil;
