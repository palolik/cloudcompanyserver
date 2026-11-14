const express = require('express');
const router = express.Router();
const { uploadImage } = require('../config/multer');
const requireAdmin = require('../middleware/requireAdmin');

// Admin-only generic image upload. Returns the public path of the stored (webp-optimised) file;
// the admin panel prefixes it with its base_url and saves the full URL like any pasted link.
router.post('/upload-image', requireAdmin, (req, res) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required.' });
    }
    res.json({ success: true, path: `/uploads/images/${req.file.filename}` });
  });
});

module.exports = router;
