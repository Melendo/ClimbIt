import fs from 'fs/promises';
import path from 'path';
import {
  BadRequestError,
  NotFoundError,
} from '../../../domain/sharedObjects/AppError.js';

class ZonaController {
  constructor(zonaUseCases) {
    this.useCases = zonaUseCases;
  }

  async crearZona(req, res, next) {
    try {
      let { idRoco, nombre, mapa } = req.body;
      idRoco = parseInt(idRoco);
      const nuevaZona = await this.useCases.crear.execute({
        idRoco,
        nombre,
        mapa,
      });
      res.status(201).json(nuevaZona);
    } catch (error) {
      return next(error);
    }
  }
  async obtenerPistasDeZona(req, res, next) {
    try {
      const { id } = req.params;
      const apodo = req.user ? req.user.apodo : null;
      const pistas = await this.useCases.obtenerPistasDeZona.execute(id, apodo);

      if (!pistas) {
        return next(
          new NotFoundError(`Zona con ID ${id} no encontrada`, 'ZONA_NOT_FOUND')
        );
      }

      res.status(200).json(pistas);
    } catch (error) {
      return next(error);
    }
  }

  async subirMapa(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return next(
          new BadRequestError('El mapa es requerido', 'ZONA_MAPA_REQUERIDO')
        );
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

        return next(
          new NotFoundError(`Zona con ID ${id} no encontrada`, 'ZONA_NOT_FOUND')
        );
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
      return next(error);
    }
  }

  async obtenerMapa(req, res, next) {
    try {
      const { id } = req.params;
      const zona = await this.useCases.obtenerZonaPorId.execute(id);

      if (!zona || !zona.mapa) {
        return next(
          new NotFoundError(
            `Mapa de la zona ${id} no encontrado`,
            'ZONA_MAPA_NOT_FOUND'
          )
        );
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
          next(
            new NotFoundError('Mapa no encontrado', 'ZONA_MAPA_NOT_FOUND', err)
          );
        }
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ZonaController;
