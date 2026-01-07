class EscaladorController {
  constructor(escaladorUseCases) {
    this.useCases = escaladorUseCases;
  }

  async crear(req, res, next) {
    try {
      const { correo, contrasena, apodo } = req.body;

      const nuevoEscalador = await this.useCases.crear.execute({
        correo,
        contrasena,
        apodo,
      });

      res.status(201).json(nuevoEscalador);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default EscaladorController;
