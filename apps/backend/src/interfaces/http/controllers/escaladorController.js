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
}

export default EscaladorController;
