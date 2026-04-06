import fs from 'fs/promises';
import path from 'path';

class PistaController {
  constructor(pistaUseCases) {
    this.useCases = pistaUseCases;
  }

  async crear(req, res, next) {
    let finalPath = null;

    try {
      const { idZona, nombre, dificultad, tipo, colorPresas, imagenUrl, posX, posY, fechaCreacion, fechaRetirada } = req.body;
      const hasUpload = Boolean(req.file);

      let nuevaPista = await this.useCases.crear.execute({
        idZona,
        nombre,
        dificultad,
        tipo,
        colorPresas,
        imagenUrl: hasUpload ? null : imagenUrl,
        posX,
        posY,
        fechaCreacion,
        fechaRetirada,
      });

      if (hasUpload) {
        const finalDir = path.resolve(
          process.cwd(),
          'uploads',
          'imagenes_pistas'
        );

        await fs.mkdir(finalDir, { recursive: true });

        finalPath = path.join(finalDir, req.file.filename);
        await fs.rename(req.file.path, finalPath);

        const finalUrl = `/uploads/imagenes_pistas/${req.file.filename}`;
        nuevaPista = await this.useCases.actualizarImagen.execute(
          nuevaPista.id,
          finalUrl
        );
      }

      res.status(201).json(nuevaPista);
    } catch (error) {
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            return res.status(500).json({ error: unlinkError.message });
          }
        }
      }

      if (finalPath) {
        try {
          await fs.unlink(finalPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            return res.status(500).json({ error: unlinkError.message });
          }
        }
      }

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

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      const resultado = await this.useCases.eliminar.execute({
        idPista: id,
      });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const {
        idZona,
        nombre,
        tipo,
        dificultad,
        colorPresas,
        posX,
        posY,
        fechaCreacion,
        fechaRetirada,
      } = req.body;

      const resultado = await this.useCases.actualizar.execute({
        idPista: id,
        idZona,
        nombre,
        tipo,
        dificultad,
        colorPresas,
        posX,
        posY,
        fechaCreacion,
        fechaRetirada,
      });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async actualizarImagen(req, res, next) {
    let finalPath = null;

    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'La imagen es requerida' });
      }

      const pista = await this.useCases.obtenerPistaPorId.execute(id, null);

      if (!pista) {
        if (req.file?.path) {
          try {
            await fs.unlink(req.file.path);
          } catch (unlinkError) {
            if (unlinkError.code !== 'ENOENT') {
              throw unlinkError;
            }
          }
        }

        return res
          .status(404)
          .json({ error: `Pista con ID ${id} no encontrada` });
      }

      if (pista.imagenUrl) {
        const previousFileName = path.basename(pista.imagenUrl);
        const previousPath = path.resolve(
          process.cwd(),
          'uploads',
          'imagenes_pistas',
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

      const finalDir = path.resolve(
        process.cwd(),
        'uploads',
        'imagenes_pistas'
      );

      await fs.mkdir(finalDir, { recursive: true });

      finalPath = path.join(finalDir, req.file.filename);
      await fs.rename(req.file.path, finalPath);

      const finalUrl = `/uploads/imagenes_pistas/${req.file.filename}`;
      const updatedPista = await this.useCases.actualizarImagen.execute(
        id,
        finalUrl
      );

      res.status(200).json(updatedPista);
    } catch (error) {
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            return res.status(500).json({ error: unlinkError.message });
          }
        }
      }

      if (finalPath) {
        try {
          await fs.unlink(finalPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            return res.status(500).json({ error: unlinkError.message });
          }
        }
      }

      res.status(500).json({ error: error.message });
    }
  }

  async obtenerImagen(req, res, next) {
    try {
      const { id } = req.params;
      const pista = await this.useCases.obtenerPistaPorId.execute(id, null);

      if (!pista) {
        return res
          .status(404)
          .json({ error: `Pista con ID ${id} no encontrada` });
      }

      if (!pista.imagenUrl) {
        return res
          .status(404)
          .json({ error: 'La pista no tiene imagen asignada' });
      }

      const fileName = path.basename(pista.imagenUrl);
      const filePath = path.resolve(
        process.cwd(),
        'uploads',
        'imagenes_pistas',
        fileName
      );

      await fs.access(filePath);
      return res.sendFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }

      res.status(500).json({ error: error.message });
    }
  }
}

export default PistaController;
