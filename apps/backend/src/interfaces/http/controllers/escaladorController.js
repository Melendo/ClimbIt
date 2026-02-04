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

  async autenticar(req, res, next) {
    try {
      const { correo, contrasena } = req.body;

      const resultado = await this.useCases.autenticar.execute({
        correo,
        contrasena,
      });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async suscribirse(req, res, next) {
    try {
      const escaladorApodo = req.user.apodo; // Asumiendo que el middleware verifyToken añade escaladorId al req
      const { idRocodromo } = req.body;
      const resultado = await this.useCases.suscribirseRocodromo.execute({
        escaladorApodo,
        idRocodromo,
      });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async desuscribirse(req, res, next) {
    try {
      const escaladorApodo = req.user.apodo; // Asumiendo que el middleware verifyToken añade escaladorId al req
      const { idRocodromo } = req.body;
      const resultado = await this.useCases.desuscribirseRocodromo.execute({
        escaladorApodo,
        idRocodromo,
      });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default EscaladorController;
