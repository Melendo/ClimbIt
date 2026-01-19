class RocodromoController {
  constructor(rocodromoUseCases) {
    this.useCases = rocodromoUseCases;
  }

  async obtenerZonasDeRocodromo(req, res, next) {
    try {
      const { id } = req.params;
      const zonas = await this.useCases.obtenerZonasRocodromo.execute(id);

      if (!zonas) {
        return res
          .status(404)
          .json({ error: `Rocódromo con ID ${id} no encontrado` });
      }

      res.status(200).json(zonas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default RocodromoController;
