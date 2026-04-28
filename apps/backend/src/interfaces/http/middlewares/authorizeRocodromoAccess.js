import fs from 'fs/promises';
import dbPromise from '../../../infrastructure/db/postgres/models/index.js';
import {
  AppError,
  AuthorizationError,
  InternalServerError,
  NotFoundError,
} from '../../../domain/sharedObjects/AppError.js';

const FORBIDDEN_MESSAGE = 'Acceso denegado: permisos insuficientes';

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const cleanupUpload = async (req) => {
  await safeUnlink(req.file?.path);
};

export const resolveRocodromoIdFromRocodromoBody = async (req) => {
  const idRoco = Number(req.body?.idRoco);
  return {
    idRoco: Number.isFinite(idRoco) && idRoco > 0 ? idRoco : null,
  };
};

export const resolveRocodromoIdFromRocodromoParam = async (req, db) => {
  const idRoco = Number(req.params?.id);
  if (!Number.isFinite(idRoco) || idRoco <= 0) {
    return { idRoco: null, notFoundMessage: 'Rocodromo no encontrado' };
  }

  const rocodromo = await db.Rocodromo.findByPk(idRoco);
  if (!rocodromo) {
    return {
      idRoco: null,
      notFoundMessage: `Rocodromo con ID ${idRoco} no encontrado`,
    };
  }

  return { idRoco: rocodromo.id };
};

export const resolveRocodromoIdFromZonaBody = async (req, db) => {
  const idZona = Number(req.body?.idZona);
  if (!Number.isFinite(idZona) || idZona <= 0) {
    return { idRoco: null, notFoundMessage: 'Zona no encontrada' };
  }

  const zona = await db.Zona.findByPk(idZona);
  if (!zona) {
    return {
      idRoco: null,
      notFoundMessage: `Zona con ID ${idZona} no encontrada`,
    };
  }

  return { idRoco: zona.idRoco };
};

export const resolveRocodromoIdFromZonaParam = async (req, db) => {
  const idZona = Number(req.params?.id);
  if (!Number.isFinite(idZona) || idZona <= 0) {
    return { idRoco: null, notFoundMessage: 'Zona no encontrada' };
  }

  const zona = await db.Zona.findByPk(idZona);
  if (!zona) {
    return {
      idRoco: null,
      notFoundMessage: `Zona con ID ${idZona} no encontrada`,
    };
  }

  return { idRoco: zona.idRoco };
};

export const resolveRocodromoIdFromPistaParam = async (req, db) => {
  const idPista = Number(req.params?.id);
  if (!Number.isFinite(idPista) || idPista <= 0) {
    return { idRoco: null, notFoundMessage: 'Pista no encontrada' };
  }

  const pista = await db.Pista.findByPk(idPista);
  if (!pista) {
    return {
      idRoco: null,
      notFoundMessage: `Pista con ID ${idPista} no encontrada`,
    };
  }

  const zona = await db.Zona.findByPk(pista.idZona);
  if (!zona) {
    return {
      idRoco: null,
      notFoundMessage: `Zona con ID ${pista.idZona} no encontrada`,
    };
  }

  return { idRoco: zona.idRoco };
};

const authorizeRocodromoAccess = ({
  resolveRocodromoId,
  requireAdmin = false,
}) => {
  return async (req, res, next) => {
    try {
      const rol = req.user?.rol;

      if (rol === 'Admin') {
        return next();
      }

      if (requireAdmin) {
        await cleanupUpload(req);
        return next(
          new AuthorizationError(
            FORBIDDEN_MESSAGE,
            'ROCODROMO_ACCESS_FORBIDDEN'
          )
        );
      }

      if (rol !== 'Gestor') {
        await cleanupUpload(req);
        return next(
          new AuthorizationError(
            FORBIDDEN_MESSAGE,
            'ROCODROMO_ACCESS_FORBIDDEN'
          )
        );
      }

      const db = await dbPromise;
      const resolved = await resolveRocodromoId(req, db);
      const idRoco = resolved?.idRoco;

      if (!idRoco) {
        await cleanupUpload(req);
        return next(
          new NotFoundError(
            resolved?.notFoundMessage || 'Recurso no encontrado',
            'ROCODROMO_RELATED_RESOURCE_NOT_FOUND'
          )
        );
      }

      const managedIds = Array.isArray(req.user?.rocodromosGestionados)
        ? req.user.rocodromosGestionados.map((id) => Number(id))
        : [];

      if (!managedIds.includes(Number(idRoco))) {
        await cleanupUpload(req);
        return next(
          new AuthorizationError(
            FORBIDDEN_MESSAGE,
            'ROCODROMO_ACCESS_FORBIDDEN'
          )
        );
      }

      return next();
    } catch (error) {
      try {
        await cleanupUpload(req);
      } catch (cleanupError) {
        return next(
          new InternalServerError(
            'Error al limpiar archivo temporal tras denegar acceso',
            'UPLOAD_CLEANUP_FAILED',
            cleanupError
          )
        );
      }

      if (error instanceof AppError) {
        return next(error);
      }

      return next(
        new InternalServerError(
          'Error al validar permisos de acceso al rocódromo',
          'ROCODROMO_ACCESS_CHECK_FAILED',
          error
        )
      );
    }
  };
};

export default authorizeRocodromoAccess;
