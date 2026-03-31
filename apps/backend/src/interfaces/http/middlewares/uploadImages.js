import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const SVG_MIME_TYPE = 'image/svg+xml';
const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const normalizeAllowedMimeTypes = (allowedMimeTypes) => {
  if (!Array.isArray(allowedMimeTypes) || allowedMimeTypes.length === 0) {
    return new Set(DEFAULT_ALLOWED_MIME_TYPES);
  }

  return new Set(
    allowedMimeTypes
      .filter((value) => typeof value === 'string' && value.trim())
      .map((value) => value.toLowerCase())
  );
};

const createUploadError = (message, code, status = 400) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
};

const isLikelySvgFile = (filePath) => {
  const sampleSize = 4096;
  const buffer = fs.readFileSync(filePath, { encoding: 'utf8' }).slice(0, sampleSize);
  return /<svg\b[^>]*>/i.test(buffer);
};

const buildFileFilter = (allowedMimeTypes) => (req, file, cb) => {
  const mimetype = file.mimetype?.toLowerCase();

  if (mimetype && allowedMimeTypes.has(mimetype)) {
    return cb(null, true);
  }

  console.warn('Upload rechazado por mimetype no permitido', {
    path: req.originalUrl,
    mimetype: file.mimetype,
    filename: file.originalname,
  });

  return cb(
    createUploadError(
      'Formato de archivo no permitido',
      'UPLOAD_UNSUPPORTED_MIME_TYPE'
    )
  );
};

const resolveUploadDir = (uploadDir) => {
  const resolvedDir = path.isAbsolute(uploadDir)
    ? uploadDir
    : path.resolve(process.cwd(), uploadDir);

  fs.mkdirSync(resolvedDir, { recursive: true });
  return resolvedDir;
};

const buildFileName = (req, file, fileName) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const baseName = typeof fileName === 'function'
    ? fileName(req, file)
    : fileName;

  if (baseName && baseName.trim()) {
    return `${baseName}${ext}`;
  }

  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `image-${unique}${ext}`;
};

const removeFileIfExists = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // Ignoramos error de borrado para no ocultar el error principal de validacion.
  }
};

export const validateUploadedFileType = ({ allowedMimeTypes, allowSvg = false }) => {
  const allowedMimeTypesSet = normalizeAllowedMimeTypes(allowedMimeTypes);

  return async (req, _res, next) => {
    if (!req.file?.path) {
      return next();
    }

    try {
      const detectedType = await fileTypeFromFile(req.file.path);

      if (detectedType?.mime && allowedMimeTypesSet.has(detectedType.mime.toLowerCase())) {
        req.file.detectedMimeType = detectedType.mime;
        return next();
      }

      if (!detectedType && allowSvg && allowedMimeTypesSet.has(SVG_MIME_TYPE)) {
        const isSvg = isLikelySvgFile(req.file.path);
        if (isSvg) {
          req.file.detectedMimeType = SVG_MIME_TYPE;
          return next();
        }
      }

      await removeFileIfExists(req.file.path);

      console.warn('Upload rechazado por firma de archivo no valida', {
        path: req.originalUrl,
        filename: req.file.originalname,
        claimedMimeType: req.file.mimetype,
        detectedMimeType: detectedType?.mime || null,
      });

      return next(
        createUploadError(
          'El archivo subido no coincide con un tipo de imagen permitido',
          'UPLOAD_SIGNATURE_VALIDATION_FAILED'
        )
      );
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      await removeFileIfExists(req.file.path);

      return next(
        createUploadError(
          'No se pudo validar el archivo subido',
          'UPLOAD_SIGNATURE_VALIDATION_ERROR'
        )
      );
    }
  };
};

const uploadImages = ({
  uploadDir,
  fileName,
  allowedMimeTypes,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
}) => {
  if (!uploadDir) {
    throw new Error('uploadDir es requerido');
  }

  const resolvedDir = resolveUploadDir(uploadDir);
  const allowedMimeTypesSet = normalizeAllowedMimeTypes(allowedMimeTypes);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, resolvedDir);
    },
    filename: (req, file, cb) => {
      cb(null, buildFileName(req, file, fileName));
    },
  });

  return multer({
    storage,
    fileFilter: buildFileFilter(allowedMimeTypesSet),
    limits: { fileSize: maxFileSizeBytes },
  });
};

export default uploadImages;
