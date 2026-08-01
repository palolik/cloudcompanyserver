const multer = require('multer');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');

const uploadDirectory = 'uploads';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// ── Package attachments (buypackage) ──
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { packageName } = req.body;
    const dirPath = path.join(projectRoot, 'uploads', packageName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ── CV uploads (applyjob) ──
const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(projectRoot, 'uploads', 'cv');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const uploadCv = multer({ storage: cvStorage });

// ── Portfolio images ──
const portfolioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(projectRoot, 'uploads', 'portfolio');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const uploadPortfolioImage = multer({ storage: portfolioStorage });

// ── Profile pictures (client/employee dp) ──
const dpStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(projectRoot, 'uploads', 'dp');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const uploaddp = multer({ storage: dpStorage });

// ── Package cover images ──
const uploadPackageCover = multer({ dest: 'uploads/packages/' });

// ── Blog uploads (cover / jsx / inline images) ──
const blogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dirPath;

    if (file.fieldname === 'coverImage') {
      dirPath = path.join(projectRoot, 'uploads', 'blogs', 'covers');
    } else if (file.fieldname === 'jsxFile') {
      dirPath = path.join(projectRoot, 'uploads', 'blogs', 'jsx');
    } else if (file.fieldname === 'blogImages') {
      dirPath = path.join(projectRoot, 'uploads', 'blogs', 'images');
    } else {
      dirPath = path.join(projectRoot, 'uploads', 'blogs');
    }

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath);
  },

  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  },
});

const blogFileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage' || file.fieldname === 'blogImages') {
    const allowedImages = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedImages.includes(file.mimetype)) {
      return cb(
        new Error('Only JPG, PNG, WEBP, and GIF images are allowed'),
        false
      );
    }
  }

  if (file.fieldname === 'jsxFile') {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== '.jsx') {
      return cb(new Error('Only JSX files are allowed'), false);
    }
  }

  cb(null, true);
};

const uploadBlog = multer({
  storage: blogStorage,
  fileFilter: blogFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const blogImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(projectRoot, 'uploads', 'blogs', 'images');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath);
  },

  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  },
});

const uploadBlogImage = multer({
  storage: blogImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedImages = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedImages.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'), false);
    }

    cb(null, true);
  },
});

// ── Client chat file attachments ──
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const orderId = req.body.orderId || 'unknown';
    const dir = path.join(projectRoot, 'uploads', 'chat', orderId);

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const uploadchatfile = multer({
  storage: chatStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
const getFileUrl = (orderId, filename) => `/uploads/chat/${orderId}/${filename}`;

// ── Employee chat file attachments ──
const estorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(projectRoot, 'uploads', 'empchat');
    fs.mkdirSync(dir, { recursive: true }); // ✅ always exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadechatfile = multer({
  storage: estorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});
const geteFileUrl = (taskId, filename) => `/uploads/empchat/${filename}`;

// ── Custom package request attachments ──
const customUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join('uploads', 'custom-requests');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

module.exports = {
  upload,
  uploadCv,
  uploadPortfolioImage,
  uploaddp,
  uploadPackageCover,
  uploadBlog,
  uploadBlogImage,
  uploadchatfile,
  getFileUrl,
  uploadechatfile,
  geteFileUrl,
  customUpload,
};
