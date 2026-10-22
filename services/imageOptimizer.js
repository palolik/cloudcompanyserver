const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Raster formats we convert. SVG stays vector, anything else (pdf, zip, jsx…) is untouched.
const CONVERTIBLE = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/bmp',
  'image/heic',
  'image/heif',
];

const MAX_DIMENSION = 2000;
const QUALITY = 80;

const withWebpExt = (name) => {
  const ext = path.extname(name);
  return (ext ? name.slice(0, -ext.length) : name) + '.webp';
};

// Converts one multer file to an optimised webp in place: writes the new file,
// deletes the original and rewrites the multer file object so controllers see the webp.
const optimizeFile = async (file) => {
  if (!file?.path || !CONVERTIBLE.includes(file.mimetype)) return;

  const webpPath = withWebpExt(file.path);
  const tmpPath = `${webpPath}.tmp`;

  try {
    const info = await sharp(file.path, { animated: true })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(tmpPath);

    // Already-webp source that re-encoded bigger: keep the original bytes.
    if (file.mimetype === 'image/webp' && info.size >= file.size) {
      fs.unlinkSync(tmpPath);
      return;
    }

    fs.renameSync(tmpPath, webpPath);
    if (webpPath !== file.path) fs.unlinkSync(file.path);

    file.path = webpPath;
    file.filename = path.basename(webpPath);
    file.originalname = withWebpExt(file.originalname);
    file.mimetype = 'image/webp';
    file.size = info.size;
  } catch (err) {
    // Unreadable/corrupt image: keep the upload as-is rather than failing the request.
    console.error(`Image optimisation failed for ${file.originalname}:`, err.message);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
};

// Collects files from req.file, req.files (array) or req.files (fields object).
const collectFiles = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files) return Object.values(req.files).flat();
  return [];
};

const optimizeImages = async (req, res, next) => {
  try {
    await Promise.all(collectFiles(req).map(optimizeFile));
    next();
  } catch (err) {
    next(err);
  }
};

// Wraps a multer instance so every .single/.array/.fields/.any/.none middleware
// also converts uploaded images to webp once multer has written them to disk.
const withWebp = (multerInstance) => {
  const wrap = (method) => (...args) => {
    const multerMiddleware = multerInstance[method](...args);
    return (req, res, next) => {
      multerMiddleware(req, res, (err) => {
        if (err) return next(err);
        optimizeImages(req, res, next);
      });
    };
  };

  return {
    single: wrap('single'),
    array: wrap('array'),
    fields: wrap('fields'),
    any: wrap('any'),
    none: wrap('none'),
  };
};

module.exports = { optimizeImages, optimizeFile, withWebp };
