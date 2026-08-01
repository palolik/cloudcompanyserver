const express = require('express');
const router = express.Router();
const { customUpload } = require('../config/multer');
const {
  addCustomPackageRequest,
  getCustomPackageRequests,
  getCustomPackageRequestsByUser,
  updateCustomPackageRequest,
} = require('../controllers/customPackages.controller');

router.post('/custom-package-requests', customUpload.array('mainPics'), addCustomPackageRequest);
router.get('/custom-package-requests', getCustomPackageRequests);
router.get('/custom-package-requests/user/:userId', getCustomPackageRequestsByUser);
router.patch('/custom-package-requests/:id', updateCustomPackageRequest);

module.exports = router;
