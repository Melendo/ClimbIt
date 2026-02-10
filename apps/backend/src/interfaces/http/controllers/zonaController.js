class ZonaController {
  constructor(zonaUseCases) {
    this.useCases = zonaUseCases;
  }

  async crearZona(req, res, next) {
    try {
      let { idRoco, nombre } = req.body;
      idRoco = parseInt(idRoco);
      const nuevaZona = await this.useCases.crear.execute({ idRoco, nombre });
      res.status(201).json(nuevaZona);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async obtenerPistasDeZona(req, res, next) {
    try {
      const { id } = req.params;
      const apodo = req.user ? req.user.apodo : null;
      const pistas = await this.useCases.obtenerPistasDeZona.execute(id, apodo);

      if (!pistas) {
        return res
          .status(404)
          .json({ error: `Zona con ID ${id} no encontrada` });
      }

      res.status(200).json(pistas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default ZonaController;
