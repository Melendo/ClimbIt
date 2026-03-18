import fs from 'fs/promises';
import path from 'path';

class RocodromoController {
  constructor(rocodromoUseCases) {
    this.useCases = rocodromoUseCases;
  }

  async crearRocodromo(req, res, next) {
    try {
      const { nombre, ubicacion, logoUrl, descripcion, horarios } = req.body;
      const nuevoRocodromo = await this.useCases.crear.execute({ nombre, ubicacion, logoUrl, descripcion, horarios });
      res.status(201).json(nuevoRocodromo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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

  async obtenerRocodromos(req, res, next) {
    try {
      const rocodromos = await this.useCases.obtenerRocodromos.execute();
      res.status(200).json(rocodromos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerInformacionRocodromo(req, res, next) {
    try {
      const { id } = req.params;
      const rocodromo = await this.useCases.obtenerInformacion.execute(id);

      if (!rocodromo) {
        return res
          .status(404)
          .json({ error: `Rocódromo con ID ${id} no encontrado` });
      }

      res.status(200).json(rocodromo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async subirLogo(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'El logo es requerido' });
      }

      const existingRocodromo = await this.useCases.obtenerInformacion.execute(id);

      if (!existingRocodromo) {
        const uploadedPath = path.resolve(
          process.cwd(),
          'uploads',
          'logos_rocodromos',
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
          .json({ error: `Rocódromo con ID ${id} no encontrado` });
      }

      if (existingRocodromo.logoUrl) {
        const previousFileName = path.basename(existingRocodromo.logoUrl);
        const previousLogoPath = path.resolve(
          process.cwd(),
          'uploads',
          'logos_rocodromos',
          previousFileName
        );

        try {
          await fs.unlink(previousLogoPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            throw unlinkError;
          }
        }
      }

      const logoUrl = `/uploads/logos_rocodromos/${req.file.filename}`;
      const rocodromo = await this.useCases.actualizarLogo.execute(id, logoUrl);

      res.status(200).json({ logoUrl: rocodromo.logoUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerLogo(req, res, next) {
    try {
      const { id } = req.params;
      const rocodromo = await this.useCases.obtenerInformacion.execute(id);

      if (!rocodromo || !rocodromo.logoUrl) {
        return res
          .status(404)
          .json({ error: `Logo del rocódromo ${id} no encontrado` });
      }

      const fileName = path.basename(rocodromo.logoUrl);
      const logoPath = path.resolve(
        process.cwd(),
        'uploads',
        'logos_rocodromos',
        fileName
      );

      res.sendFile(logoPath, (err) => {
        if (err && !res.headersSent) {
          res.status(404).json({ error: 'Logo no encontrado' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default RocodromoController;
