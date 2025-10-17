const crearPistaUseCase = require('../../../application/pistas/crearPista');
const repository = require('../../../infrastructure/repositories/PistaRepositoryPostgres');

const crearPista = async (req, res) => {
  try {
    const crear = crearPistaUseCase(repository);
    const nueva = await crear(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { crearPista };
