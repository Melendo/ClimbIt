class EscaladorController {
  constructor(escaladorUseCases) {
    this.useCases = escaladorUseCases;
  }

  async crear(req, res, next) {
    try {
      const { nombre, edad, experiencia } = req.body;

      const nuevoEscalador = await this.useCases.crear.execute({
        nombre,
        edad,
        experiencia,
      });

      res.status(201).json(nuevoEscalador);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPistaPorId(req, res, next) {
    try {
      const { id } = req.params;

      const escalador = await this.useCases.obtenerPistaPorId.execute(id);

      if (!escalador) {
        return res.status(404).json({ error: 'Escalador no encontrado' });
      }

      res.status(200).json(escalador);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default EscaladorController;
