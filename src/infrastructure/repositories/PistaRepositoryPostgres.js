const pool = require('../db/postgres');

module.exports = {
  async guardar(pista) {
    const result = await pool.query(
      'INSERT INTO pistas (nombre, dificultad) VALUES ($1, $2) RETURNING *',
      [pista.nombre, pista.dificultad]
    );
    return result.rows[0];
  }
};
