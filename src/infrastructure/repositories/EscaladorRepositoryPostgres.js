const pool = require('../db/postgres');

module.exports = {
  async guardar(escalador) {
    const result = await pool.query(
      'INSERT INTO escaladores (nombre, edad, experiencia) VALUES ($1, $2, $3) RETURNING *',
      [escalador.nombre, escalador.edad, escalador.experiencia]
    );
    return result.rows[0];
  }
};
