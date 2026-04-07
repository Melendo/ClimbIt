import fs from 'fs/promises';
import path from 'path';
import { BadRequestError, NotFoundError } from '../../../domain/sharedObjects/AppError.js';

class RocodromoController {
  constructor(rocodromoUseCases) {
    this.useCases = rocodromoUseCases;
  }

  async crearRocodromo(req, res, next) {
    try {
      const {
        nombre,
        ubicacion,
        logoUrl,
        descripcion,
        horarios,
        dificultadBloque,
        dificultadVia,
      } = req.body;
      const toNullableInt = (value) => {
        if (value === undefined || value === null || value === '') return null;
        return Number(value);
      };
      const nuevoRocodromo = await this.useCases.crear.execute({
        nombre,
        ubicacion,
        logoUrl,
        descripcion,
        horarios,
        dificultadBloque: toNullableInt(dificultadBloque),
        dificultadVia: toNullableInt(dificultadVia),
      });
      res.status(201).json(nuevoRocodromo);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerZonasDeRocodromo(req, res, next) {
    try {
      const { id } = req.params;
      const zonas = await this.useCases.obtenerZonasRocodromo.execute(id);

      if (!zonas) {
        return next(
          new NotFoundError(
            `Rocódromo con ID ${id} no encontrado`,
            'ROCODROMO_NOT_FOUND'
          )
        );
      }

      res.status(200).json(zonas);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerRocodromos(req, res, next) {
    try {
      const rocodromos = await this.useCases.obtenerRocodromos.execute();
      res.status(200).json(rocodromos);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerInformacionRocodromo(req, res, next) {
    try {
      const { id } = req.params;
      const rocodromo = await this.useCases.obtenerInformacion.execute(id);

      if (!rocodromo) {
        return next(
          new NotFoundError(
            `Rocódromo con ID ${id} no encontrado`,
            'ROCODROMO_NOT_FOUND'
          )
        );
      }

      res.status(200).json(rocodromo);
    } catch (error) {
      return next(error);
    }
  }

  async actualizarInformacion(req, res, next) {
    try {
      const { id } = req.params;
      const {
        nombre,
        ubicacion,
        descripcion,
        horarios,
        dificultadBloque,
        dificultadVia,
      } = req.body;

      const toOptionalInt = (value) => {
        if (value === undefined) return undefined;
        if (value === null || value === '') return null;
        return Number(value);
      };

      const rocodromoActualizado = await this.useCases.actualizarInformacion.execute({
        idRocodromo: id,
        nombre,
        ubicacion,
        descripcion,
        horarios,
        dificultadBloque: toOptionalInt(dificultadBloque),
        dificultadVia: toOptionalInt(dificultadVia),
      });

      res.status(200).json(rocodromoActualizado);
    } catch (error) {
      return next(error);
    }
  }

  async subirLogo(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return next(
          new BadRequestError('El logo es requerido', 'ROCODROMO_LOGO_REQUERIDO')
        );
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

        return next(
          new NotFoundError(
            `Rocódromo con ID ${id} no encontrado`,
            'ROCODROMO_NOT_FOUND'
          )
        );
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
      return next(error);
    }
  }

  async obtenerLogo(req, res, next) {
    try {
      const { id } = req.params;
      const rocodromo = await this.useCases.obtenerInformacion.execute(id);

      if (!rocodromo || !rocodromo.logoUrl) {
        return next(
          new NotFoundError(
            `Logo del rocódromo ${id} no encontrado`,
            'ROCODROMO_LOGO_NOT_FOUND'
          )
        );
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
          next(
            new NotFoundError('Logo no encontrado', 'ROCODROMO_LOGO_NOT_FOUND', err)
          );
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  async obtenerEscalasDificultad(req, res, next) {
    try {
      const { id } = req.params;
      const escalas = await this.useCases.obtenerEscalasDificultad.execute(id);

      if (!escalas) {
        return next(
          new NotFoundError(
            `Rocódromo con ID ${id} no encontrado`,
            'ROCODROMO_NOT_FOUND'
          )
        );
      }

      res.status(200).json(escalas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default RocodromoController;
