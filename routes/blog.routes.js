const express = require('express');
const router = express.Router();
const { uploadBlog, uploadBlogImage: uploadBlogImageMiddleware } = require('../config/multer');
const {
  uploadBlogImage,
  addBlog,
  getPublicBlogs,
  getBlogDetailsBySlug,
  getBlogDetailsAdminBySlug,
  getBlogJsxBySlug,
  getBlogById,
  getAllBlogs,
  deleteBlog,
  updateBlogStatus,
} = require('../controllers/blog.controller');

router.post('/upload-blog-image', uploadBlogImageMiddleware.single('image'), uploadBlogImage);

router.post(
  '/addblog',
  uploadBlog.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'jsxFile', maxCount: 1 },
    { name: 'blogImages', maxCount: 20 },
  ]),
  addBlog
);

router.get('/publicblogs', getPublicBlogs);
router.get('/blogdetails/:slug', getBlogDetailsBySlug);
router.get('/blogdetails-admin/:slug', getBlogDetailsAdminBySlug);
router.get('/blogjsx/:slug', getBlogJsxBySlug);
router.get('/blog/:id', getBlogById);
router.get('/blogs', getAllBlogs);
router.delete('/delblog/:id', deleteBlog);
router.post('/blogstatus/:id', updateBlogStatus);

module.exports = router;
