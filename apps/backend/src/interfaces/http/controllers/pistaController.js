class PistaController {
  constructor(pistaUseCases) {
    this.useCases = pistaUseCases;
  }

  async crear(req, res, next) {
    try {
      const { nombre, dificultad } = req.body;

      const nuevaPista = await this.useCases.crear.execute({
        nombre,
        dificultad,
      });

      res.status(201).json(nuevaPista);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PistaController;
