import fs from 'fs/promises';
import path from 'path';

class ZonaController {
  constructor(zonaUseCases) {
    this.useCases = zonaUseCases;
  }

  async crearZona(req, res, next) {
    try {
      let { idRoco, nombre, mapa } = req.body;
      idRoco = parseInt(idRoco);
      const nuevaZona = await this.useCases.crear.execute({ idRoco, nombre, mapa });
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

  async subirMapa(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'El mapa es requerido' });
      }

      const zona = await this.useCases.obtenerZonaPorId.execute(id);

      if (!zona) {
        const uploadedPath = path.resolve(
          process.cwd(),
          'uploads',
          'mapas_zonas',
          req.file.filename
        );

        try {
          await fs.unlink(uploadedPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            throw unlinkError;
          }
        }

        return res
          .status(404)
          .json({ error: `Zona con ID ${id} no encontrada` });
      }

      if (zona.mapa) {
        const previousFileName = path.basename(zona.mapa);
        const previousPath = path.resolve(
          process.cwd(),
          'uploads',
          'mapas_zonas',
          previousFileName
        );

        try {
          await fs.unlink(previousPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            throw unlinkError;
          }
        }
      }

      const mapaUrl = `/uploads/mapas_zonas/${req.file.filename}`;
      const updatedZona = await this.useCases.actualizarMapa.execute(
        id,
        mapaUrl
      );

      res.status(200).json({ mapa: updatedZona.mapa });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerMapa(req, res, next) {
    try {
      const { id } = req.params;
      const zona = await this.useCases.obtenerZonaPorId.execute(id);

      if (!zona || !zona.mapa) {
        return res
          .status(404)
          .json({ error: `Mapa de la zona ${id} no encontrado` });
      }

      const fileName = path.basename(zona.mapa);
      const mapaPath = path.resolve(
        process.cwd(),
        'uploads',
        'mapas_zonas',
        fileName
      );

      res.sendFile(mapaPath, (err) => {
        if (err && !res.headersSent) {
          res.status(404).json({ error: 'Mapa no encontrado' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default ZonaController;
