const express = require('express');
const router = express.Router();
const { uploadPackageCover } = require('../config/multer');
const {
  getPackages,
  getHomeClients,
  addPackage,
  getPackageById,
  updatePackage,
  incrementPackageClicks,
  setPackageStatus,
  deletePackage,
  getPackageWithCoupons,
  getPackageDetails,
} = require('../controllers/packages.controller');

router.get('/packages', getPackages);
router.get('/homeclients', getHomeClients);
router.post('/addpackages', uploadPackageCover.single('packageCover'), addPackage);
router.get('/package/:id', getPackageById);
router.put('/updatepackage/:id', uploadPackageCover.single('packageCover'), updatePackage);
router.post('/packageclicks/:packid', incrementPackageClicks);
router.post('/packagestatus/:packid', setPackageStatus);
router.delete('/delpackage/:id', deletePackage);
router.get('/packages/:id', getPackageWithCoupons);
router.get('/packdetails/:id', getPackageDetails);

module.exports = router;
