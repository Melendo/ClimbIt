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
      const pista = await this.useCases.obtenerPistaPorId.execute(id);

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
}

export default PistaController;
