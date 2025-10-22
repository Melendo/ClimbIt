const Escalador = require('../../../domain/escaladores/Escalador');

class EscaladorController {
  constructor(escaladorUseCases) {
    this.useCases = escaladorUseCases;
  }

  async crear(req, res, next) {
    try {
      const { nombre, edad, experiencia } = req.body;
      const escalador = new Escalador(null, nombre, edad, experiencia);
      console.log('Body en controller:', req.body, '-controller');
      console.log('Recibido en controller:', escalador, '-controller');
      // Llamamos al caso de uso a través del objeto
      const nuevoEscalador = await this.useCases.crear.execute(escalador);

      res.status(201).json(nuevoEscalador);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EscaladorController;
