import fs from 'fs';
import path from 'path';
import multer from 'multer';

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  return cb(new Error('Solo se permiten archivos de imagen'));
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

const uploadImages = ({ uploadDir, fileName }) => {
  if (!uploadDir) {
    throw new Error('uploadDir es requerido');
  }

  const resolvedDir = resolveUploadDir(uploadDir);

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
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
};

export default uploadImages;
