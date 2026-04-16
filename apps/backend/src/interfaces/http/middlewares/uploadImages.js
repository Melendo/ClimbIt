import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';
import ffmpegPath from 'ffmpeg-static';

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const SVG_MIME_TYPE = 'image/svg+xml';
const DEFAULT_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const WEBP_MIME_TYPE = 'image/webp';
const RASTER_SOURCE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

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

const randomFileName = (extension) => `${randomUUID()}${extension}`;

const getExtensionByMimeType = (mimetype) => {
  switch (mimetype?.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case SVG_MIME_TYPE:
      return '.svg';
    default:
      return '.img';
  }
};

const runFfmpegToWebp = async ({ inputPath, outputPath, quality }) => {
  if (!ffmpegPath) {
    throw createUploadError(
      'No se encontro binario de FFmpeg para procesar la imagen',
      'UPLOAD_FFMPEG_NOT_AVAILABLE',
      500
    );
  }

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-y',
      '-i',
      inputPath,
      '-map_metadata',
      '-1',
      '-c:v',
      'libwebp',
      '-q:v',
      String(quality),
      outputPath,
    ]);

    let stderr = '';
    ffmpeg.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on('error', (error) => {
      reject(error);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `FFmpeg finalizo con codigo ${code}`));
    });
  });
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

const buildFileName = (_req, file) => {
  const ext = getExtensionByMimeType(file.mimetype) || path.extname(file.originalname).toLowerCase();
  return randomFileName(ext);
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

      if (allowSvg && allowedMimeTypesSet.has(SVG_MIME_TYPE)) {
        const detectedMime = detectedType?.mime?.toLowerCase();
        if (!detectedType || detectedMime === 'application/xml') {
          const isSvg = isLikelySvgFile(req.file.path);
          if (isSvg) {
            req.file.detectedMimeType = SVG_MIME_TYPE;
            return next();
          }
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

export const processUploadedRasterToWebp = ({ quality = 82 } = {}) => {
  return async (req, _res, next) => {
    if (!req.file?.path) {
      return next();
    }

    const detectedMimeType = req.file.detectedMimeType?.toLowerCase();

    if (!detectedMimeType || !RASTER_SOURCE_MIME_TYPES.has(detectedMimeType)) {
      return next();
    }

    const outputPath = path.join(path.dirname(req.file.path), randomFileName('.webp'));

    try {
      await runFfmpegToWebp({
        inputPath: req.file.path,
        outputPath,
        quality,
      });

      await removeFileIfExists(req.file.path);

      req.file.path = outputPath;
      req.file.filename = path.basename(outputPath);
      req.file.mimetype = WEBP_MIME_TYPE;
      req.file.detectedMimeType = WEBP_MIME_TYPE;

      return next();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      await removeFileIfExists(outputPath);
      await removeFileIfExists(req.file.path);

      return next(
        createUploadError(
          'No se pudo procesar la imagen subida',
          'UPLOAD_IMAGE_PROCESSING_FAILED',
          500
        )
      );
    }
  };
};

const uploadImages = ({
  uploadDir,
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
      cb(null, buildFileName(req, file));
    },
  });

  return multer({
    storage,
    fileFilter: buildFileFilter(allowedMimeTypesSet),
    limits: { fileSize: maxFileSizeBytes },
  });
};

export default uploadImages;
