const crearEscaladorUseCase = require('../../../application/escaladores/crearEscalador');
const repository = require('../../../infrastructure/repositories/EscaladorRepositoryPostgres');

const crearEscalador = async (req, res) => {
  try {
    const crear = crearEscaladorUseCase(repository);
    console.log('Datos recibidos en el controlador:', req.body);
    const nuevo = await crear(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { crearEscalador };
