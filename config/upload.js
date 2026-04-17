const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'images'));
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // More comprehensive image type checking
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

  const fileExt = path.extname(file.originalname).toLowerCase();
  const isValidMime = allowedMimeTypes.includes(file.mimetype);
  const isValidExt = allowedExtensions.includes(fileExt);

  // Allow if either mimetype OR extension is valid (more permissive)
  if (isValidMime || isValidExt) {
    cb(null, true);
  } else {
    console.log('Rejected file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extension: fileExt
    });
    cb(new Error(`Only image files are allowed. Received: ${file.mimetype} with extension ${fileExt}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  }
});

module.exports = upload;
