const express = require('express');
const router = express.Router();
const { getCategory, addCategory, deleteCategory } = require('../controllers/category.controller');

// NOTE: the original file also re-registered a byte-identical GET /packages
// handler right after the category routes — that dead duplicate (Express
// already resolves /packages via the first registration in packages.routes.js)
// was dropped; see packages.controller.js's getPackages for the live one.

router.get('/category', getCategory);
router.post('/addcategory', addCategory);
router.delete('/delcategory/:id', deleteCategory);

module.exports = router;
