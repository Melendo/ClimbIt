import fs from 'fs/promises';
import path from 'path';
import { BadRequestError, NotFoundError } from '../../../domain/sharedObjects/AppError.js';

class EscaladorController {
  constructor(escaladorUseCases) {
    this.useCases = escaladorUseCases;
  }

  async crear(req, res, next) {
    try {
      const { correo, contrasena, apodo } = req.body;
      const nuevoEscalador = await this.useCases.crear.execute({
        correo,
        contrasena,
        apodo,
      });
      res.status(201).json(nuevoEscalador);
    } catch (error) {
      return next(error);
    }
  }

  async autenticar(req, res, next) {
    try {
      const { correo, contrasena } = req.body;

      const resultado = await this.useCases.autenticar.execute({
        correo,
        contrasena,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerPerfil(req, res, next) {
    try {
      const apodo = req.user.apodo; // Asumiendo que el middleware verifyToken añade escaladorCorreo al req

      const perfilEscalador = await this.useCases.obtenerPerfil.execute(apodo);

      res.status(200).json(perfilEscalador);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerResumenEstadisticas(req, res, next) {
    try {
      const apodo = req.user.apodo;
      const resumen = await this.useCases.obtenerResumenEstadisticas.execute({
        apodo,
      });
      res.status(200).json(resumen);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerTiposEstadisticas(req, res, next) {
    try {
      const apodo = req.user.apodo;
      const tipos = await this.useCases.obtenerTiposEstadisticas.execute({
        apodo,
      });
      res.status(200).json(tipos);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerActividadMensual(req, res, next) {
    try {
      const apodo = req.user.apodo;
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const actividad = await this.useCases.obtenerActividadMensual.execute({
        apodo,
        year,
        month,
      });
      res.status(200).json(actividad);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerResumenEstadisticasRocodromo(req, res, next) {
    try {
      const apodo = req.user.apodo;
      const idRocodromo = Number(req.params.id);
      const resumen = await this.useCases.obtenerResumenEstadisticasRocodromo.execute({
        apodo,
        idRocodromo,
      });
      res.status(200).json(resumen);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerTiposEstadisticasRocodromo(req, res, next) {
    try {
      const apodo = req.user.apodo;
      const idRocodromo = Number(req.params.id);
      const tipos = await this.useCases.obtenerTiposEstadisticasRocodromo.execute({
        apodo,
        idRocodromo,
      });
      res.status(200).json(tipos);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerActividadMensualRocodromo(req, res, next) {
    try {
      const apodo = req.user.apodo;
      const idRocodromo = Number(req.params.id);
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const actividad =
        await this.useCases.obtenerActividadMensualRocodromo.execute({
          apodo,
          idRocodromo,
          year,
          month,
        });
      res.status(200).json(actividad);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerDificultadMaximaRocodromo(req, res, next) {
    try {
      const apodo = req.user.apodo;
      const idRocodromo = Number(req.params.id);
      const dificultadMaxima =
        await this.useCases.obtenerDificultadMaximaRocodromo.execute({
          apodo,
          idRocodromo,
        });
      res.status(200).json(dificultadMaxima);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerResumenEstadisticasPublico(req, res, next) {
    try {
      const { apodo } = req.params;
      const resumen = await this.useCases.obtenerResumenEstadisticas.execute({
        apodo,
      });
      res.status(200).json(resumen);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerTiposEstadisticasPublico(req, res, next) {
    try {
      const { apodo } = req.params;
      const tipos = await this.useCases.obtenerTiposEstadisticas.execute({
        apodo,
      });
      res.status(200).json(tipos);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerActividadMensualPublico(req, res, next) {
    try {
      const { apodo } = req.params;
      const year = req.query.year ? Number(req.query.year) : undefined;
      const month = req.query.month ? Number(req.query.month) : undefined;
      const actividad = await this.useCases.obtenerActividadMensual.execute({
        apodo,
        year,
        month,
      });
      res.status(200).json(actividad);
    } catch (error) {
      return next(error);
    }
  }

  async suscribirse(req, res, next) {
    try {
      const escaladorApodo = req.user.apodo; // Asumiendo que el middleware verifyToken añade escaladorId al req
      const { idRocodromo } = req.body;
      const resultado = await this.useCases.suscribirseRocodromo.execute({
        escaladorApodo,
        idRocodromo,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async desuscribirse(req, res, next) {
    try {
      const escaladorApodo = req.user.apodo; // Asumiendo que el middleware verifyToken añade escaladorId al req
      const { idRocodromo } = req.body;
      const resultado = await this.useCases.desuscribirseRocodromo.execute({
        escaladorApodo,
        idRocodromo,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerRocodromosSuscritos(req, res, next) {
    try {
      const apodo = req.user.apodo; // Asumiendo que el middleware verifyToken añade escaladorCorreo al req

      const rocodromos =
        await this.useCases.obtenerRocodromosSuscritos.execute(apodo);

      res.status(200).json(rocodromos);
    } catch (error) {
      return next(error);
    }
  }

  async crearFotoPerfil(req, res, next) {
    let uploadedPath = null;

    try {
      if (!req.file) {
        return next(
          new BadRequestError('La imagen es requerida', 'FOTO_PERFIL_REQUERIDA')
        );
      }

      uploadedPath = req.file.path;
      const urlFoto = `/uploads/fotos_perfil/${req.file.filename}`;
      const fotoPerfil = await this.useCases.crearFotoPerfil.execute({
        urlFoto,
      });

      res.status(201).json({
        id: fotoPerfil.id,
        nombre: path.basename(fotoPerfil.urlFoto),
        urlFoto: fotoPerfil.urlFoto,
      });
    } catch (error) {
      if (uploadedPath) {
        try {
          await fs.unlink(uploadedPath);
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            return next(unlinkError);
          }
        }
      }

      return next(error);
    }
  }

  async obtenerFotosPerfil(req, res, next) {
    try {
      const fotosPerfil = await this.useCases.obtenerFotosPerfil.execute();

      res.status(200).json(fotosPerfil);
    } catch (error) {
      return next(error);
    }
  }

  async obtenerFotoPerfil(req, res, next) {
    try {
      const { id } = req.params;
      const fotoPerfil = await this.useCases.obtenerFotoPerfil.execute(id);

      if (!fotoPerfil) {
        return next(
          new NotFoundError(
            `Foto de perfil con ID ${id} no encontrada`,
            'FOTO_PERFIL_NOT_FOUND'
          )
        );
      }

      const fileName = path.basename(fotoPerfil.urlFoto);
      const filePath = path.resolve(
        process.cwd(),
        'uploads',
        'fotos_perfil',
        fileName
      );

      await fs.access(filePath);
      return res.sendFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return next(
          new NotFoundError('Imagen no encontrada', 'FOTO_PERFIL_NOT_FOUND', error)
        );
      }

      return next(error);
    }
  }

  async actualizarFotoPerfil(req, res, next) {
    try {
      const { idFotoPerfil } = req.body;
      const apodo = req.user.apodo;

      const resultado = await this.useCases.actualizarFotoPerfil.execute({
        apodo,
        idFotoPerfil,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async validarApodo(req, res, next) {
    try {
      const { apodo } = req.params;
      const resultado = await this.useCases.validarApodo.execute(apodo);

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async validarCorreo(req, res, next) {
    try {
      const { correo } = req.params;
      const resultado = await this.useCases.validarCorreo.execute(correo);

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async actualizarDescripcion(req, res, next) {
    try {
      const { descripcion } = req.body;
      const apodo = req.user.apodo;

      const resultado = await this.useCases.actualizarDescripcion.execute({
        apodo,
        descripcion,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async cambiarApodo(req, res, next) {
    try {
      const { apodo } = req.body;
      const apodoActual = req.user.apodo;

      const resultado = await this.useCases.cambiarApodo.execute({
        apodoActual,
        nuevoApodo: apodo,
        usuario: req.user,
      });

      res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }
}

export default EscaladorController;
