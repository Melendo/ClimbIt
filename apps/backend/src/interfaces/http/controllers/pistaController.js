class PistaController {
  constructor(pistaUseCases) {
    this.useCases = pistaUseCases;
  }

  async crear(req, res, next) {
    try {
      const { idZona, nombre, dificultad } = req.body;

      const nuevaPista = await this.useCases.crear.execute({
        idZona,
        nombre,
        dificultad,
      });

      res.status(201).json(nuevaPista);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPistaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const escaladorApodo = req.user ? req.user.apodo : null;
      const pista = await this.useCases.obtenerPistaPorId.execute(id, escaladorApodo);

      if (!pista) {
        return res
          .status(404)
          .json({ error: `Pista con ID ${id} no encontrada` });
      }

      res.status(200).json(pista);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const escaladorApodo = req.user.apodo;

      const resultado = await this.useCases.cambiarEstado.execute({
        idPista: id,
        nuevoEstado: estado,
        escaladorApodo,
      });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default PistaController;
