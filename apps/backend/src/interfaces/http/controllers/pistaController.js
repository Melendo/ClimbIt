import fs from 'fs/promises';
import path from 'path';
import { BadRequestError, NotFoundError } from '../../../domain/sharedObjects/AppError.js';

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
            return next(unlinkError);
          }
        }
      }

      if (finalPath) {
        try {
          await fs.unlink(finalPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            return next(unlinkError);
          }
        }
      }

      return next(error);
    }
  }

  async obtenerPistaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const escaladorApodo = req.user ? req.user.apodo : null;
      const pista = await this.useCases.obtenerPistaPorId.execute(id, escaladorApodo);

      if (!pista) {
        return next(
          new NotFoundError(
            `Pista con ID ${id} no encontrada`,
            'PISTA_NOT_FOUND'
          )
        );
      }

      res.status(200).json(pista);
    } catch (error) {
      return next(error);
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
      return next(error);
    }
  }

  async actualizarValoracion(req, res, next) {
    try {
      const { id } = req.params;
      const { valoracion } = req.body;
      const escaladorApodo = req.user.apodo;
      const resultado = await this.useCases.actualizarValoracion.execute({
        idPista: id,
        escaladorApodo: escaladorApodo,
        nuevaValoracion: valoracion,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerValoracionTotal(req, res, next) {
    try {
      const { id } = req.params;

      const resultado = await this.useCases.obtenerValoracionTotal.execute({ idPista: id });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
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
      return next(error);
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
      return next(error);
    }
  }

  async actualizarImagen(req, res, next) {
    let finalPath = null;

    try {
      const { id } = req.params;

      if (!req.file) {
        return next(
          new BadRequestError('La imagen es requerida', 'PISTA_IMAGEN_REQUERIDA')
        );
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

        return next(
          new NotFoundError(
            `Pista con ID ${id} no encontrada`,
            'PISTA_NOT_FOUND'
          )
        );
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
            return next(unlinkError);
          }
        }
      }

      if (finalPath) {
        try {
          await fs.unlink(finalPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            return next(unlinkError);
          }
        }
      }

      return next(error);
    }
  }

  async obtenerImagen(req, res, next) {
    try {
      const { id } = req.params;
      const pista = await this.useCases.obtenerPistaPorId.execute(id, null);

      if (!pista) {
        return next(
          new NotFoundError(
            `Pista con ID ${id} no encontrada`,
            'PISTA_NOT_FOUND'
          )
        );
      }

      if (!pista.imagenUrl) {
        return next(
          new NotFoundError(
            'La pista no tiene imagen asignada',
            'PISTA_IMAGEN_NO_ASIGNADA'
          )
        );
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
        return next(
          new NotFoundError('Imagen no encontrada', 'PISTA_IMAGEN_NOT_FOUND', error)
        );
      }

      return next(error);
    }
  }
}

export default PistaController;
